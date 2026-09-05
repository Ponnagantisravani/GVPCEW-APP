import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { getSslConfig } from '../src/utils/dbAdmin.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });
const roster = readFileSync(new URL('./student-roster.csv', import.meta.url), 'utf8').trim().split(/\r?\n/).slice(1).map(line => {
  const [roll, name, email] = line.split(',');
  return { roll, name, email: email?.trim() };
});
assert.equal(roster.length, 67, 'Review roster count before importing');
assert.equal(new Set(roster.map(row => row.roll)).size, roster.length);
assert.ok(roster.every(row => /^\d{9}(?:\d{3}|L\d{2})$/.test(row.roll) && row.name));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: getSslConfig(process.env.DATABASE_URL, process.env.DATABASE_SSL_MODE), connectionTimeoutMillis: 10000, query_timeout: 15000 });
await client.connect();
try {
  await client.query('begin');
  await client.query("select pg_advisory_xact_lock(hashtext('import-cse3-roster'))");
  let department = (await client.query("select id from departments where lower(name) in ('computer science engineering','computer science & engineering','cse') order by case when name='Computer Science Engineering' then 0 else 1 end limit 1")).rows[0];
  if (!department) department = (await client.query("insert into departments(name) values('Computer Science Engineering') returning id")).rows[0];
  let created = 0;
  for (const row of roster) {
    let student = (await client.query('select user_id from students where roll_number=$1 for update', [row.roll])).rows[0];
    if (!student) {
      // Reserved .invalid addresses are placeholders, never real student email addresses.
      const email = row.email || `${row.roll}@students.invalid`;
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
      const account = (await client.query("insert into users(full_name,email,password_hash,role) values($1,$2,$3,'student') returning id", [row.name, email, passwordHash])).rows[0];
      student = { user_id: account.id };
      await client.query("insert into students(user_id,roll_number,department_id,section,face_enrollment_status) values($1,$2,$3,'3','pending')", [account.id, row.roll, department.id]);
      created++;
    } else {
      await client.query("update students set academic_section_id=case when department_id is distinct from $2::uuid or section<>'3' then null else academic_section_id end,department_id=$2,section='3' where user_id=$1", [student.user_id, department.id]);
    }
    await client.query("insert into user_roles(user_id,role) values($1,'student') on conflict do nothing", [student.user_id]);
  }
  const { rows } = await client.query("select count(*)::int total from students s join user_roles ur on ur.user_id=s.user_id and ur.role='student' where s.department_id=$1 and s.section='3' and s.roll_number=any($2::text[])", [department.id, roster.map(row => row.roll)]);
  assert.equal(rows[0].total, roster.length);
  await client.query('commit');
  console.log(JSON.stringify({ created, existing: roster.length - created, verifiedCse3Roster: rows[0].total, missingFromRequested70: 70 - roster.length }));
} catch (error) {
  await client.query('rollback');
  console.error(`Import rolled back (${error.code || error.name}): ${error.message}`);
  process.exitCode = 1;
} finally { await client.end(); }
