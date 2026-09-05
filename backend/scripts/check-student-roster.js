import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import pg from 'pg';
import { getSslConfig } from '../src/utils/dbAdmin.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });
const roster = readFileSync(new URL('./student-roster.csv', import.meta.url), 'utf8')
  .trim().split(/\r?\n/).slice(1).map(line => {
    const [rollNumber, fullName] = line.split(',');
    return { rollNumber, fullName };
  });
assert.equal(roster.length, 67);
assert.equal(new Set(roster.map(student => student.rollNumber)).size, 67);
assert.ok(roster.every(student => /^\d{9}(?:\d{3}|L\d{2})$/.test(student.rollNumber) && student.fullName));
console.log(`Validated ${roster.length} unique student records.`);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(process.env.DATABASE_URL, process.env.DATABASE_SSL_MODE),
  connectionTimeoutMillis: 10000,
  query_timeout: 10000
});
try {
  const { rows } = await pool.query(`select s.roll_number, s.section,
    exists(select 1 from user_roles ur where ur.user_id=s.user_id and ur.role='student') as has_student_access
    from students s where s.roll_number=any($1::text[])`, [roster.map(student => student.rollNumber)]);
  console.log(JSON.stringify({ existing: rows.length, newStudents: roster.length - rows.length,
    missingStudentAccess: rows.filter(row => !row.has_student_access).length,
    existingSections: [...new Set(rows.map(row => row.section))] }));
} catch (error) {
  console.error(`Roster database check failed (${error.code || error.name}). No records were changed.`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
