import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  initDb,
  runQuery,
  getRow,
  getAllRows
} from "./src/db/sqlite.ts";

dotenv.config();

const app = express();
const portArgIndex = process.argv.indexOf("--port");
const argPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : undefined;
// Dev server must run on port 3000 in development; use process.env.PORT in production
const PORT = argPort || (process.env.NODE_ENV === "production" ? Number(process.env.PORT) || 3000 : 3000);

app.use(express.json());

// Lazy initialization of GoogleGenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI Career Guide will run in demo/fallback mode.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// ----------------------------------------------------------------------------
// Relational SQL Parsing Helpers
// ----------------------------------------------------------------------------
function parseUser(row: any) {
  if (!row) return null;
  return {
    ...row,
    interests: JSON.parse(row.interests || "[]"),
    skills: JSON.parse(row.skills || "[]"),
    preferredSubjects: JSON.parse(row.preferredSubjects || "[]"),
    careerInterests: JSON.parse(row.careerInterests || "[]"),
  };
}

function parseQuizAttempt(row: any) {
  if (!row) return null;
  return {
    ...row,
    answers: JSON.parse(row.answers || "{}"),
    vector: JSON.parse(row.vector || "{}"),
  };
}

function parseActivity(row: any) {
  if (!row) return null;
  return {
    ...row,
    completions: JSON.parse(row.completions || "[]"),
    participants: JSON.parse(row.participants || "[]"),
    results: JSON.parse(row.results || "[]"),
  };
}

// ----------------------------------------------------------------------------
// API Endpoints
// ----------------------------------------------------------------------------

// Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, password, classLevel } = req.body;
  if (!fullName || !email || !password || !classLevel) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const emailLower = email.toLowerCase().trim();
    const existing = await getRow("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", [emailLower]);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const isAdminEmail = emailLower.endsWith("@educarrier.com") || 
                         emailLower.endsWith("@educarrer.com") || 
                         emailLower.endsWith("@admin.com");
    const assignedRole = isAdminEmail ? "admin" : "student";

    const userId = "u-" + Math.random().toString(36).substring(2, 11);
    
    // SQL relational write
    await runQuery(
      `INSERT INTO users (id, fullName, email, passwordHash, classLevel, interests, skills, preferredSubjects, careerInterests, role, registeredAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        fullName,
        emailLower,
        password,
        classLevel,
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        assignedRole,
        new Date().toISOString()
      ]
    );

    // SQL notification insert
    await runQuery(
      "INSERT INTO notifications (id, userId, title, body, timestamp, read) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "n-reg",
        userId,
        "Account Created Successfully! ✨",
        "Welcome aboard, " + fullName + "! Start exploring Streams or Career details.",
        new Date().toISOString(),
        0
      ]
    );

    const newUser = {
      id: userId,
      fullName,
      email: emailLower,
      passwordHash: password,
      classLevel,
      interests: [],
      skills: [],
      preferredSubjects: [],
      careerInterests: [],
      role: assignedRole
    };

    res.json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.error("Registration error in SQL:", error);
    res.status(500).json({ error: "Failed to complete registration" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userRow = await getRow("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [email.toLowerCase().trim()]);
    if (!userRow || userRow.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user: parseUser(userRow) });
  } catch (error) {
    console.error("Login error in SQL:", error);
    res.status(500).json({ error: "Failed to execute login" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required" });
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const emailLower = email.toLowerCase().trim();
    const userRow = await getRow("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [emailLower]);
    if (!userRow) {
      return res.status(404).json({ error: "No account registered with this email address" });
    }

    await runQuery("UPDATE users SET passwordHash = ? WHERE id = ?", [newPassword, userRow.id]);

    // Insert notification
    await runQuery(
      "INSERT INTO notifications (id, userId, title, body, timestamp, read) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "n-" + Math.random().toString(36).substring(2, 10),
        userRow.id,
        "Password Reset Successful 🔐",
        "Your account password was updated successfully. If this wasn't you, please contact support.",
        new Date().toISOString(),
        0
      ]
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error in SQL:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Profile Endpoints
app.get("/api/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userRow = await getRow("SELECT * FROM users WHERE id = ?", [userId]);
    if (!userRow) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(parseUser(userRow));
  } catch (error) {
    console.error("Profile GET error in SQL:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

app.put("/api/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userRow = await getRow("SELECT * FROM users WHERE id = ?", [userId]);
    if (!userRow) {
      return res.status(404).json({ error: "User not found" });
    }

    const fullName = req.body.fullName || userRow.fullName;
    const classLevel = req.body.classLevel || userRow.classLevel;
    const interests = req.body.interests || JSON.parse(userRow.interests || "[]");
    const skills = req.body.skills || JSON.parse(userRow.skills || "[]");
    const preferredSubjects = req.body.preferredSubjects || JSON.parse(userRow.preferredSubjects || "[]");
    const careerInterests = req.body.careerInterests || JSON.parse(userRow.careerInterests || "[]");

    await runQuery(
      `UPDATE users 
       SET fullName = ?, classLevel = ?, interests = ?, skills = ?, preferredSubjects = ?, careerInterests = ? 
       WHERE id = ?`,
      [
        fullName,
        classLevel,
        JSON.stringify(interests),
        JSON.stringify(skills),
        JSON.stringify(preferredSubjects),
        JSON.stringify(careerInterests),
        userId
      ]
    );

    const updatedUserRow = await getRow("SELECT * FROM users WHERE id = ?", [userId]);
    res.json(parseUser(updatedUserRow));
  } catch (error) {
    console.error("Profile PUT error in SQL:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Bookmarks / Saved Careers
app.get("/api/saved-careers/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await getAllRows("SELECT careerId FROM saved_careers WHERE userId = ?", [userId]);
    res.json(rows.map((r) => r.careerId));
  } catch (error) {
    console.error("Saved careers GET error in SQL:", error);
    res.status(500).json({ error: "Failed to fetch saved careers" });
  }
});

app.get("/api/bookmarks/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await getAllRows("SELECT careerId FROM saved_careers WHERE userId = ?", [userId]);
    res.json({ bookmarks: rows.map((r) => r.careerId) });
  } catch (error) {
    console.error("Bookmarks GET error in SQL:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

app.post("/api/bookmarks/toggle", async (req, res) => {
  const { userId, careerId } = req.body;
  if (!userId || !careerId) {
    return res.status(400).json({ error: "userId and careerId are required" });
  }

  try {
    const existing = await getRow("SELECT 1 FROM saved_careers WHERE userId = ? AND careerId = ?", [userId, careerId]);
    if (existing) {
      await runQuery("DELETE FROM saved_careers WHERE userId = ? AND careerId = ?", [userId, careerId]);
    } else {
      await runQuery("INSERT INTO saved_careers (userId, careerId) VALUES (?, ?)", [userId, careerId]);
    }

    const rows = await getAllRows("SELECT careerId FROM saved_careers WHERE userId = ?", [userId]);
    res.json({ bookmarks: rows.map((r) => r.careerId) });
  } catch (error) {
    console.error("Bookmarks toggle error in SQL:", error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

app.post("/api/saved-careers/:userId", async (req, res) => {
  const { userId } = req.params;
  const { careerId } = req.body;
  if (!careerId) {
    return res.status(400).json({ error: "Career ID is required" });
  }

  try {
    await runQuery("INSERT OR IGNORE INTO saved_careers (userId, careerId) VALUES (?, ?)", [userId, careerId]);
    const rows = await getAllRows("SELECT careerId FROM saved_careers WHERE userId = ?", [userId]);
    res.json(rows.map((r) => r.careerId));
  } catch (error) {
    console.error("Saved careers POST error in SQL:", error);
    res.status(500).json({ error: "Failed to save career" });
  }
});

app.delete("/api/saved-careers/:userId/:careerId", async (req, res) => {
  const { userId, careerId } = req.params;
  try {
    await runQuery("DELETE FROM saved_careers WHERE userId = ? AND careerId = ?", [userId, careerId]);
    const rows = await getAllRows("SELECT careerId FROM saved_careers WHERE userId = ?", [userId]);
    res.json(rows.map((r) => r.careerId));
  } catch (error) {
    console.error("Saved careers DELETE error in SQL:", error);
    res.status(500).json({ error: "Failed to delete saved career" });
  }
});

// Quiz Attempts
app.get("/api/quiz/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await getAllRows("SELECT * FROM quiz_attempts WHERE userId = ? ORDER BY id ASC", [userId]);
    res.json(rows.map(parseQuizAttempt));
  } catch (error) {
    console.error("Quiz attempts GET error in SQL:", error);
    res.status(500).json({ error: "Failed to fetch quiz attempts" });
  }
});

app.post("/api/quiz/:userId", async (req, res) => {
  const { userId } = req.params;
  const { answers, vector } = req.body;

  try {
    const timestamp = new Date().toISOString();
    await runQuery(
      "INSERT INTO quiz_attempts (userId, answers, vector, timestamp) VALUES (?, ?, ?, ?)",
      [userId, JSON.stringify(answers || {}), JSON.stringify(vector || {}), timestamp]
    );

    // Insert Notification SQL relational way
    await runQuery(
      "INSERT INTO notifications (id, userId, title, body, timestamp, read) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "n-quiz-" + Date.now(),
        userId,
        "AI Career Quiz Completed 🎓",
        "Your interests have been mapped. Check your personalized match scores on the Dashboard!",
        timestamp,
        0
      ]
    );

    res.json({
      answers,
      vector,
      timestamp
    });
  } catch (error) {
    console.error("Quiz attempts POST error in SQL:", error);
    res.status(500).json({ error: "Failed to save quiz attempt" });
  }
});

// Notifications
app.get("/api/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await getAllRows("SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC", [userId]);
    const notifications = rows.map((r) => ({
      ...r,
      read: r.read === 1
    }));
    res.json({ notifications });
  } catch (error) {
    console.error("Notifications GET error in SQL:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications/read/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await runQuery("UPDATE notifications SET read = 1 WHERE userId = ?", [userId]);
    const rows = await getAllRows("SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC", [userId]);
    const notifications = rows.map((r) => ({
      ...r,
      read: r.read === 1
    }));
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Notifications bulk read error in SQL:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

app.post("/api/notifications/:userId/:notificationId/read", async (req, res) => {
  const { userId, notificationId } = req.params;
  try {
    await runQuery("UPDATE notifications SET read = 1 WHERE userId = ? AND id = ?", [userId, notificationId]);
    const rows = await getAllRows("SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC", [userId]);
    const notifications = rows.map((r) => ({
      ...r,
      read: r.read === 1
    }));
    res.json({ notifications });
  } catch (error) {
    console.error("Notification single read error in SQL:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

app.delete("/api/notifications/:userId/:notificationId", async (req, res) => {
  const { userId, notificationId } = req.params;
  try {
    await runQuery("DELETE FROM notifications WHERE userId = ? AND id = ?", [userId, notificationId]);
    const rows = await getAllRows("SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC", [userId]);
    const notifications = rows.map((r) => ({
      ...r,
      read: r.read === 1
    }));
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Notification DELETE error in SQL:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// AI Career Guide Chatbot
app.post("/api/ai/chat", async (req, res) => {
  const { message, history, userId } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Get user details for rich context setting
    let userContext = "";
    if (userId) {
      const userRow = await getRow("SELECT * FROM users WHERE id = ?", [userId]);
      if (userRow) {
        const u = parseUser(userRow);
        userContext = `\n[Student Profile Context]:
- Student Name: ${u.fullName}
- Education Level: ${u.classLevel}
- Interests: ${u.interests.join(", ") || "None listed yet"}
- Skills: ${u.interests.join(", ") || "None listed yet"}
- Preferred Subjects: ${u.preferredSubjects.join(", ") || "None listed yet"}
- Career Interests: ${u.careerInterests.join(", ") || "None listed yet"}`;
      }
    }

    // Get aiConfig from SQL database system_config
    const configRow = await getRow("SELECT value FROM system_config WHERE key = 'aiConfig'");
    const aiConfig = configRow ? JSON.parse(configRow.value) : {};
    
    const customInstruction = aiConfig.systemInstruction;
    const systemInstruction = customInstruction
      ? `${customInstruction}${userContext}`
      : `You are "Edu Carrier AI", an empathetic, highly knowledgeable, and encouraging professional career guidance counselor for Indian students (primarily Class 6 to 12 and early college).
Your goal is to answer queries about educational streams (MPC, BiPC, MEC, Arts), colleges, entrance exams, courses, and careers.
Provide structured, step-by-step career roads, skill-gap advice, and course selections.
Format your responses with clear markdown headers, bold key phrases, bullet points, and neat spacing. Avoid massive blocks of text.
Keep explanations jargon-free, objective, and realistic yet inspirational. Do not make up fake details or fake scholarships.
Whenever the student provides profile details, tailor your advice directly to their interests and academic levels.${userContext}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback Mock Responses
      const mockResponses: Record<string, string> = {
        "hello": `### Hello! Welcome to your AI Career Guide! 🎓

I am **Edu Carrier AI**, your dedicated counselor. How can I assist you on your educational journey today? 
Whether you're curious about:
1. **Educational streams** (like MPC, BiPC, MEC, or Arts & Humanities)
2. **Top Colleges and Entrance Exams** (like JEE, NEET, or CLAT)
3. **Emerging Careers** (such as AI, Space Science, or Renewable Energy)

Feel free to ask me anything!`,
        "default": `### Guidance Insight from Edu Carrier AI ✨

Based on your question and profile, here is a structured roadmap for your exploration:

1. **Understand the Stream**: If you like Mathematics and Physics, the **MPC (Mathematics, Physics & Chemistry)** stream is the typical launchpad for engineering, coding, and spatial design careers.
2. **Target Exams**: Prepare for exams like **JEE Main / Advanced** or state-level **CETs**.
3. **Core Skills to Build**:
   - Technical logic and algorithmic thinking
   - Consistent practice with analytical problem-solving
4. **Actionable Next Steps**:
   - Go to the **Explore Streams** section of your dashboard and read about **MPC** or **Emerging Careers**.
   - Take the **Career Match Quiz** to get detailed score breakdowns.

*Note: Since the backend is running in Demo Mode, this is a simulated guidance response. Please configure your Gemini API Key in the Settings menu for fully dynamic real-time consultations.*`
      };

      const norm = message.toLowerCase().trim();
      const reply = norm.includes("hello") || norm.includes("hi") ? mockResponses.hello : mockResponses.default;

      if (userId) {
        await runQuery(
          "INSERT INTO conversations (userId, role, text, timestamp) VALUES (?, ?, ?, ?)",
          [userId, "user", message, new Date().toISOString()]
        );
        await runQuery(
          "INSERT INTO conversations (userId, role, text, timestamp) VALUES (?, ?, ?, ?)",
          [userId, "model", reply, new Date().toISOString()]
        );
      }

      return res.json({ text: reply });
    }

    const ai = getGenAI();

    // Map history to Google GenAI structure
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [...formattedHistory, { role: "user", parts: [{ text: message }] }],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
    } catch (primaryErr: any) {
      console.warn("Primary model gemini-3.8-flash error/overloaded, falling back to gemini-2.5-flash:", primaryErr?.message || primaryErr);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [...formattedHistory, { role: "user", parts: [{ text: message }] }],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
    }

    const replyText = response.text || "I apologize, I wasn't able to construct a response. Please try asking again.";

    if (userId) {
      await runQuery(
        "INSERT INTO conversations (userId, role, text, timestamp) VALUES (?, ?, ?, ?)",
        [userId, "user", message, new Date().toISOString()]
      );
      await runQuery(
        "INSERT INTO conversations (userId, role, text, timestamp) VALUES (?, ?, ?, ?)",
        [userId, "model", replyText, new Date().toISOString()]
      );
    }

    res.json({ text: replyText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "AI service is currently busy or unavailable. Please retry in a moment." });
  }
});

app.post("/api/ai/generate-quiz", async (req, res) => {
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const mockOptions = [
      { label: `Build products or code solutions related to ${topic || "this field"}`, tags: { coding: 3, engineering: 2 } },
      { label: `Conduct deep research, analysis or reporting on ${topic || "this field"}`, tags: { analytics: 3, writing: 1 } },
      { label: `Design creative assets, branding or layouts for ${topic || "this field"}`, tags: { creative: 3, design: 2 } },
      { label: `Direct operations, managing client business for ${topic || "this field"}`, tags: { business: 3 } }
    ];
    return res.json({
      q: `Which aspect of ${topic || "this professional field"} aligns most with your personal style?`,
      hint: "Select your primary interest",
      type: "single",
      options: mockOptions
    });
  }

  try {
    const ai = getGenAI();
    const prompt = `Generate a modern, highly engaging career guidance quiz question related to the theme: "${topic || "professional career paths"}".
The question should help a high school or college student determine their affinity for different roles within "${topic}".
Return EXACTLY a JSON object with this exact schema:
{
  "q": "The question statement asking about preferences or scenarios",
  "hint": "Pick all that apply or Select one option",
  "type": "single" or "multi",
  "options": [
    {
      "label": "Distinct career choice or activity",
      "tags": {
        "engineering": 1,
        "coding": 1,
        "creative": 1,
        "business": 1,
        "analytics": 1,
        "medicine": 1,
        "law": 1,
        "design": 1
      }
    }
  ]
}
Rules:
1. Provide exactly 3 or 4 options.
2. For each option, include a "tags" object mapping standard career categories like coding, engineering, analytics, business, creative, medicine, law, or design to numeric weights (integers from 1 to 3).
3. Do not include any markdown wrappers like \`\`\`json or \`\`\`. Output ONLY raw valid JSON text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let text = response.text || "{}";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Generate Quiz Error:", error);
    res.status(500).json({ error: "AI failed to generate question" });
  }
});

app.get("/api/ai/chat/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const rows = await getAllRows("SELECT role, text, timestamp FROM conversations WHERE userId = ? ORDER BY id ASC", [userId]);
    res.json(rows);
  } catch (error) {
    console.error("Chat history GET error in SQL:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Admin Panel Stats
app.get("/api/admin/stats", async (req, res) => {
  try {
    const totalUsersRow = await getRow("SELECT COUNT(*) as count FROM users");
    const totalQuizzesRow = await getRow("SELECT COUNT(*) as count FROM quiz_attempts");
    const totalSavedRow = await getRow("SELECT COUNT(*) as count FROM saved_careers");
    const totalConversationsRow = await getRow("SELECT COUNT(*) as count FROM conversations");

    const totalUsers = totalUsersRow ? totalUsersRow.count : 0;
    const quizAttempts = totalQuizzesRow ? totalQuizzesRow.count : 0;
    const totalSaved = totalSavedRow ? totalSavedRow.count : 0;
    const aiConversations = totalConversationsRow ? Math.ceil(totalConversationsRow.count / 2) : 0;

    const userRows = await getAllRows("SELECT id, fullName, email, classLevel, role, registeredAt FROM users");

    res.json({
      stats: {
        users: totalUsers,
        quizzes: quizAttempts,
        saved: totalSaved,
        conversations: aiConversations
      },
      users: userRows.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        classLevel: u.classLevel || "Class 10",
        role: u.role || "student",
        registeredAt: u.registeredAt
      }))
    });
  } catch (error) {
    console.error("Admin stats GET error in SQL:", error);
    res.status(500).json({ error: "Failed to load admin stats" });
  }
});

// GET platform custom data
app.get("/api/platform/data", async (req, res) => {
  try {
    const rows = await getAllRows("SELECT key, value FROM system_config");
    const configMap: Record<string, any> = {};
    rows.forEach((r) => {
      configMap[r.key] = JSON.parse(r.value);
    });

    res.json({
      customCareers: configMap["customCareers"] || [],
      customStreams: configMap["customStreams"] || [],
      customResources: configMap["customResources"] || [],
      customQuizQuestions: configMap["customQuizQuestions"] || [],
      customColleges: configMap["customColleges"] || [],
      customExams: configMap["customExams"] || [],
      customCourses: configMap["customCourses"] || [],
      customSkills: configMap["customSkills"] || [],
      customRoadmaps: configMap["customRoadmaps"] || [],
      customRecommendations: configMap["customRecommendations"] || [],
      aiConfig: configMap["aiConfig"] || {}
    });
  } catch (error) {
    console.error("Platform data GET error in SQL:", error);
    res.status(500).json({ error: "Failed to load platform configurations" });
  }
});

// POST to update platform custom data
app.post("/api/platform/save", async (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) {
    return res.status(400).json({ error: "Missing type or data" });
  }

  try {
    let keyName = "";
    switch (type) {
      case "careers": keyName = "customCareers"; break;
      case "streams": keyName = "customStreams"; break;
      case "resources": keyName = "customResources"; break;
      case "quizQuestions": keyName = "customQuizQuestions"; break;
      case "colleges": keyName = "customColleges"; break;
      case "exams": keyName = "customExams"; break;
      case "courses": keyName = "customCourses"; break;
      case "skills": keyName = "customSkills"; break;
      case "roadmaps": keyName = "customRoadmaps"; break;
      case "recommendations": keyName = "customRecommendations"; break;
      case "aiConfig": keyName = "aiConfig"; break;
      default:
        return res.status(400).json({ error: "Invalid data type" });
    }

    await runQuery("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)", [keyName, JSON.stringify(data)]);
    res.json({ success: true, message: `${type} updated successfully.` });
  } catch (error) {
    console.error("Platform data save error in SQL:", error);
    res.status(500).json({ error: "Failed to update platform data" });
  }
});

// Admin to delete/update any student
app.post("/api/admin/students/save", async (req, res) => {
  const { studentId, action, data } = req.body;
  if (!studentId) {
    return res.status(400).json({ error: "Missing student ID" });
  }

  try {
    const userRow = await getRow("SELECT * FROM users WHERE id = ?", [studentId]);
    if (!userRow) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (action === "delete") {
      // Due to FOREIGN KEY ON DELETE CASCADE, deleting user deletes bookmarks, quiz attempts, history and notifications automatically!
      await runQuery("DELETE FROM users WHERE id = ?", [studentId]);
    } else if (action === "update") {
      await runQuery(
        "UPDATE users SET fullName = ?, email = ?, classLevel = ?, role = ? WHERE id = ?",
        [
          data.fullName || userRow.fullName,
          (data.email || userRow.email).toLowerCase(),
          data.classLevel || userRow.classLevel,
          data.role || userRow.role,
          studentId
        ]
      );
    }

    res.json({ success: true, message: `Student account ${action}d successfully.` });
  } catch (error) {
    console.error("Admin student save error in SQL:", error);
    res.status(500).json({ error: "Failed to update student account" });
  }
});

// Admin to create system-wide notifications
app.post("/api/admin/notifications/push", async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "Missing title or body" });
  }

  try {
    const users = await getAllRows("SELECT id FROM users");
    const timestamp = new Date().toISOString();

    for (const u of users) {
      await runQuery(
        "INSERT INTO notifications (id, userId, title, body, timestamp, read) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "n-push-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
          u.id,
          title,
          body,
          timestamp,
          0
        ]
      );
    }

    res.json({ success: true, message: "Notification pushed to all students successfully." });
  } catch (error) {
    console.error("Notification push error in SQL:", error);
    res.status(500).json({ error: "Failed to push system notification" });
  }
});

// GET all activities
app.get("/api/activities", async (req, res) => {
  try {
    const rows = await getAllRows("SELECT * FROM custom_activities");
    res.json({ activities: rows.map(parseActivity) });
  } catch (error) {
    console.error("Activities GET error in SQL:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// CREATE or UPDATE activity
app.post("/api/activities", async (req, res) => {
  const activity = req.body;
  if (!activity.type || !activity.title) {
    return res.status(400).json({ error: "Missing type or title" });
  }

  try {
    const activityId = activity.id || "act-" + Date.now();
    const existing = activity.id ? await getRow("SELECT * FROM custom_activities WHERE id = ?", [activity.id]) : null;

    const completions = activity.completions || (existing ? JSON.parse(existing.completions || "[]") : []);
    const participants = activity.participants || (existing ? JSON.parse(existing.participants || "[]") : []);
    const results = activity.results || (existing ? JSON.parse(existing.results || "[]") : []);

    const savedActivity = {
      ...activity,
      id: activityId,
      createdAt: activity.createdAt || (existing ? existing.createdAt : new Date().toISOString()),
      completions,
      participants,
      results
    };

    await runQuery(
      `INSERT OR REPLACE INTO custom_activities (id, type, title, description, targetAudience, status, createdAt, completions, participants, results) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        savedActivity.id,
        savedActivity.type,
        savedActivity.title,
        savedActivity.description || null,
        savedActivity.targetAudience || null,
        savedActivity.status || "draft",
        savedActivity.createdAt,
        JSON.stringify(savedActivity.completions),
        JSON.stringify(savedActivity.participants),
        JSON.stringify(savedActivity.results)
      ]
    );

    // Push notifications if the activity is newly published or update status
    const statLower = (savedActivity.status || "").toLowerCase();
    if (statLower === "published" || statLower === "live" || statLower === "active") {
      const targetClass = savedActivity.targetAudience; // e.g. "Class 11", "Class 12", "All"
      
      const iconMap: Record<string, string> = {
        quiz: "📝",
        news: "📰",
        task: "🎯",
        challenge: "🧠",
        competition: "🏆",
        learning: "📚",
        announcement: "📢",
        event: "🎓"
      };
      const icon = iconMap[savedActivity.type] || "✨";
      const notificationItem = {
        id: "n-act-" + Date.now(),
        title: `${icon} New ${savedActivity.type.toUpperCase()}: ${savedActivity.title}`,
        body: savedActivity.description || `A new educational activity is available for you!`,
        timestamp: new Date().toISOString(),
        read: 0,
        activityId: savedActivity.id,
        activityType: savedActivity.type
      };

      const students = await getAllRows("SELECT id, classLevel FROM users WHERE role != 'admin'");
      for (const student of students) {
        let isTarget = false;
        if (!targetClass || targetClass === "All") {
          isTarget = true;
        } else if (targetClass.toLowerCase().includes("11-12") || targetClass.toLowerCase().includes("11 - 12")) {
          isTarget = student.classLevel === "Class 11" || student.classLevel === "Class 12";
        } else if (targetClass.toLowerCase().includes("9-10") || targetClass.toLowerCase().includes("9 - 10")) {
          isTarget = student.classLevel === "Class 9" || student.classLevel === "Class 10";
        } else {
          isTarget = student.classLevel === targetClass;
        }

        if (isTarget) {
          // Check if notification already exists to avoid duplication
          const hasNotif = await getRow("SELECT 1 FROM notifications WHERE userId = ? AND activityId = ?", [student.id, savedActivity.id]);
          if (!hasNotif) {
            await runQuery(
              `INSERT INTO notifications (id, userId, title, body, timestamp, read, activityId, activityType) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                "n-act-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
                student.id,
                notificationItem.title,
                notificationItem.body,
                notificationItem.timestamp,
                0,
                notificationItem.activityId,
                notificationItem.activityType
              ]
            );
          }
        }
      }
    }

    res.json({ success: true, activity: savedActivity });
  } catch (error) {
    console.error("Activity save error in SQL:", error);
    res.status(500).json({ error: "Failed to save activity" });
  }
});

// DELETE activity
app.post("/api/activities/delete", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing activity ID" });

  try {
    await runQuery("DELETE FROM custom_activities WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Activity delete error in SQL:", error);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

// INTERACT with activity
app.post("/api/activities/interact", async (req, res) => {
  const { id, activityId, userId, action, data } = req.body;
  const targetId = id || activityId;
  if (!targetId || !userId) return res.status(400).json({ error: "Missing parameters" });

  try {
    const actRow = await getRow("SELECT * FROM custom_activities WHERE id = ?", [targetId]);
    if (!actRow) return res.status(404).json({ error: "Activity not found" });

    const act = parseActivity(actRow);
    const completions: string[] = act.completions;
    const participants: string[] = act.participants;
    const results: any[] = act.results;

    if (action === "register" || action === "start") {
      if (!participants.includes(userId)) {
        participants.push(userId);
      }
    } else if (action === "complete") {
      if (!completions.includes(userId)) {
        completions.push(userId);
      }
      const finalScore = (data && data.score !== undefined) ? data.score : req.body.score;
      if (finalScore !== undefined) {
        const existingResIdx = results.findIndex((r: any) => r.userId === userId);
        const resItem = {
          userId,
          score: finalScore,
          answers: (data && data.answers) || req.body.answers || {},
          completedAt: new Date().toISOString()
        };
        if (existingResIdx > -1) {
          results[existingResIdx] = resItem;
        } else {
          results.push(resItem);
        }
      }
    }

    await runQuery(
      "UPDATE custom_activities SET completions = ?, participants = ?, results = ? WHERE id = ?",
      [JSON.stringify(completions), JSON.stringify(participants), JSON.stringify(results), targetId]
    );

    const updatedActRow = await getRow("SELECT * FROM custom_activities WHERE id = ?", [targetId]);
    res.json({ success: true, activity: parseActivity(updatedActRow) });
  } catch (error) {
    console.error("Activity interact error in SQL:", error);
    res.status(500).json({ error: "Failed to record activity interaction" });
  }
});


// ----------------------------------------------------------------------------
// Vite and Static File Serving
// ----------------------------------------------------------------------------

// Catch unhandled API requests with 404 JSON instead of HTML
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

initDb().then(() => {
  if (process.env.NODE_ENV !== "production") {
    createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa"
    }).then((vite) => {
      app.use(vite.middlewares);
      
      app.use("*", (req, res, next) => {
        // Exclude API routes
        if (req.originalUrl.startsWith("/api/")) {
          return next();
        }
        
        const indexHtmlPath = path.join(process.cwd(), "index.html");
        fs.readFile(indexHtmlPath, "utf-8", (err, html) => {
          if (err) return next(err);
          vite.transformIndexHtml(req.originalUrl, html).then((transformedHtml) => {
            res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
          }).catch(next);
        });
      });
      
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running in development mode on http://localhost:${PORT}`);
      });

      server.on("error", (err: any) => {
        console.error("Server listen error:", err);
      });

      const handleShutdown = () => {
        server.close(() => {
          process.exit(0);
        });
      };
      process.on("SIGTERM", handleShutdown);
      process.on("SIGINT", handleShutdown);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req, res, next) => {
      if (req.originalUrl.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
    
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running in production mode on port ${PORT}`);
    });

    server.on("error", (err: any) => {
      console.error("Server listen error:", err);
    });

    const handleShutdown = () => {
      server.close(() => {
        process.exit(0);
      });
    };
    process.on("SIGTERM", handleShutdown);
    process.on("SIGINT", handleShutdown);
  }
}).catch((err) => {
  console.error("CRITICAL: Failed to initialize SQLite relational database. Server startup aborted.", err);
});
