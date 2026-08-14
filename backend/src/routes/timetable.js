import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

export const timetableRouter = Router();
const days = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
const selectRows = `select t.id,t.academic_section_id section_id,t.day_of_week,t.start_time,t.end_time,t.status,t.entry_type,t.academic_year,
  su.code,su.name subject,u.full_name faculty,c.room_code classroom,d.name department,
  x.year_number,x.semester_number,x.section_name
  from timetable t join subjects su on su.id=t.subject_id join faculty f on f.id=t.faculty_id
  join users u on u.id=f.user_id join classrooms c on c.id=t.classroom_id
  join academic_sections x on x.id=t.academic_section_id join departments d on d.id=x.department_id`;

function timeOk(value) { return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(String(value || '')); }
async function conflict(client, entry, skipId = null) {
  const q = await client.query(`select t.id from timetable t where t.id is distinct from $1 and t.academic_section_id=$2 and t.day_of_week=$3
    and t.start_time < $5::time and t.end_time > $4::time limit 1`, [skipId, entry.sectionId, entry.dayOfWeek, entry.startTime, entry.endTime]);
  if (q.rowCount) return 'This section already has a class in that time slot.';
  const faculty = await client.query(`select id from timetable where id is distinct from $1 and faculty_id=$2 and day_of_week=$3 and start_time < $5::time and end_time > $4::time limit 1`, [skipId, entry.facultyId, entry.dayOfWeek, entry.startTime, entry.endTime]);
  if (faculty.rowCount) return 'This faculty member already has a class in that time slot.';
  const room = await client.query(`select id from timetable where id is distinct from $1 and classroom_id=$2 and day_of_week=$3 and start_time < $5::time and end_time > $4::time limit 1`, [skipId, entry.classroomId, entry.dayOfWeek, entry.startTime, entry.endTime]);
  return room.rowCount ? 'This classroom is already booked in that time slot.' : null;
}

timetableRouter.use(requireAuth);
timetableRouter.get('/student', allowRoles('student'), async (req, res) => {
  const { rows } = await pool.query(`${selectRows} where t.status='published' and t.academic_section_id=(select academic_section_id from students where user_id=$1) order by t.day_of_week,t.start_time`, [req.user.sub]);
  res.json({ timetable: rows });
});
timetableRouter.get('/faculty', allowRoles('faculty'), async (req, res) => {
  const { rows } = await pool.query(`${selectRows} where t.status='published' and t.faculty_id=(select id from faculty where user_id=$1) order by t.day_of_week,t.start_time`, [req.user.sub]);
  res.json({ timetable: rows });
});
timetableRouter.get('/coordinator', allowRoles('academic_coordinator','admin'), async (_req, res) => {
  const { rows } = await pool.query(`${selectRows} order by t.status,t.day_of_week,t.start_time`);
  res.json({ timetable: rows });
});
timetableRouter.get('/catalog', allowRoles('academic_coordinator','admin'), async (_req, res) => {
  const [sections, subjects, faculty, classrooms] = await Promise.all([
    pool.query(`select x.id,concat(d.name,' — Year ',x.year_number,' / Sem ',x.semester_number,' / ',x.section_name) label from academic_sections x join departments d on d.id=x.department_id order by d.name,x.year_number,x.section_name`),
    pool.query('select id,code,name from subjects order by code'),
    pool.query('select f.id,u.full_name,u.email from faculty f join users u on u.id=f.user_id order by u.full_name'),
    pool.query('select id,room_code from classrooms where active=true order by room_code')
  ]);
  res.json({ sections: sections.rows, subjects: subjects.rows, faculty: faculty.rows, classrooms: classrooms.rows });
});
timetableRouter.post('/sections', allowRoles('academic_coordinator','admin'), async (req, res) => {
  const { department, yearNumber, semesterNumber, sectionName, academicYear } = req.body;
  if (!department?.trim() || !Number.isInteger(Number(yearNumber)) || !Number.isInteger(Number(semesterNumber)) || !sectionName?.trim() || !academicYear?.trim()) return res.status(400).json({ message: 'Enter department, year, semester, class section, and academic year.' });
  const dept = await pool.query('select id from departments where lower(name)=lower($1)', [department.trim()]);
  if (!dept.rowCount) return res.status(400).json({ message: 'Department was not found. Add it through Academic Management first.' });
  const { rows } = await pool.query(`insert into academic_sections(department_id,year_number,semester_number,section_name,academic_year)
    values($1,$2,$3,$4,$5) on conflict(department_id,year_number,semester_number,section_name,academic_year)
    do update set section_name=excluded.section_name returning id`, [dept.rows[0].id, Number(yearNumber), Number(semesterNumber), sectionName.trim(), academicYear.trim()]);
  res.status(201).json({ id: rows[0].id });
});
timetableRouter.post('/', allowRoles('academic_coordinator','admin'), async (req, res) => {
  const entry = req.body;
  if (!entry.sectionId || !entry.subjectId || !entry.facultyId || !entry.classroomId || !Number.isInteger(Number(entry.dayOfWeek)) || !timeOk(entry.startTime) || !timeOk(entry.endTime) || entry.startTime >= entry.endTime || !entry.academicYear?.trim()) return res.status(400).json({ message: 'Provide a section, subject, faculty, room, valid day, times, and academic year.' });
  const client = await pool.connect();
  try { await client.query('begin'); const issue = await conflict(client, entry); if (issue) return res.status(409).json({ message: issue });
    const { rows } = await client.query(`insert into timetable(subject_id,faculty_id,classroom_id,academic_section_id,day_of_week,start_time,end_time,academic_year,entry_type,status) values($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft') returning id`, [entry.subjectId,entry.facultyId,entry.classroomId,entry.sectionId,Number(entry.dayOfWeek),entry.startTime,entry.endTime,entry.academicYear.trim(),entry.entryType || 'class']);
    await client.query('commit'); res.status(201).json({ id: rows[0].id });
  } catch (e) { await client.query('rollback'); throw e; } finally { client.release(); }
});
timetableRouter.post('/publish', allowRoles('academic_coordinator','admin'), async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) return res.status(400).json({ message: 'Select at least one timetable row to publish.' });
  const { rowCount } = await pool.query(`update timetable set status='published',published_at=now(),published_by=$1,updated_at=now() where id=any($2::uuid[])`, [req.user.sub, ids]);
  res.json({ published: rowCount });
});
timetableRouter.post('/import', allowRoles('academic_coordinator','admin'), async (req, res) => {
  const lines = String(req.body.csv || '').trim().split(/\r?\n/).filter(Boolean); if (lines.length < 2) return res.status(400).json({ message: 'Upload a CSV with a header and at least one row.' });
  const headers = lines.shift().split(',').map(x => x.trim().toLowerCase()); const required=['day','start_time','end_time','department','year','semester','section','subject_code','faculty_email','classroom','academic_year'];
  if (required.some(x=>!headers.includes(x))) return res.status(400).json({ message: `CSV needs columns: ${required.join(', ')}` });
  const values = lines.map(line => Object.fromEntries(line.split(',').map(x=>x.trim()).map((value,i)=>[headers[i],value])));
  const client=await pool.connect(); try { await client.query('begin'); const ids=[];
    for (const row of values) { const day=days[row.day?.toLowerCase()]; if (day === undefined || !timeOk(row.start_time) || !timeOk(row.end_time) || row.start_time >= row.end_time) throw new Error(`Invalid day or time for ${row.subject_code}.`);
      const lookup=await client.query(`select x.id section_id,s.id subject_id,f.id faculty_id,c.id classroom_id from academic_sections x join departments d on d.id=x.department_id join subjects s on s.code=$5 join faculty f on true join users u on u.id=f.user_id join classrooms c on c.room_code=$7 where lower(d.name)=lower($1) and x.year_number=$2 and x.semester_number=$3 and lower(x.section_name)=lower($4) and lower(u.email)=lower($6)`,[row.department,Number(row.year),Number(row.semester),row.section,row.subject_code,row.faculty_email,row.classroom]);
      if (!lookup.rowCount) throw new Error(`Could not match section, subject, faculty, or classroom for ${row.subject_code}.`); const x=lookup.rows[0]; const entry={sectionId:x.section_id,facultyId:x.faculty_id,classroomId:x.classroom_id,dayOfWeek:day,startTime:row.start_time,endTime:row.end_time}; const issue=await conflict(client,entry); if(issue) throw new Error(`${row.subject_code}: ${issue}`);
      const inserted=await client.query(`insert into timetable(subject_id,faculty_id,classroom_id,academic_section_id,day_of_week,start_time,end_time,academic_year,status) values($1,$2,$3,$4,$5,$6,$7,$8,'draft') returning id`,[x.subject_id,x.faculty_id,x.classroom_id,x.section_id,day,row.start_time,row.end_time,row.academic_year]); ids.push(inserted.rows[0].id);
    } await client.query('commit'); res.status(201).json({ imported:ids.length,ids });
  } catch(e) { await client.query('rollback'); res.status(400).json({message:e.message}); } finally { client.release(); }
});
