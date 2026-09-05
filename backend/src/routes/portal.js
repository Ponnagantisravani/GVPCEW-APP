import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { studentGroups } from '../config/studentGroups.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

export const portalRouter = Router();
const portalRoles = ['admin', 'faculty', 'academic_coordinator', 'student', 'student_coordinator'];
const manageableRoles = ['student', 'student_coordinator', 'faculty', 'academic_coordinator'];

portalRouter.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
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
  const { rows } = await pool.query(`select u.id,u.full_name,u.email,u.role,u.created_at,coalesce(array_agg(ur.role) filter(where ur.role is not null),'{}'::text[]) roles from users u left join user_roles ur on ur.user_id=u.id group by u.id order by u.full_name`);
  res.json({ users: rows });
});
portalRouter.patch('/users/:id/roles', requireAuth, allowRoles('admin'), async (req, res) => {
  const requestedRoles = Array.isArray(req.body?.roles)
    ? [...new Set(req.body.roles.map((value) => String(value || '').trim()).filter(Boolean))]
    : [];

  const invalidRoles = requestedRoles.filter((role) => !portalRoles.includes(role));
  if (invalidRoles.length) {
    return res.status(400).json({ message: `Invalid portal role: ${invalidRoles[0]}` });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const existingUser = await client.query('select id from users where id=$1 for update', [req.params.id]);
    if (!existingUser.rowCount) {
      await client.query('rollback');
      return res.status(404).json({ message: 'User account was not found.' });
    }

    if (req.user.sub === req.params.id && !requestedRoles.includes('admin')) {
      await client.query('rollback');
      return res.status(400).json({ message: 'You cannot remove admin access from your own account.' });
    }

    await client.query('delete from user_roles where user_id=$1', [req.params.id]);
    for (const role of requestedRoles) {
      await client.query('insert into user_roles(user_id, role) values($1, $2)', [req.params.id, role]);
    }

    const primaryRole = requestedRoles.includes('admin')
      ? 'admin'
      : requestedRoles.includes('faculty')
      ? 'faculty'
      : requestedRoles[0] || 'student';

    const { rows } = await client.query(
      `update users u
       set role=$2
       where u.id=$1
       returning u.id,u.full_name,u.email,u.role,u.created_at,
         (select array_agg(ur.role order by ur.role) from user_roles ur where ur.user_id=u.id) roles`,
      [req.params.id, primaryRole]
    );

    await client.query('commit');
    res.json({ user: rows[0] });
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
});
async function resolveStudentDepartment(client, name) {
  const normalized = name?.trim().replace(/\s+/g, ' ');
  if (!normalized) return null;
  await client.query("select pg_advisory_xact_lock(hashtext('student-department:' || lower($1)))", [normalized]);
  const existing = await client.query('select id from departments where lower(name)=lower($1)', [normalized]);
  if (existing.rows[0]) return existing.rows[0].id;
  const created = await client.query('insert into departments(name) values($1) returning id', [normalized]);
  return created.rows[0].id;
}

portalRouter.get('/admin/people', requireAuth, allowRoles('admin'), async (req, res) => {
  const role = String(req.query.role || '');
  if (!manageableRoles.includes(role)) return res.status(400).json({ message: 'Choose a valid management section.' });
  const { rows } = await pool.query(
    `select u.id,u.full_name,u.email,u.created_at,s.roll_number,s.section,case when $1='faculty' then fd.name else d.name end department,f.employee_code
     from users u
     join user_roles ur on ur.user_id=u.id and ur.role=$1
     left join students s on s.user_id=u.id
     left join departments d on d.id=s.department_id
     left join faculty f on f.user_id=u.id
     left join departments fd on fd.id=f.department_id and $1='faculty'
     order by u.full_name`,
    [role]
  );
  const departments = await pool.query('select name from departments order by name');
  res.json({ people: rows, departments: [...new Set([...studentGroups.map(group => group.department), ...departments.rows.map(row => row.name)])], groups: studentGroups });
});

portalRouter.post('/admin/people', requireAuth, allowRoles('admin'), async (req, res) => {
  const { fullName, email, password, role, rollNumber, section, employeeCode, department } = req.body || {};
  if (department !== undefined && (typeof department !== 'string' || department.trim().length > 120)) return res.status(400).json({ message: 'Provide a branch name of at most 120 characters.' });
  if (!fullName?.trim() || !email?.trim() || !password || password.length < 8 || !manageableRoles.includes(role)) {
    return res.status(400).json({ message: 'Provide name, email, a password of at least 8 characters, and a valid section.' });
  }
  if (['student', 'student_coordinator'].includes(role) && !rollNumber?.trim()) return res.status(400).json({ message: 'A roll number is required for students.' });
  if (role === 'faculty' && !employeeCode?.trim()) return res.status(400).json({ message: 'An employee code is required for faculty.' });

  const client = await pool.connect();
  try {
    await client.query('begin');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await client.query(
      `insert into users(full_name,email,password_hash,role) values($1,$2,$3,$4) returning id,full_name,email`,
      [fullName.trim(), email.trim().toLowerCase(), passwordHash, role === 'faculty' ? 'faculty' : 'student']
    );
    const userId = user.rows[0].id;
    await client.query('insert into user_roles(user_id,role,assigned_by) values($1,$2,$3)', [userId, role, req.user.sub]);
    if (['student', 'student_coordinator'].includes(role)) {
      const departmentId = await resolveStudentDepartment(client, department);
      await client.query(`insert into students(user_id,roll_number,section,department_id,face_enrollment_status) values($1,$2,$3,$4,'pending')`, [userId, rollNumber.trim(), section?.trim().toUpperCase() || 'A', departmentId]);
    }
    if (role === 'faculty') {
      const departmentId = await resolveStudentDepartment(client, department);
      await client.query('insert into faculty(user_id,employee_code,department_id) values($1,$2,$3)', [userId, employeeCode.trim(), departmentId]);
    }
    await client.query('commit');
    res.status(201).json({ person: user.rows[0] });
  } catch (error) {
    await client.query('rollback');
    if (error.code === '23505') return res.status(409).json({ message: 'That email, roll number, or employee code is already in use.' });
    throw error;
  } finally {
    client.release();
  }
});

portalRouter.patch('/admin/people/:id', requireAuth, allowRoles('admin'), async (req, res) => {
  const { fullName, email, rollNumber, section, employeeCode, department, password } = req.body || {};
  if (password && (typeof password !== 'string' || password.length < 8)) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
  if (department !== undefined && (typeof department !== 'string' || department.trim().length > 120)) return res.status(400).json({ message: 'Provide a branch name of at most 120 characters.' });
  if (!fullName?.trim() || !email?.trim()) return res.status(400).json({ message: 'Name and email are required.' });
  const client = await pool.connect();
  try {
    await client.query('begin');
    const account = await client.query('update users set full_name=$2,email=$3 where id=$1 returning id', [req.params.id, fullName.trim(), email.trim().toLowerCase()]);
    if (!account.rowCount) {
      await client.query('rollback');
      return res.status(404).json({ message: 'User account was not found.' });
    }
    if (password) await client.query('update users set password_hash=$2 where id=$1', [req.params.id, await bcrypt.hash(password, 12)]);
    if (rollNumber?.trim()) {
      const departmentId = await resolveStudentDepartment(client, department);
      const updatedStudent = await client.query(`update students set roll_number=$2,section=$3,
        academic_section_id=case when section<>$3 or ($5 and department_id is distinct from $4::uuid) then null else academic_section_id end,
        department_id=case when $5 then $4::uuid else department_id end where user_id=$1`,
        [req.params.id, rollNumber.trim(), section?.trim().toUpperCase() || 'A', departmentId, department !== undefined]);
      if (!updatedStudent.rowCount) {
        const studentRole = await client.query("select 1 from user_roles where user_id=$1 and role in ('student','student_coordinator')", [req.params.id]);
        if (studentRole.rowCount) await client.query('insert into students(user_id,roll_number,section,department_id) values($1,$2,$3,$4)', [req.params.id, rollNumber.trim(), section?.trim().toUpperCase() || '1', departmentId]);
      }
    }
    if (employeeCode?.trim()) {
      const departmentId = await resolveStudentDepartment(client, department);
      await client.query('update faculty set employee_code=$2,department_id=case when $4 then $3::uuid else department_id end where user_id=$1', [req.params.id, employeeCode.trim(), departmentId, department !== undefined]);
    }
    await client.query('commit');
    res.json({ message: 'Person updated.' });
  } catch (error) {
    await client.query('rollback');
    if (error.code === '23505') return res.status(409).json({ message: 'That email, roll number, or employee code is already in use.' });
    throw error;
  } finally {
    client.release();
  }
});

portalRouter.delete('/admin/people/:id', requireAuth, allowRoles('admin'), async (req, res) => {
  if (req.user.sub === req.params.id) return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
  const { rowCount } = await pool.query('delete from users where id=$1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ message: 'User account was not found.' });
  res.status(204).end();
});
portalRouter.get('/notices', requireAuth, async (_req, res) => {
  const { rows } = await pool.query(`select id,title,description,category,published_at,expires_at,attachment_url from notices where expires_at is null or expires_at > now() order by published_at desc`);
  res.json({ notices: rows });
});
portalRouter.get('/events', requireAuth, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`select id,title,description,category,starts_at,ends_at,location,capacity from events where starts_at > now() order by starts_at`);
    res.json({ events: rows });
  } catch (error) {
    next(error);
  }
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
