import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is missing. Create backend/.env from backend/.env.example before starting the server.");
}

export const pool = new Pool({
  connectionString: env.databaseUrl
});

export async function verifyDatabaseConnection() {
  await pool.query("select 1");
}
