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

export function getSslConfig(databaseUrl, sslMode = process.env.DATABASE_SSL_MODE || "") {
  const normalizedMode = sslMode.trim().toLowerCase();

  if (normalizedMode === "disable" || normalizedMode === "false" || normalizedMode === "off") {
    return false;
  }

  if (normalizedMode === "require" || normalizedMode === "true" || normalizedMode === "on") {
    return { rejectUnauthorized: false };
  }

  const { hostname } = new URL(databaseUrl);
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return false;
  }

  return { rejectUnauthorized: false };
}

export async function createAdminClient(databaseUrl, databaseName = "postgres") {
  const config = parseDatabaseUrl(databaseUrl);
  return new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: databaseName,
    ssl: getSslConfig(databaseUrl)
  });
}
