import crypto from "crypto";
import { env } from "../config/env.js";

function matches(received, expected) {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function requireEnrollmentKey(req, res, next) {
  if (!matches(req.get("x-enrollment-key"), env.enrollmentApiKey)) return res.status(401).json({ message: "Invalid enrollment credential" });
  next();
}

export function requireDatasetAdminKey(req, res, next) {
  if (!matches(req.get("x-dataset-admin-key"), env.datasetAdminApiKey)) return res.status(401).json({ message: "Invalid dataset admin credential" });
  next();
}
