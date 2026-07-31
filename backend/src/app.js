import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { router } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use("/api", router);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
