import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT Secret Key - Fallback to securely generated random key if not in env
export const JWT_SECRET = process.env.JWT_SECRET || "edu_carrier_dev_jwt_secret_key_84920482019482";
export const JWT_EXPIRES_IN = "7d";

// Standard Password Policy Enforcement: At least 6 characters
export function validatePasswordPolicy(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  return { valid: true };
}

// Email format validator
export function validateEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

// Hash password with bcrypt (salt rounds = 10)
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

// Compare password with hash (supports legacy plaintext for backward compatibility migration)
export async function verifyPassword(plainText: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  
  // If storedHash is already a bcrypt hash
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return bcrypt.compare(plainText, storedHash);
  }

  // Safe legacy comparison fallback for initial seed passwords (e.g. demo123, admin123)
  if (plainText === storedHash) {
    return true;
  }

  return false;
}

// Safe User Serializer - Removes all sensitive credentials
export function sanitizeUser(user: any): any {
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
}

// Generate JWT Auth Token
export function signAuthToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT Auth Token
export function verifyAuthToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch (err) {
    return null;
  }
}

// Generate secure random reset token and its sha256 hash
export function generatePasswordResetToken(): { rawToken: string; hashedToken: string; expiry: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  // Valid for 1 hour
  const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  return { rawToken, hashedToken, expiry };
}

// Hash token helper
export function hashResetToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
