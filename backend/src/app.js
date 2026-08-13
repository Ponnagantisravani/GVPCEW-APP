import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { router } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  // The Vite portal runs on a different local origin (normally port 5173),
  // so browser API requests must be allowed through CORS.
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "25mb" }));
  app.use("/api/enrollment", rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false }));
  app.use(morgan("dev"));
  app.use("/api", router);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
