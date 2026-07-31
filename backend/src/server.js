import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { verifyDatabaseConnection } from "./config/db.js";
import { bootstrapDatabase } from "../scripts/init-db.js";

const app = createApp();

async function start() {
  try {
    await bootstrapDatabase();
    await verifyDatabaseConnection();
    app.listen(env.port, () => {
      console.log(`Backend listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start backend.");
    console.error(error);
    process.exit(1);
  }
}

start();
