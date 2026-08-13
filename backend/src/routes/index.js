import { Router } from "express";
import { healthRouter } from "./health.js";
import { authRouter } from "./auth.js";
import { enrollmentRouter } from "./enrollment.js";
import { datasetRouter } from "./dataset.js";
import { studentRouter } from './student.js';
import { portalRouter } from './portal.js';
import { attendanceSessionRouter } from './attendanceSessions.js';

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/enrollment", enrollmentRouter);
router.use("/dataset", datasetRouter);
router.use('/students', studentRouter);
router.use('/', portalRouter);
router.use('/attendance-sessions', attendanceSessionRouter);
