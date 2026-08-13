import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

export const portalRouter = Router();
portalRouter.get('/dashboard', requireAuth, async (req, res) => {
  const role = req.query.role;
  const roles = req.user.roles || [req.user.role];
  if (!roles.includes(role)) return res.status(403).json({ message: 'This role is not assigned to your account.' });
  const [students, faculty, subjects, sessions, notices] = await Promise.all([
    pool.query('select count(*)::int total from students'), pool.query('select count(*)::int total from faculty'),
    pool.query('select count(*)::int total from subjects'), pool.query("select count(*)::int total from attendance_sessions where stopped_at is null and expires_at > now()"),
    pool.query('select count(*)::int total from notices where expires_at is null or expires_at > now()')
  ]);
  const values = { students: students.rows[0].total, faculty: faculty.rows[0].total, subjects: subjects.rows[0].total, sessions: sessions.rows[0].total, notices: notices.rows[0].total };
  res.json({ values });
});
portalRouter.get('/subjects', requireAuth, async (_req, res) => {
  const { rows } = await pool.query(`select s.id,s.code,s.name,d.name department,u.full_name faculty from subjects s left join departments d on d.id=s.department_id left join faculty f on f.id=s.faculty_id left join users u on u.id=f.user_id order by s.code`);
  res.json({ subjects: rows });
});
portalRouter.get('/timetable', requireAuth, async (_req, res) => {
  const { rows } = await pool.query(`select t.id,t.day_of_week,t.start_time,t.end_time,s.code,s.name subject,c.room_code classroom,u.full_name faculty from timetable t join subjects s on s.id=t.subject_id join classrooms c on c.id=t.classroom_id join faculty f on f.id=t.faculty_id join users u on u.id=f.user_id order by t.day_of_week,t.start_time`);
  res.json({ timetable: rows });
});
portalRouter.get('/users', requireAuth, allowRoles('admin'), async (_req, res) => {
  const { rows } = await pool.query(`select u.id,u.full_name,u.email,u.role,u.created_at,coalesce(array_agg(ur.role) filter(where ur.role is not null),array[u.role]) roles from users u left join user_roles ur on ur.user_id=u.id group by u.id order by u.full_name`);
  res.json({ users: rows });
});
portalRouter.get('/notices', requireAuth, async (_req, res) => {
  const { rows } = await pool.query(`select id,title,description,category,published_at,expires_at,attachment_url from notices where expires_at is null or expires_at > now() order by published_at desc`);
  res.json({ notices: rows });
});
portalRouter.get('/events', requireAuth, async (_req, res) => {
  const { rows } = await pool.query(`select id,title,description,category,starts_at,ends_at,location,capacity from events where starts_at > now() order by starts_at`);
  res.json({ events: rows });
});
portalRouter.post('/notices', requireAuth, allowRoles('admin','faculty','academic_coordinator','student_coordinator'), async (req, res) => {
  const { title, description, category = 'general', expiresAt = null } = req.body;
  if (!title?.trim() || !description?.trim()) return res.status(400).json({ message: 'A title and description are required.' });
  const { rows } = await pool.query(`insert into notices(title,description,category,expires_at,author_id) values($1,$2,$3,$4,$5) returning id,title,description,category,published_at,expires_at`, [title.trim(), description.trim(), category, expiresAt, req.user.sub]);
  res.status(201).json({ notice: rows[0] });
});
portalRouter.post('/events/:id/register', requireAuth, allowRoles('student'), async (req, res) => {
  const s = await pool.query('select id from students where user_id=$1', [req.user.sub]);
  if (!s.rows[0]) return res.status(404).json({ message: 'Student profile not found' });
  await pool.query('insert into event_registrations(event_id,student_id) values($1,$2) on conflict do nothing', [req.params.id, s.rows[0].id]);
  res.status(201).json({ message: 'Event registration confirmed' });
});
