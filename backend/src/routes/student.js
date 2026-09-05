import { Router } from 'express';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

export const studentRouter = Router();
studentRouter.use(requireAuth, allowRoles('student'));

async function studentId(userId) {
  const { rows } = await pool.query('select id from students where user_id = $1', [userId]);
  return rows[0]?.id;
}

studentRouter.get('/profile', async (req, res) => {
  const { rows } = await pool.query(`select u.full_name, u.email, s.roll_number, s.section, d.name department
    from students s join users u on u.id=s.user_id left join departments d on d.id=s.department_id where s.user_id=$1`, [req.user.sub]);
  if (!rows[0]) return res.status(404).json({ message: 'Student profile not found' });
  res.json({ profile: rows[0] });
});

studentRouter.get('/attendance', asyncHandler(async (req, res) => {
  const id = await studentId(req.user.sub);
  const { rows } = await pool.query(`select su.code, su.name, count(a.id)::int classes,
    count(a.id) filter (where a.status in ('present','late'))::int present,
    coalesce(round(100.0 * count(a.id) filter (where a.status in ('present','late')) / nullif(count(a.id),0), 0), 0) as percentage
    from subjects su left join attendance a on a.subject_id=su.id and a.student_id=$1 group by su.id order by su.code`, [id]);
  const overall = rows.length ? Math.round(rows.reduce((sum, r) => sum + Number(r.percentage), 0) / rows.length) : 0;
  res.json({ overall, subjects: rows });
}));

studentRouter.get('/marks', async (req, res) => {
  const id = await studentId(req.user.sub);
  const { rows } = await pool.query(`select su.code, su.name, m.examination_type, m.score, m.maximum_score,
    round(100*m.score/nullif(m.maximum_score,0),2) percentage from marks m join subjects su on su.id=m.subject_id
    where m.student_id=$1 order by su.code, m.examination_type`, [id]);
  res.json({ marks: rows, sgpa: null, cgpa: null });
});

studentRouter.get('/timetable', async (req, res) => {
  const { rows } = await pool.query(`select t.day_of_week, t.start_time, t.end_time, su.code, su.name subject,
    u.full_name faculty, c.room_code classroom from timetable t join subjects su on su.id=t.subject_id
    join faculty f on f.id=t.faculty_id join users u on u.id=f.user_id join classrooms c on c.id=t.classroom_id
    join students me on me.academic_section_id=t.academic_section_id
    where me.user_id=$1 and t.status='published' order by t.day_of_week, t.start_time`, [req.user.sub]);
  res.json({ timetable: rows });
});

studentRouter.get('/assignments', async (req, res) => {
  const id = await studentId(req.user.sub);
  const { rows } = await pool.query(`select a.id, a.title, a.description, a.deadline, su.code, su.name subject,
    case when x.id is not null then x.status when a.deadline < now() then 'late' else 'pending' end status
    from assignments a join subjects su on su.id=a.subject_id left join assignment_submissions x on x.assignment_id=a.id and x.student_id=$1
    order by a.deadline`, [id]);
  res.json({ assignments: rows });
});

studentRouter.get('/leave-requests', async (req, res) => {
  const id = await studentId(req.user.sub);
  const { rows } = await pool.query(`select id,start_date,end_date,reason,status,reviewer_note,created_at,reviewed_at from leave_requests where student_id=$1 order by created_at desc`, [id]);
  res.json({ requests: rows });
});

studentRouter.post('/leave-requests', async (req, res) => {
  const id = await studentId(req.user.sub);
  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate || !reason?.trim()) return res.status(400).json({ message: 'Start date, end date, and reason are required.' });
  if (new Date(`${endDate}T00:00:00`) < new Date(`${startDate}T00:00:00`)) return res.status(400).json({ message: 'End date cannot be before the start date.' });
  const { rows } = await pool.query(`insert into leave_requests(student_id,start_date,end_date,reason) values($1,$2,$3,$4) returning id,start_date,end_date,reason,status,created_at`, [id, startDate, endDate, reason.trim()]);
  await pool.query(`
    insert into notifications(user_id, title, body, type, link)
    select f.user_id, 'New student leave request',
      concat('A student has applied for leave from ', $2::date, ' to ', $3::date, '.'),
      'leave', '/faculty-dashboard'
    from faculty f
    join students s on s.id = $1
    where f.department_id = s.department_id`,
    [id, startDate, endDate]
  );
  res.status(201).json({ request: rows[0] });
});

studentRouter.get('/dashboard', async (req, res) => {
  const id = await studentId(req.user.sub);
  const [attendance, assignments, notices, events, notifications] = await Promise.all([
    pool.query(`select coalesce(round(100.0*count(*) filter(where status in ('present','late'))/nullif(count(*),0)),0) percentage from attendance where student_id=$1`, [id]),
    pool.query(`select count(*)::int total from assignments a left join assignment_submissions s on s.assignment_id=a.id and s.student_id=$1 where s.id is null and a.deadline >= now()`, [id]),
    pool.query(`select id,title,category,published_at from notices where expires_at is null or expires_at > now() order by published_at desc limit 4`),
    pool.query(`select id,title,category,starts_at,location from events where starts_at > now() order by starts_at limit 4`),
    pool.query(`select id,title,body,type,link,created_at,read_at from notifications where user_id=$1 order by created_at desc limit 5`, [req.user.sub])
  ]);
  res.json({ attendance: Number(attendance.rows[0].percentage), pendingAssignments: assignments.rows[0].total, notices: notices.rows, events: events.rows, notifications: notifications.rows });
});
