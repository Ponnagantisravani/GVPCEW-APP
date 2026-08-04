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
  processedImageCount: z.number().int().min(1).optional(),
  datasetDirectory: z.string().min(1).optional(),
  enrolledAt: z.string().datetime().optional(),
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

  const {
    rollNumber,
    studentId,
    fullName,
    departmentName,
    section,
    embedding,
    sampleCount,
    processedImageCount,
    datasetDirectory,
    enrolledAt,
    metadata = {}
  } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query("begin");

    const studentResult = studentId
      ? await client.query(
          `select s.id, s.user_id, s.roll_number, s.section, d.id as department_id
           from students s
           left join departments d on d.id = s.department_id
           where s.id = $1 and s.roll_number = $2
           limit 1`,
          [studentId, rollNumber]
        )
      : await client.query(
          `select s.id, s.user_id, s.roll_number, s.section, d.id as department_id
           from students s
           left join departments d on d.id = s.department_id
           where s.roll_number = $1
           limit 1`,
          [rollNumber]
        );

    const student = studentResult.rows[0];
    if (!student) {
      await client.query("rollback");
      return res.status(404).json({ message: "Student not found" });
    }

    let departmentId = student.department_id;
    if (departmentName) {
      const departmentResult = await client.query(
        `insert into departments (name)
         values ($1)
         on conflict (name) do update set name = excluded.name
         returning id`,
        [departmentName]
      );
      departmentId = departmentResult.rows[0].id;
    }

    if (fullName) {
      await client.query(
        `update users
         set full_name = $1
         where id = $2`,
        [fullName, student.user_id]
      );
    }

    await client.query(
      `update students
       set department_id = coalesce($1, department_id),
           section = coalesce($2, section)
       where id = $3`,
      [departmentId, section || null, student.id]
    );

    const existing = await client.query(
      "select id from face_embeddings where student_id = $1 limit 1",
      [student.id]
    );

    if (existing.rows.length > 0) {
      await client.query("rollback");
      return res.status(409).json({ message: "Student is already enrolled" });
    }

    const enrollmentMetadata = {
      ...metadata,
      roll_number: rollNumber,
      full_name: fullName || null,
      department_name: departmentName || null,
      section: section || null,
      dataset_directory: datasetDirectory || null,
      captured_image_count: sampleCount,
      processed_image_count: processedImageCount ?? sampleCount,
      enrollment_timestamp: enrolledAt || new Date().toISOString(),
      reference_images: parsed.data.referenceImages || []
    };

    await client.query(
      `insert into face_embeddings (student_id, embedding, model_version)
       values ($1, $2::jsonb, $3)`,
      [student.id, JSON.stringify({
        embedding,
        sample_count: sampleCount,
        metadata: enrollmentMetadata
      }), "face_recognition_v1"]
    );

    await client.query("commit");

    res.status(201).json({
      message: "Enrollment stored successfully",
      studentId: student.id,
      sampleCount,
      processedImageCount: processedImageCount ?? sampleCount,
      enrollmentTimestamp: enrollmentMetadata.enrollment_timestamp,
      student: {
        id: student.id,
        rollNumber,
        fullName: fullName || null,
        departmentName: departmentName || null,
        section: section || null,
        datasetDirectory: datasetDirectory || null
      }
    });
  } catch (error) {
    await client.query("rollback");
    console.error("Enrollment transaction error:", error);
    return res.status(500).json({
      message: "Database transaction failed while saving enrollment"
    });
  } finally {
    client.release();
  }
}));
