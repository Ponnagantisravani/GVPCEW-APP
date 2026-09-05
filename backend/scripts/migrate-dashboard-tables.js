import dotenv from 'dotenv';
import pg from 'pg';
import { getSslConfig } from '../src/utils/dbAdmin.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing in backend/.env');

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(process.env.DATABASE_URL, process.env.DATABASE_SSL_MODE || '')
});

await client.connect();
try {
  await client.query(`create table if not exists attendance_sessions (
    id uuid primary key default gen_random_uuid(),
    coordinator_user_id uuid not null references users(id),
    subject_id uuid not null references subjects(id),
    section text not null,
    session_code text not null unique,
    starts_at timestamptz not null default now(),
    expires_at timestamptz,
    stopped_at timestamptz,
    created_at timestamptz not null default now()
  )`);
  await client.query(`create table if not exists notices (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    category text not null default 'general',
    published_at timestamptz not null default now(),
    expires_at timestamptz,
    attachment_url text,
    author_id uuid references users(id)
  )`);
  await client.query(`create table if not exists events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    category text not null,
    starts_at timestamptz not null,
    ends_at timestamptz,
    location text,
    capacity integer check (capacity > 0),
    created_at timestamptz not null default now()
  )`);
  console.log('Dashboard tables are ready.');
} finally {
  await client.end();
}
