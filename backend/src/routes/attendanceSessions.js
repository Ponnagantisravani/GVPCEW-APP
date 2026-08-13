import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../config/db.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

export const attendanceSessionRouter = Router();
attendanceSessionRouter.use(requireAuth);

attendanceSessionRouter.post('/start', allowRoles('faculty', 'student_coordinator'), async (req, res) => {
  const { subjectId, section, durationMinutes = 8 } = req.body;
  if (!subjectId || !section || !Number.isInteger(Number(durationMinutes)) || durationMinutes < 1 || durationMinutes > 30) return res.status(400).json({ message: 'Subject, section, and a 1–30 minute duration are required.' });
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  const { rows } = await pool.query(`insert into attendance_sessions(coordinator_user_id,subject_id,section,session_code,expires_at) values($1,$2,$3,$4,now()+($5 || ' minutes')::interval) returning id,session_code,expires_at`, [req.user.sub, subjectId, section, code, String(durationMinutes)]);
  res.status(201).json({ session: rows[0] });
});
attendanceSessionRouter.get('/active', allowRoles('faculty', 'student_coordinator'), async (req, res) => {
  const { rows } = await pool.query(`select s.id,s.session_code,s.section,s.expires_at,s.stopped_at,su.code,su.name subject from attendance_sessions s join subjects su on su.id=s.subject_id where s.coordinator_user_id=$1 and s.stopped_at is null and s.expires_at>now() order by s.created_at desc`, [req.user.sub]);
  res.json({ sessions: rows });
});
attendanceSessionRouter.post('/:id/stop', allowRoles('faculty', 'student_coordinator'), async (req, res) => {
  const result = await pool.query(`update attendance_sessions set stopped_at=now() where id=$1 and coordinator_user_id=$2 and stopped_at is null returning id`, [req.params.id, req.user.sub]);
  if (!result.rowCount) return res.status(404).json({ message: 'Active attendance session not found.' });
  res.json({ message: 'Attendance session stopped.' });
});
