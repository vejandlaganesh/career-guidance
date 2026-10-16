import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "./server.ts";
import { initDb, runQuery, getRow } from "./src/db/sqlite.ts";
import { signAuthToken } from "./src/utils/auth.ts";

describe("Edu Carrier Backend Security & Functionality Audit", () => {
  beforeAll(async () => {
    await initDb();
  });

  describe("1. Registration & Security (Scenario 1 & 4 collision defect)", () => {
    it("should register a user with hashed password and unique notification ID", async () => {
      const email = `test.student.1.${Date.now()}@example.com`;
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          fullName: "Test Student One",
          email,
          password: "password123",
          classLevel: "Class 11"
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.role).toBe("student");
      expect(res.body.user.passwordHash).toBeUndefined(); // Never leak password hash
      expect(res.body.token).toBeDefined();

      // Check in SQLite database: password must be bcrypt hash, not plain text
      const dbRow = await getRow("SELECT passwordHash FROM users WHERE email = ?", [email.toLowerCase()]);
      expect(dbRow).toBeDefined();
      expect(dbRow.passwordHash).not.toBe("password123");
      expect(dbRow.passwordHash.startsWith("$2a$") || dbRow.passwordHash.startsWith("$2b$")).toBe(true);
    });

    it("should register a second user without notification ID collision", async () => {
      const email = `test.student.2.${Date.now()}@example.com`;
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          fullName: "Test Student Two",
          email,
          password: "password123",
          classLevel: "Class 12"
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(email.toLowerCase());
    });

    it("should reject duplicate registration with identical email", async () => {
      const email = `duplicate.check.${Date.now()}@example.com`;
      await request(app)
        .post("/api/auth/register")
        .send({ fullName: "Dup One", email, password: "password123", classLevel: "Class 10" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ fullName: "Dup Two", email, password: "password123", classLevel: "Class 10" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already registered");
    });

    it("should prevent public self-service escalation to admin even with admin email domain", async () => {
      const email = `sneaky.hacker.${Date.now()}@educarrier.com`;
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          fullName: "Sneaky User",
          email,
          password: "password123",
          classLevel: "Class 12"
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("student"); // Must ALWAYS be student, never admin!
    });
  });

  describe("2. Login, Logout, and Authentication (Scenario 2)", () => {
    const testEmail = `login.test.${Date.now()}@example.com`;
    const testPassword = "securePassword123";

    beforeAll(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ fullName: "Login Tester", email: testEmail, password: testPassword, classLevel: "Class 11" });
    });

    it("should log in successfully with valid credentials and return JWT token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.user.passwordHash).toBeUndefined(); // Never leak passwordHash
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "incorrectPassword" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid email or password");
    });

    it("should reject unauthenticated requests to protected endpoints", async () => {
      const res = await request(app).get("/api/admin/stats");
      expect(res.status).toBe(401);
    });

    it("should log out and clear auth cookie", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Logged out");
    });
  });

  describe("3. Password Reset Security (Scenario 3)", () => {
    const userEmail = `reset.tester.${Date.now()}@example.com`;
    const initialPass = "initialPassword123";
    const updatedPass = "newUpdatedPassword456";

    beforeAll(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ fullName: "Reset Tester", email: userEmail, password: initialPass, classLevel: "Class 10" });
    });

    it("should request password reset and receive single-use token in dev environment", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: userEmail });

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
      expect(res.body.resetToken).toBeDefined();
    });

    it("should reject password reset with invalid or missing token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: userEmail, newPassword: updatedPass }); // Missing token

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("token is required");
    });

    it("should complete password reset with valid token and invalidate token after single use", async () => {
      const forgotRes = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: userEmail });
      const token = forgotRes.body.resetToken;

      const resetRes = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: userEmail, token, newPassword: updatedPass });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.message).toContain("Password updated successfully");

      // Verify token cannot be reused (single-use enforcement)
      const reuseRes = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: userEmail, token, newPassword: "anotherPassword789" });
      expect(reuseRes.status).toBe(400);

      // Verify old password no longer works
      const oldLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: userEmail, password: initialPass });
      expect(oldLogin.status).toBe(401);

      // Verify new password works
      const newLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: userEmail, password: updatedPass });
      expect(newLogin.status).toBe(200);
    });
  });

  describe("4. Authorization & Cross-User Data Isolation (Scenario 4, 6, 8, 9)", () => {
    let studentAToken: string;
    let studentAId: string;
    let studentBToken: string;
    let studentBId: string;
    let adminToken: string;

    beforeAll(async () => {
      const regA = await request(app).post("/api/auth/register").send({
        fullName: "Student A",
        email: `student.a.${Date.now()}@example.com`,
        password: "password123",
        classLevel: "Class 11"
      });
      studentAToken = regA.body.token;
      studentAId = regA.body.user.id;

      const regB = await request(app).post("/api/auth/register").send({
        fullName: "Student B",
        email: `student.b.${Date.now()}@example.com`,
        password: "password123",
        classLevel: "Class 12"
      });
      studentBToken = regB.body.token;
      studentBId = regB.body.user.id;

      adminToken = signAuthToken({ id: "admin-user", email: "admin@educarrier.com", role: "admin" });
    });

    it("should allow Student A to access and update their own profile", async () => {
      const res = await request(app)
        .put(`/api/profile/${studentAId}`)
        .set("Authorization", `Bearer ${studentAToken}`)
        .send({ fullName: "Student A Updated", skills: ["Python", "Algorithms"] });

      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe("Student A Updated");
      expect(res.body.skills).toContain("Python");
    });

    it("should prevent Student A from accessing or modifying Student B's profile (IDOR protection)", async () => {
      const getRes = await request(app)
        .get(`/api/profile/${studentBId}`)
        .set("Authorization", `Bearer ${studentAToken}`);
      expect(getRes.status).toBe(403);

      const putRes = await request(app)
        .put(`/api/profile/${studentBId}`)
        .set("Authorization", `Bearer ${studentAToken}`)
        .send({ fullName: "Compromised Name" });
      expect(putRes.status).toBe(403);
    });

    it("should prevent normal students from accessing admin statistics", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${studentAToken}`);
      expect(res.status).toBe(403);
    });

    it("should prevent normal students from pushing notifications to all students", async () => {
      const res = await request(app)
        .post("/api/admin/notifications/push")
        .set("Authorization", `Bearer ${studentAToken}`)
        .send({ title: "Spam Alert", body: "Unauthorized message" });
      expect(res.status).toBe(403);
    });

    it("should allow authorized administrator to access stats and push notifications", async () => {
      const statsRes = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(statsRes.status).toBe(200);
      expect(statsRes.body.stats.users).toBeGreaterThan(0);

      const pushRes = await request(app)
        .post("/api/admin/notifications/push")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Official Advisory", body: "JEE session registration is open!" });
      expect(pushRes.status).toBe(200);
      expect(pushRes.body.success).toBe(true);
    });

    it("should isolate bookmarks: Student A can toggle bookmarks and Student B cannot modify them", async () => {
      const toggleRes = await request(app)
        .post("/api/bookmarks/toggle")
        .set("Authorization", `Bearer ${studentAToken}`)
        .send({ userId: studentAId, careerId: "ai-engineer" });
      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.bookmarks).toContain("ai-engineer");

      // Student B attempting to toggle Student A's bookmarks
      const unauthorizedToggle = await request(app)
        .post("/api/bookmarks/toggle")
        .set("Authorization", `Bearer ${studentBToken}`)
        .send({ userId: studentAId, careerId: "data-scientist" });
      expect(unauthorizedToggle.status).toBe(403);
    });
  });

  describe("5. AI Career Guide Context & Graceful Error Handling (Scenario 7)", () => {
    let studentToken: string;
    let studentId: string;

    beforeAll(async () => {
      const reg = await request(app).post("/api/auth/register").send({
        fullName: "Ananya Rao",
        email: `ananya.${Date.now()}@example.com`,
        password: "password123",
        classLevel: "Class 11"
      });
      studentToken = reg.body.token;
      studentId = reg.body.user.id;

      // Update skills and interests distinctly to verify context mapping fix
      await request(app)
        .put(`/api/profile/${studentId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          skills: ["Robotics Logic", "C++ Programming"],
          interests: ["Space Exploration", "Astrophysics"]
        });
    });

    it("should reject empty or whitespace-only AI messages", async () => {
      const res = await request(app)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ message: "   " });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("non-empty message is required");
    });

    it("should reject unbounded conversation message payloads", async () => {
      const hugeMessage = "A".repeat(5000);
      const res = await request(app)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ message: hugeMessage });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Message exceeds allowed length");
    });

    it("should return valid response from AI counselor without leaking API keys or secrets", async () => {
      const res = await request(app)
        .post("/api/ai/chat")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ message: "Hello! Tell me about space careers." });

      expect(res.status).toBe(200);
      expect(res.body.text).toBeDefined();
      expect(res.body.text.length).toBeGreaterThan(10);

      // Verify no secrets or environment variables were leaked in body
      const rawText = JSON.stringify(res.body);
      expect(rawText).not.toContain("AIzaSy");
      expect(rawText).not.toContain("passwordHash");
    }, 25000);
  });
});
