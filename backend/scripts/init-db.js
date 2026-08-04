import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";
import { createAdminClient, getSslConfig, parseDatabaseUrl } from "../src/utils/dbAdmin.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../../database/schema.sql");
const seedPath = path.resolve(__dirname, "../../database/seed.sql");

async function databaseExists(adminClient, databaseName) {
  const result = await adminClient.query(
    "select 1 from pg_database where datname = $1 limit 1",
    [databaseName]
  );
  return result.rowCount > 0;
}

async function runSqlFile(client, filePath) {
  const sql = await fs.readFile(filePath, "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0 && !statement.startsWith("--"));

  for (const statement of statements) {
    await client.query(statement);
  }
}

async function resetSchema(client) {
  const drops = [
    "drop table if exists audit_logs cascade",
    "drop table if exists login_logs cascade",
    "drop table if exists attendance_logs cascade",
    "drop table if exists attendance cascade",
    "drop table if exists face_embeddings cascade",
    "drop table if exists timetable cascade",
    "drop table if exists subjects cascade",
    "drop table if exists classrooms cascade",
    "drop table if exists faculty cascade",
    "drop table if exists students cascade",
    "drop table if exists users cascade",
    "drop table if exists departments cascade"
  ];

  for (const statement of drops) {
    await client.query(statement);
  }
}

export async function bootstrapDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing in backend/.env");
  }

  const target = parseDatabaseUrl(databaseUrl);
  const adminClient = await createAdminClient(databaseUrl, "postgres");
  await adminClient.connect();

  try {
    const exists = await databaseExists(adminClient, target.database);
    if (!exists) {
      await adminClient.query(`create database "${target.database}"`);
      console.log(`Created database ${target.database}`);
    } else {
      console.log(`Database ${target.database} already exists`);
    }
  } finally {
    await adminClient.end();
  }

  const appClient = new Client({
    host: target.host,
    port: target.port,
    user: target.user,
    password: target.password,
    database: target.database,
    ssl: getSslConfig(databaseUrl)
  });

  await appClient.connect();
  try {
    await resetSchema(appClient);
    await runSqlFile(appClient, schemaPath);
    await runSqlFile(appClient, seedPath);
    console.log("Schema and seed loaded successfully");
  } finally {
    await appClient.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith("init-db.js")) {
  bootstrapDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
