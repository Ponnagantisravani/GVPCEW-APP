import pg from "pg";

const { Client } = pg;

export function parseDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "")
  };
}

export async function createAdminClient(databaseUrl, databaseName = "postgres") {
  const config = parseDatabaseUrl(databaseUrl);
  return new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: databaseName
  });
}
