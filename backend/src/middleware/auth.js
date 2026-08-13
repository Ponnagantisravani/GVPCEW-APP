import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || (req.user?.role ? [req.user.role] : []);
    if (!req.user || !roles.some((role) => userRoles.includes(role))) {
      return res.status(403).json({ message: 'You do not have access to this resource' });
    }
    next();
  };
}
