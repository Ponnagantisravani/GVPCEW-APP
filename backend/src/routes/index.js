import { Router } from "express";
import { healthRouter } from "./health.js";
import { authRouter } from "./auth.js";
import { enrollmentRouter } from "./enrollment.js";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/enrollment", enrollmentRouter);
