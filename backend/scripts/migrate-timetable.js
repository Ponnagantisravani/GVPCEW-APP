import dotenv from 'dotenv';
import pg from 'pg';
import { getSslConfig } from '../src/utils/dbAdmin.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing in backend/.env');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: getSslConfig(process.env.DATABASE_URL, process.env.DATABASE_SSL_MODE || '') });
await client.connect();
try {
  await client.query(`create table if not exists academic_sections (
    id uuid primary key default gen_random_uuid(), department_id uuid not null references departments(id),
    year_number integer not null check(year_number between 1 and 4), semester_number integer not null check(semester_number between 1 and 8),
    section_name text not null, academic_year text not null,
    unique(department_id,year_number,semester_number,section_name,academic_year)
  )`);
  await client.query('alter table students add column if not exists academic_section_id uuid references academic_sections(id)');
  await client.query("alter table timetable add column if not exists academic_section_id uuid references academic_sections(id)");
  await client.query("alter table timetable add column if not exists status text not null default 'draft' check(status in ('draft','published'))");
  await client.query('alter table timetable add column if not exists published_at timestamptz');
  await client.query('alter table timetable add column if not exists published_by uuid references users(id)');
  await client.query('alter table timetable add column if not exists updated_at timestamptz not null default now()');
  await client.query("alter table timetable add column if not exists entry_type text not null default 'class' check(entry_type in ('class','lab','break','library','counselling','other'))");
  await client.query('create index if not exists idx_timetable_section_published on timetable(academic_section_id,status,day_of_week,start_time)');
  await client.query('create index if not exists idx_timetable_faculty_published on timetable(faculty_id,status,day_of_week,start_time)');
  console.log('Centralized timetable migration completed.');
} finally { await client.end(); }
