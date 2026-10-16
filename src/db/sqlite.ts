import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "database.sqlite");
const JSON_DB_FILE = path.join(process.cwd(), "data-store.json");

let dbInstance: Database.Database | null = null;

// Helper to open the SQLite database using better-sqlite3 synchronous API
export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("foreign_keys = ON");
  }
  return dbInstance;
}

// Synchronous wrapper to execute standard SQLite statements
export function runQuerySync(sql: string, params: any[] = []): { lastID?: number | bigint; changes: number } {
  const db = getDb();
  if (!params || params.length === 0) {
    db.exec(sql);
    return { changes: 1 };
  }
  const stmt = db.prepare(sql);
  const sanitized = params.map((p) => (p === undefined ? null : p));
  const result = stmt.run(...sanitized);
  return {
    lastID: result.lastInsertRowid,
    changes: Number(result.changes),
  };
}

// Synchronous wrapper to fetch a single row from a SELECT query
export function getRowSync<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDb();
  const stmt = db.prepare(sql);
  const sanitized = params.map((p) => (p === undefined ? null : p));
  const row = stmt.get(...sanitized);
  return (row as T) || null;
}

// Synchronous wrapper to fetch multiple rows from a SELECT query
export function getAllRowsSync<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  const sanitized = params.map((p) => (p === undefined ? null : p));
  const rows = stmt.all(...sanitized);
  return (rows as T[]) || [];
}

// Async wrapper to execute standard SQLite statements (backward compatible with server.ts)
export async function runQuery(sql: string, params: any[] = []): Promise<{ lastID?: number | bigint; changes: number }> {
  return runQuerySync(sql, params);
}

// Async wrapper to fetch a single row from a SELECT query
export async function getRow<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  return getRowSync<T>(sql, params);
}

// Async wrapper to fetch multiple rows from a SELECT query
export async function getAllRows<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return getAllRowsSync<T>(sql, params);
}

// Initialize tables and migrate existing JSON data if needed
export async function initDb(): Promise<void> {
  console.log("Initializing SQLite relational database tables via better-sqlite3...");
  
  // Enable foreign keys
  await runQuery("PRAGMA foreign_keys = ON;");

  // Create users table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      classLevel TEXT NOT NULL,
      interests TEXT NOT NULL, -- JSON string
      skills TEXT NOT NULL, -- JSON string
      preferredSubjects TEXT NOT NULL, -- JSON string
      careerInterests TEXT NOT NULL, -- JSON string
      role TEXT NOT NULL DEFAULT 'student',
      registeredAt TEXT NOT NULL
    )
  `);

  // Create saved_careers table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS saved_careers (
      userId TEXT NOT NULL,
      careerId TEXT NOT NULL,
      PRIMARY KEY (userId, careerId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create quiz_attempts table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      answers TEXT NOT NULL, -- JSON string
      vector TEXT NOT NULL, -- JSON string
      timestamp TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create conversations table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create notifications table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      activityId TEXT,
      activityType TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create custom_activities table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS custom_activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      targetAudience TEXT,
      status TEXT,
      createdAt TEXT NOT NULL,
      completions TEXT NOT NULL, -- JSON string of userIds
      participants TEXT NOT NULL, -- JSON string of userIds
      results TEXT NOT NULL -- JSON string of result objects
    )
  `);

  // Create system_config table for custom datasets (Careers, Streams, etc.) and AI configuration
  await runQuery(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  console.log("SQL Database tables ensured successfully via better-sqlite3!");

  // --- AUTOMATIC DATA MIGRATION GATE ---
  // If JSON data-store file exists, and users table is empty, we migrate everything to SQL!
  const usersCount = await getRow<{ count: number }>("SELECT COUNT(*) as count FROM users");
  if (usersCount && usersCount.count === 0 && fs.existsSync(JSON_DB_FILE)) {
    try {
      console.log("Empty SQLite database detected. Migrating existing JSON store to SQLite tables...");
      const raw = fs.readFileSync(JSON_DB_FILE, "utf-8");
      const data = JSON.parse(raw);

      // Migrate Users
      if (data.users) {
        for (const email of Object.keys(data.users)) {
          const u = data.users[email];
          await runQuery(
            `INSERT INTO users (id, fullName, email, passwordHash, classLevel, interests, skills, preferredSubjects, careerInterests, role, registeredAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              u.id,
              u.fullName,
              u.email.toLowerCase(),
              u.passwordHash,
              u.classLevel,
              JSON.stringify(u.interests || []),
              JSON.stringify(u.skills || []),
              JSON.stringify(u.preferredSubjects || []),
              JSON.stringify(u.careerInterests || []),
              u.role || "student",
              u.registeredAt || new Date().toISOString()
            ]
          );
        }
      }

      // Migrate Saved Careers
      if (data.savedCareers) {
        for (const userId of Object.keys(data.savedCareers)) {
          const careers = data.savedCareers[userId] || [];
          for (const cId of careers) {
            await runQuery(
              "INSERT OR IGNORE INTO saved_careers (userId, careerId) VALUES (?, ?)",
              [userId, cId]
            );
          }
        }
      }

      // Migrate Quiz Attempts
      if (data.quizAttempts) {
        for (const userId of Object.keys(data.quizAttempts)) {
          const attempts = data.quizAttempts[userId] || [];
          for (const att of attempts) {
            await runQuery(
              "INSERT INTO quiz_attempts (userId, answers, vector, timestamp) VALUES (?, ?, ?, ?)",
              [
                userId,
                JSON.stringify(att.answers || {}),
                JSON.stringify(att.vector || {}),
                att.timestamp || new Date().toISOString()
              ]
            );
          }
        }
      }

      // Migrate Conversations (Chatbot history)
      if (data.conversations) {
        for (const userId of Object.keys(data.conversations)) {
          const messages = data.conversations[userId] || [];
          for (const msg of messages) {
            await runQuery(
              "INSERT INTO conversations (userId, role, text, timestamp) VALUES (?, ?, ?, ?)",
              [userId, msg.role, msg.text, msg.timestamp || new Date().toISOString()]
            );
          }
        }
      }

      // Migrate Notifications
      if (data.notifications) {
        for (const userId of Object.keys(data.notifications)) {
          const notifs = data.notifications[userId] || [];
          for (const n of notifs) {
            await runQuery(
              `INSERT OR REPLACE INTO notifications (id, userId, title, body, timestamp, read, activityId, activityType) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                n.id || "n-" + Math.random().toString(36).substring(2, 11),
                userId,
                n.title,
                n.body,
                n.timestamp || new Date().toISOString(),
                n.read ? 1 : 0,
                n.activityId || null,
                n.activityType || null
              ]
            );
          }
        }
      }

      // Migrate Custom Activities
      if (data.customActivities) {
        for (const act of data.customActivities) {
          await runQuery(
            `INSERT OR REPLACE INTO custom_activities (id, type, title, description, targetAudience, status, createdAt, completions, participants, results) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              act.id,
              act.type,
              act.title,
              act.description || null,
              act.targetAudience || null,
              act.status || "draft",
              act.createdAt || new Date().toISOString(),
              JSON.stringify(act.completions || []),
              JSON.stringify(act.participants || []),
              JSON.stringify(act.results || [])
            ]
          );
        }
      }

      // Migrate Custom Metadata Lists and AI settings
      const customKeys = [
        "customCareers",
        "customStreams",
        "customResources",
        "customQuizQuestions",
        "customColleges",
        "customExams",
        "customCourses",
        "customSkills",
        "customRoadmaps",
        "customRecommendations",
        "aiConfig"
      ];

      for (const k of customKeys) {
        if (data[k] !== undefined) {
          await runQuery(
            "INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)",
            [k, JSON.stringify(data[k])]
          );
        }
      }

      console.log("JSON data store migrated successfully into the SQLite relational database!");
    } catch (err) {
      console.error("Failed to migrate data from JSON file into SQLite database:", err);
    }
  } else {
    // Seed system config defaults if completely empty
    const adminCheck = await getRow<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    if (!adminCheck || adminCheck.count === 0) {
      console.log("No admin user found. Seeding default system profiles into SQLite...");
      
      // Admin
      await runQuery(
        `INSERT OR IGNORE INTO users (id, fullName, email, passwordHash, classLevel, interests, skills, preferredSubjects, careerInterests, role, registeredAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "admin-user",
          "System Admin",
          "admin@educarrier.com",
          "admin123",
          "Class 12",
          JSON.stringify([]),
          JSON.stringify([]),
          JSON.stringify([]),
          JSON.stringify([]),
          "admin",
          new Date().toISOString()
        ]
      );

      // Demo User
      await runQuery(
        `INSERT OR IGNORE INTO users (id, fullName, email, passwordHash, classLevel, interests, skills, preferredSubjects, careerInterests, role, registeredAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "demo-user",
          "Rahul Sharma",
          "demo@educarrier.com",
          "demo123",
          "Class 11",
          JSON.stringify(["Coding", "Analytics", "Space", "Science"]),
          JSON.stringify(["Python basics", "Mathematics", "Logical reasoning"]),
          JSON.stringify(["Mathematics", "Physics", "Computer Science"]),
          JSON.stringify(["AI Engineer", "Software Engineer"]),
          "student",
          new Date().toISOString()
        ]
      );

      // Demo saved careers
      await runQuery("INSERT OR IGNORE INTO saved_careers (userId, careerId) VALUES (?, ?)", ["demo-user", "ai-engineer"]);
      await runQuery("INSERT OR IGNORE INTO saved_careers (userId, careerId) VALUES (?, ?)", ["demo-user", "data-scientist"]);

      // Demo notification
      await runQuery(
        `INSERT OR IGNORE INTO notifications (id, userId, title, body, timestamp, read) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "n-1",
          "demo-user",
          "Welcome to Edu Carrier! 🎓",
          "Get started by taking our career matching quiz to see your custom recommendations.",
          new Date().toISOString(),
          0
        ]
      );
    }
  }
}
