import dotenv from 'dotenv';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { getSslConfig } from '../src/utils/dbAdmin.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: getSslConfig(process.env.DATABASE_URL, process.env.DATABASE_SSL_MODE || '') });
try {
  await client.connect();
  await client.query(await readFile(new URL('../../database/syllabus.sql', import.meta.url), 'utf8'));
  if (process.argv[2]) {
    const pdf = await readFile(process.argv[2]);
    if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('Expected a PDF document');
    await client.query(`insert into syllabi (title, department, batch, description, file_name, pdf)
      select $1, $2, $3, $4, $5, $6 where not exists (select 1 from syllabi where file_name=$5)`,
    ['B.Tech. CSE — Four Year Scheme and Syllabi', 'CSE', '2024–25 onwards',
      'Autonomous course structure and detailed syllabi for all four years. Includes semester course codes, categories, lecture/practical hours, internal and external marks, credits, electives and project work.',
      'CSE AUTONOMOUS FOUR YEAR SYLLABUS.pdf', pdf]);
  }
  console.log('Syllabus migration complete. Reference document, if supplied, is saved as a draft.');
} finally { await client.end(); }
