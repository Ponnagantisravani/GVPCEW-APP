import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/db.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const syllabusRouter = Router();
const editors = ['academic_coordinator', 'admin'];
const isEditor = req => (req.user.roles || [req.user.role]).some(role => editors.includes(role));
const fields = 'id, title, department, batch, description, file_name, structure, status, created_at, published_at';
const numberCell = z.string().max(12).regex(/^(?:\d+(?:\.\d+)?|-)?$/);
const courseSchema = z.object({
  code: z.string().trim().max(40), category: z.string().trim().max(30), title: z.string().trim().min(1).max(250),
  l: numberCell, p: numberCell, internal: numberCell, external: numberCell, total: numberCell, credits: numberCell,
  objectives: z.string().max(12000).default(''), outcomes: z.string().max(12000).default(''),
  units: z.string().max(30000).default(''), references: z.string().max(12000).default('')
});
const structureSchema = z.object({ semesters: z.array(z.object({
  name: z.string().trim().min(1).max(100), courses: z.array(courseSchema).min(1).max(60)
})).min(1).max(12) });
const schema = z.object({
  title: z.string().trim().min(1).max(180), department: z.string().trim().min(1).max(100),
  batch: z.string().trim().min(1).max(100), description: z.string().trim().max(3000).default(''),
  file_name: z.string().trim().min(1).max(200).optional(), pdf: z.string().min(1).max(28_000_000).optional(),
  structure: structureSchema.optional()
}).refine(data => Boolean(data.structure) !== Boolean(data.pdf && data.file_name));
syllabusRouter.use(requireAuth, allowRoles(...editors, 'student', 'student_coordinator'));
syllabusRouter.param('id', (req, res, next, id) => {
  if (!z.string().uuid().safeParse(id).success) return res.status(400).json({ message: 'Invalid syllabus ID.' });
  next();
});

syllabusRouter.get('/', asyncHandler(async (req, res) => {
  const manage = req.query.manage === 'true' && isEditor(req);
  const { rows } = await pool.query(`select ${fields} from syllabi where ($1 or status='published') order by created_at desc`, [manage]);
  res.json({ syllabi: rows });
}));

syllabusRouter.get('/:id/pdf', asyncHandler(async (req, res) => {
  const { rows } = await pool.query("select pdf from syllabi where id=$1 and ($2 or status='published')", [req.params.id, isEditor(req)]);
  if (!rows[0]?.pdf) return res.status(404).json({ message: 'PDF not found or unavailable to you.' });
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="syllabus.pdf"', 'Cache-Control': 'private, no-store' });
  res.send(rows[0].pdf);
}));

async function save(req, res) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Complete the title, department and batch. Each semester needs a named course; hours, marks and credits must be nonnegative numbers, blank or a dash. Attach a PDF or provide a course structure.' });
  const data = parsed.data;
  const pdf = data.structure ? null : Buffer.from(data.pdf, 'base64');
  if (pdf && (pdf.length > 15 * 1024 * 1024 || pdf.subarray(0, 5).toString() !== '%PDF-')) {
    return res.status(400).json({ message: 'Upload a valid PDF no larger than 15 MB.' });
  }
  const values = [data.title, data.department, data.batch, data.description, data.structure ? null : data.file_name, pdf, data.structure || null];
  const { rows } = req.params.id
    ? await pool.query(`update syllabi set title=$1,department=$2,batch=$3,description=$4,file_name=$5,pdf=$6,structure=$7
        where id=$8 and status='draft' returning ${fields}`, [...values, req.params.id])
    : await pool.query(`insert into syllabi (title,department,batch,description,file_name,pdf,structure,created_by)
        values ($1,$2,$3,$4,$5,$6,$7,$8) returning ${fields}`, [...values, req.user.sub]);
  if (!rows[0]) return res.status(409).json({ message: 'Only drafts can be edited. Refresh and create a revision of a published syllabus.' });
  res.status(req.params.id ? 200 : 201).json({ syllabus: rows[0] });
}
syllabusRouter.post('/', allowRoles(...editors), asyncHandler(save));
syllabusRouter.put('/:id', allowRoles(...editors), asyncHandler(save));

syllabusRouter.post('/:id/publish', allowRoles(...editors), asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const { rows } = await client.query(`update syllabi set status='published', published_at=now()
      where id=$1 and status='draft' returning ${fields}`, [req.params.id]);
    if (!rows[0]) {
      await client.query('rollback');
      return res.status(409).json({ message: 'This draft no longer exists or has already been published. Refresh the list.' });
    }
    await client.query(`insert into notifications(user_id,title,body,type,link)
      select distinct user_id, $1, $2, 'syllabus', '/student-dashboard' from students where user_id is not null`,
    ['New syllabus published', `${rows[0].title} (${rows[0].department}, ${rows[0].batch}) is available in the Syllabus menu.`]);
    await client.query('commit');
    res.json({ syllabus: rows[0] });
  } catch (error) { await client.query('rollback'); throw error; }
  finally { client.release(); }
}));
