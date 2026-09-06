create table if not exists syllabi (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  batch text not null,
  description text not null default '',
  file_name text not null,
  pdf bytea not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

alter table syllabi alter column pdf drop not null;
alter table syllabi alter column file_name drop not null;
alter table syllabi add column if not exists structure jsonb;
