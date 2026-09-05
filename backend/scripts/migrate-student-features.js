import dotenv from "dotenv";
import pg from "pg";
import { getSslConfig } from "../src/utils/dbAdmin.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in backend/.env");
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(process.env.DATABASE_URL, process.env.DATABASE_SSL_MODE || "")
});

await client.connect();
try {
  await client.query("create extension if not exists pgcrypto");
  await client.query(`create table if not exists marks (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    subject_id uuid not null references subjects(id) on delete cascade,
    examination_type text not null check (examination_type in ('assignment','internal','mid_1','mid_2','semester')),
    score numeric(6,2) not null check (score >= 0),
    maximum_score numeric(6,2) not null check (maximum_score > 0),
    created_by uuid references faculty(id),
    updated_at timestamptz not null default now(),
    unique(student_id, subject_id, examination_type)
  )`);
  await client.query(`create table if not exists assignments (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid not null references subjects(id) on delete cascade,
    faculty_id uuid not null references faculty(id),
    title text not null,
    description text,
    deadline timestamptz not null,
    attachment_url text,
    created_at timestamptz not null default now()
  )`);
  await client.query(`create table if not exists assignment_submissions (
    id uuid primary key default gen_random_uuid(),
    assignment_id uuid not null references assignments(id) on delete cascade,
    student_id uuid not null references students(id) on delete cascade,
    submission_url text not null,
    submitted_at timestamptz not null default now(),
    status text not null default 'submitted' check (status in ('submitted','late','reviewed')),
    unique(assignment_id, student_id)
  )`);
  await client.query(`create table if not exists leave_requests (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    start_date date not null,
    end_date date not null,
    reason text not null,
    status text not null default 'pending' check (status in ('pending','approved','rejected')),
    reviewer_note text,
    reviewed_by uuid references users(id) on delete set null,
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    check (end_date >= start_date)
  )`);
  await client.query(`create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    title text not null,
    body text not null,
    type text not null default 'info',
    link text,
    read_at timestamptz,
    created_at timestamptz not null default now()
  )`);
  await client.query("create index if not exists idx_marks_student on marks(student_id)");
  await client.query("create index if not exists idx_assignments_deadline on assignments(deadline)");
  await client.query("create index if not exists idx_leave_requests_student on leave_requests(student_id, created_at desc)");
  await client.query("create index if not exists idx_leave_requests_status on leave_requests(status, created_at desc)");
  await client.query("create index if not exists idx_notifications_user_unread on notifications(user_id) where read_at is null");
  console.log("Student portal tables are ready.");
} finally {
  await client.end();
}
