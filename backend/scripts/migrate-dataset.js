import { pool } from "../src/config/db.js";

const sql = `
create extension if not exists pgcrypto;
create table if not exists dataset_images (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references students(id) on delete cascade,
 roll_number text not null, original_name text not null, storage_key text not null unique,
 checksum text not null unique, content_type text not null check (content_type in ('image/jpeg','image/png')),
 byte_size integer not null check (byte_size > 0), created_at timestamptz not null default now());
create index if not exists idx_dataset_images_roll_number on dataset_images(roll_number);`;

try { await pool.query(sql); console.log("Dataset migration complete"); }
finally { await pool.end(); }
