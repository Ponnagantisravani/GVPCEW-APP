import { Router } from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const enrollmentRouter = Router();

const lookupSchema = z.object({
  rollNumber: z.string().min(1)
});

const uploadSchema = z.object({
  rollNumber: z.string().min(1),
  studentId: z.string().uuid().optional(),
  fullName: z.string().min(1).optional(),
  departmentName: z.string().min(1).optional(),
  section: z.string().min(1).optional(),
  embedding: z.array(z.number()).min(32),
  sampleCount: z.number().int().min(1),
  referenceImages: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

enrollmentRouter.post("/lookup", asyncHandler(async (req, res) => {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid roll number" });
  }

  const { rollNumber } = parsed.data;
  let result;
  try {
    result = await pool.query(
      `select s.id as student_id, s.roll_number, s.section, s.admission_number,
              u.full_name, u.email, d.name as department_name
       from students s
       join users u on u.id = s.user_id
       left join departments d on d.id = s.department_id
       where s.roll_number = $1
       limit 1`,
      [rollNumber]
    );
  } catch (error) {
    console.error("Enrollment lookup database error:", error);
    return res.status(500).json({
      message: "Database error while looking up the student"
    });
  }

  const student = result.rows[0];
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json({ student });
}));

enrollmentRouter.post("/upload", asyncHandler(async (req, res) => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid enrollment payload" });
  }

  const { rollNumber, studentId, embedding, sampleCount, metadata = {} } = parsed.data;
  let studentResult;
  try {
    studentResult = studentId
      ? await pool.query("select id from students where id = $1 and roll_number = $2 limit 1", [studentId, rollNumber])
      : await pool.query("select id from students where roll_number = $1 limit 1", [rollNumber]);
  } catch (error) {
    console.error("Enrollment upload database error:", error);
    return res.status(500).json({
      message: "Database error while validating the student"
    });
  }

  const student = studentResult.rows[0];
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  let existing;
  try {
    existing = await pool.query(
      "select id from face_embeddings where student_id = $1 limit 1",
      [student.id]
    );
  } catch (error) {
    console.error("Duplicate enrollment check error:", error);
    return res.status(500).json({
      message: "Database error while checking duplicate enrollment"
    });
  }

  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "Student is already enrolled" });
  }

  try {
    await pool.query(
      `insert into face_embeddings (student_id, embedding, model_version)
       values ($1, $2::jsonb, $3)`,
      [student.id, JSON.stringify({
        embedding,
        sample_count: sampleCount,
        metadata,
        reference_images: parsed.data.referenceImages || []
      }), "face_recognition_v1"]
    );
  } catch (error) {
    console.error("Enrollment insert error:", error);
    return res.status(500).json({
      message: "Database error while saving enrollment"
    });
  }

  res.status(201).json({
    message: "Embedding stored successfully",
    studentId: student.id,
    sampleCount
  });
}));
