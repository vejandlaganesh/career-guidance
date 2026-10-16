import { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../utils/auth.ts";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Require valid JWT authentication token via:
 * 1. Authorization: Bearer <token>
 * 2. Or auth_token cookie
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  const decoded = verifyAuthToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }

  req.user = decoded;
  next();
}

/**
 * Restrict endpoint strictly to verified administrator accounts
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Administrator privileges required." });
    }
    next();
  });
}

/**
 * Verify user can access only their own resource, unless they are an admin
 */
export function requireSelfOrAdmin(paramKey: string = "userId") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      const targetUserId = req.params[paramKey] || req.body[paramKey];
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (req.user.role === "admin" || req.user.id === targetUserId) {
        return next();
      }

      return res.status(403).json({ error: "Forbidden: You cannot access or modify another user's data." });
    });
  };
}
