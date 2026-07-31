import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login payload" });
  }

  const { email, password } = parsed.data;
  const result = await pool.query(
    "select id, full_name, role, password_hash from users where email = $1 limit 1",
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, email, role: user.role, name: user.full_name },
    env.jwtSecret,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: { id: user.id, fullName: user.full_name, email, role: user.role }
  });
});
