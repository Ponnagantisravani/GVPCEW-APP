import dotenv from 'dotenv';
import pg from 'pg';
import { getSslConfig } from '../src/utils/dbAdmin.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing in backend/.env');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: getSslConfig(process.env.DATABASE_URL, process.env.DATABASE_SSL_MODE || '') });
await client.connect();
try {
  await client.query(`alter table students add column if not exists face_enrollment_status text not null default 'pending' check (face_enrollment_status in ('pending','completed'))`);
  await client.query(`alter table students add column if not exists face_enrolled_at timestamptz`);
  await client.query(`update students set face_enrollment_status='completed', face_enrolled_at=coalesce(face_enrolled_at, now()) where roll_number='324103210170'`);
  await client.query(`update users set password_hash='$2a$10$FW3u1vPb4vfOBhc1G85iBuaXcgrjTJdK46HIUuX9DDu9ZcWcCqNc6' where email='student1@gvpcew.ac.in'`);
  console.log('Portal authentication migration completed.');
} finally {
  await client.end();
}
