import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const email = '324103210170.sravani@gvpcew.ac.in';
const roles = ['admin', 'faculty', 'academic_coordinator', 'student', 'student_coordinator'];

async function run() {
  await pool.query(`create table if not exists user_roles (
    user_id uuid not null references users(id) on delete cascade,
    role text not null check (role in ('admin','faculty','academic_coordinator','student','student_coordinator')),
    assigned_at timestamptz not null default now(),
    assigned_by uuid references users(id) on delete set null,
    primary key (user_id, role)
  )`);
  await pool.query(`insert into user_roles(user_id,role) select id,role from users on conflict do nothing`);
  const passwordHash = await bcrypt.hash('123456789', 12);
  const user = await pool.query(`update users set full_name=$1,password_hash=$2,role='admin' where email=$3 returning id`, ['Sravani GVPCEW', passwordHash, email]);
  if (!user.rowCount) throw new Error(`No user exists for ${email}. Register the account first, then run this script again.`);
  for (const role of roles) await pool.query(`insert into user_roles(user_id,role) values($1,$2) on conflict do nothing`, [user.rows[0].id, role]);
  console.log(`Assigned ${roles.join(', ')} to ${email}`);
}
run().catch(error=>{console.error(error.message);process.exitCode=1}).finally(()=>pool.end());
