create extension if not exists pgcrypto;

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'faculty', 'student')),
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  department_id uuid references departments(id),
  roll_number text not null unique,
  section text not null default 'A',
  admission_number text unique,
  created_at timestamptz not null default now()
);

create table if not exists faculty (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  department_id uuid references departments(id),
  employee_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists classrooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  building_name text not null,
  room_name text not null,
  active boolean not null default true
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references departments(id),
  code text not null unique,
  name text not null,
  faculty_id uuid references faculty(id)
);

create table if not exists timetable (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  classroom_id uuid not null references classrooms(id),
  faculty_id uuid not null references faculty(id),
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  academic_year text not null
);

create table if not exists face_embeddings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references students(id) on delete cascade,
  embedding jsonb not null,
  model_version text not null default 'face_recognition_v1',
  created_at timestamptz not null default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id),
  faculty_id uuid not null references faculty(id),
  classroom_id uuid not null references classrooms(id),
  status text not null check (status in ('present', 'absent', 'late')),
  attendance_date date not null default current_date,
  marked_at timestamptz not null default now(),
  unique (student_id, subject_id, attendance_date)
);

create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid references attendance(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  ip_address inet,
  user_agent text,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  entity_name text not null,
  entity_id uuid,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_attendance_student on attendance(student_id);
create index if not exists idx_attendance_subject on attendance(subject_id);
create index if not exists idx_attendance_marked_at on attendance(marked_at);
