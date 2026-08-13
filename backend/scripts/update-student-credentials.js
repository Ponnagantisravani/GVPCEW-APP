import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcryptjs";

dotenv.config({ path: new URL("../.env", import.meta.url) });
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL_MODE === "require" ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
  query_timeout: 10000
});

const client = await pool.connect();
try {
  await client.query("begin");
  const existing = await client.query("select id, full_name, email from users where email = $1", ["324103210170.sravani@gvpcew.ac.in"]);
  const existingStudents = await client.query("select s.roll_number, s.id from students s where s.user_id = $1", [existing.rows[0]?.id || "00000000-0000-0000-0000-000000000000"]);
  console.log(JSON.stringify({ existingEmailAccount: existing.rows, existingStudents: existingStudents.rows }));
  const student = await client.query(
    "select s.id, s.user_id from students s where s.roll_number = $1 for update",
    ["324103210170"]
  );
  if (!student.rowCount) throw new Error("Student record not found");

  const passwordHash = await bcrypt.hash("123456789", 12);
  if (existing.rows.length && existing.rows[0].id !== student.rows[0].user_id) {
    await client.query("update users set email = $1 where id = $2", [`orphan-${existing.rows[0].id}@invalid.local`, existing.rows[0].id]);
  }
  await client.query(
    "update users set email = $1, password_hash = $2 where id = $3",
    ["324103210170.sravani@gvpcew.ac.in", passwordHash, student.rows[0].user_id]
  );
  const dataset = await client.query(
    "select count(*)::int as count from dataset_images where student_id = $1 or roll_number = $2",
    [student.rows[0].id, "324103210170"]
  );
  await client.query("commit");
  console.log(JSON.stringify({ updated: true, datasetImages: dataset.rows[0].count }));
} catch (error) {
  await client.query("rollback").catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
