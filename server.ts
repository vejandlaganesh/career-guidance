import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, getDoc, collection, query, limit } from "firebase/firestore";

dotenv.config();

// Firebase Admin Initialization
let db: any = null;
try {
  const serviceAccountPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(serviceAccountPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log("Firebase initialized and Firestore connected.");
  } else {
    console.warn("firebase-applet-config.json not found. Firestore sync disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Lightweight JSON file-based database for persistence in the sandboxed container
const DB_FILE = path.join(process.cwd(), "data-store.json");

interface DataStore {
  users: Record<string, any>;
  savedCareers: Record<string, string[]>; // userId -> careerIds[]
  quizAttempts: Record<string, any[]>; // userId -> quizAttempts[]
  conversations: Record<string, any[]>; // userId -> conversationHistory[]
  notifications: Record<string, any[]>; // userId -> notifications[]
  customCareers: any[];
  customStreams: any[];
  customResources: any[];
  customQuizQuestions: any[];
  customColleges: any[];
  customExams: any[];
  customCourses: any[];
  customSkills: any[];
  customRoadmaps: any[];
  customRecommendations: any[];
  customActivities?: any[];
  aiConfig: { systemInstruction?: string; temperature?: number };
}

function loadData(): DataStore {
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      
      // Ensure all fields are initialized
      if (!parsed.customCareers) parsed.customCareers = [];
      if (!parsed.customStreams) parsed.customStreams = [];
      if (!parsed.customResources) parsed.customResources = [];
      if (!parsed.customQuizQuestions) parsed.customQuizQuestions = [];
      if (!parsed.customColleges) parsed.customColleges = [];
      if (!parsed.customExams) parsed.customExams = [];
      if (!parsed.customCourses) parsed.customCourses = [];
      if (!parsed.customSkills) parsed.customSkills = [];
      if (!parsed.customRoadmaps) parsed.customRoadmaps = [];
      if (!parsed.customRecommendations) parsed.customRecommendations = [];
      if (!parsed.customActivities) parsed.customActivities = [];
      if (!parsed.aiConfig) parsed.aiConfig = {};

      if (!parsed.users["admin@educarrier.com"]) {
        parsed.users["admin@educarrier.com"] = {
          id: "admin-user",
          fullName: "System Admin",
          email: "admin@educarrier.com",
          passwordHash: "admin123",
          classLevel: "Class 12",
          interests: [],
          skills: [],
          preferredSubjects: [],
          careerInterests: [],
          role: "admin"
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
      }
      return parsed;
    } catch (e) {
      console.error("Error reading data store file, resetting:", e);
    }
  }
  const defaultData: DataStore = {
    users: {
      "demo@educarrier.com": {
        id: "demo-user",
        fullName: "Rahul Sharma",
        email: "demo@educarrier.com",
        passwordHash: "demo123", // mock password
        classLevel: "Class 11",
        interests: ["Coding", "Analytics", "Space", "Science"],
        skills: ["Python basics", "Mathematics", "Logical reasoning"],
        preferredSubjects: ["Mathematics", "Physics", "Computer Science"],
        careerInterests: ["AI Engineer", "Software Engineer"],
        role: "student"
      },
      "admin@educarrier.com": {
        id: "admin-user",
        fullName: "System Admin",
        email: "admin@educarrier.com",
        passwordHash: "admin123",
        classLevel: "Class 12",
        interests: [],
        skills: [],
        preferredSubjects: [],
        careerInterests: [],
        role: "admin"
      }
    },
    savedCareers: {
      "demo-user": ["ai-engineer", "data-scientist"]
    },
    quizAttempts: {
      "demo-user": []
    },
    conversations: {
      "demo-user": []
    },
    notifications: {
      "demo-user": [
        {
          id: "n-1",
          title: "Welcome to Edu Carrier! \ud83c\udf93",
          body: "Get started by taking our career matching quiz to see your custom recommendations.",
          timestamp: new Date().toISOString(),
          read: false
        }
      ]
    },
    customCareers: [],
    customStreams: [],
    customResources: [],
    customQuizQuestions: [],
    customColleges: [],
    customExams: [],
    customCourses: [],
    customSkills: [],
    customRoadmaps: [],
    customRecommendations: [],
    customActivities: [],
    aiConfig: {}
  };
  saveData(defaultData);
  return defaultData;
}

function saveData(data: DataStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    if (db) {
      syncToFirestore(data).catch((err: any) => {
        console.error("Error syncing to Firestore:", err);
      });
    }
  } catch (e: any) {
    console.error("Error saving data store:", e);
  }
}

async function syncToFirestore(data: DataStore) {
  if (!db) return;
  // Use independent promises rather than batch to avoid 500 limit on large datasets
  const promises: Promise<any>[] = [];
  
  // Users
  for (const [email, userObj] of Object.entries(data.users)) {
    if (userObj && userObj.id) {
      promises.push(setDoc(doc(db, "users", userObj.id), userObj, { merge: true }));
    }
  }
  
  // SavedCareers
  for (const [userId, careers] of Object.entries(data.savedCareers)) {
    promises.push(setDoc(doc(db, "savedCareers", userId), { careers }, { merge: true }));
  }

  // QuizAttempts
  for (const [userId, attempts] of Object.entries(data.quizAttempts)) {
    promises.push(setDoc(doc(db, "quizAttempts", userId), { attempts }, { merge: true }));
  }

  // Conversations
  for (const [userId, history] of Object.entries(data.conversations)) {
    promises.push(setDoc(doc(db, "conversations", userId), { history }, { merge: true }));
  }

  // Notifications
  for (const [userId, notifs] of Object.entries(data.notifications)) {
    promises.push(setDoc(doc(db, "notifications", userId), { notifs }, { merge: true }));
  }

  // System Config
  promises.push(setDoc(doc(db, "system_config", "main"), {
    customCareers: data.customCareers || [],
    customStreams: data.customStreams || [],
    customResources: data.customResources || [],
    customQuizQuestions: data.customQuizQuestions || [],
    customColleges: data.customColleges || [],
    customExams: data.customExams || [],
    customCourses: data.customCourses || [],
    customSkills: data.customSkills || [],
    customRoadmaps: data.customRoadmaps || [],
    customRecommendations: data.customRecommendations || [],
    customActivities: data.customActivities || [],
    aiConfig: data.aiConfig || {}
  }, { merge: true }));

  await Promise.all(promises);
}

async function hydrateStoreFromFirestore() {
  if (!db) return;
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    if (!usersSnap.empty) {
      const dbUsers: Record<string, any> = {};
      usersSnap.forEach((doc: any) => {
        const u = doc.data();
        if (u.email) {
          dbUsers[u.email.toLowerCase()] = u;
        }
      });
      store.users = dbUsers;
    }

    const scSnap = await getDocs(collection(db, "savedCareers"));
    if (!scSnap.empty) {
      scSnap.forEach((doc: any) => {
        store.savedCareers[doc.id] = doc.data().careers || [];
      });
    }

    const qaSnap = await getDocs(collection(db, "quizAttempts"));
    if (!qaSnap.empty) {
      qaSnap.forEach((doc: any) => {
        store.quizAttempts[doc.id] = doc.data().attempts || [];
      });
    }

    const convSnap = await getDocs(collection(db, "conversations"));
    if (!convSnap.empty) {
      convSnap.forEach((doc: any) => {
        store.conversations[doc.id] = doc.data().history || [];
      });
    }

    const notifSnap = await getDocs(collection(db, "notifications"));
    if (!notifSnap.empty) {
      notifSnap.forEach((doc: any) => {
        store.notifications[doc.id] = doc.data().notifs || [];
      });
    }

    const sysSnap = await getDoc(doc(db, "system_config", "main"));
    if (sysSnap.exists()) {
      const sysData = sysSnap.data() || {};
      store.customCareers = sysData.customCareers || [];
      store.customStreams = sysData.customStreams || [];
      store.customResources = sysData.customResources || [];
      store.customQuizQuestions = sysData.customQuizQuestions || [];
      store.customColleges = sysData.customColleges || [];
      store.customExams = sysData.customExams || [];
      store.customCourses = sysData.customCourses || [];
      store.customSkills = sysData.customSkills || [];
      store.customRoadmaps = sysData.customRoadmaps || [];
      store.customRecommendations = sysData.customRecommendations || [];
      store.customActivities = sysData.customActivities || [];
      store.aiConfig = sysData.aiConfig || {};
    }
    
    console.log("Hydrated in-memory store from Firestore");
  } catch (error: any) {
    console.error("Failed to hydrate store from Firestore:", error);
  }
}

// Global In-Memory representation synced with File
let store = loadData();
hydrateStoreFromFirestore();

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

// Helper to find a user from auth tokens or email
function findUserByEmail(email: string) {
  return store.users[email.toLowerCase()];
}

// ----------------------------------------------------------------------------
// API Endpoints
// ----------------------------------------------------------------------------

// Auth Endpoints
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, password, classLevel } = req.body;
  if (!fullName || !email || !password || !classLevel) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  const emailLower = email.toLowerCase();
  const isAdminEmail = emailLower.endsWith("@educarrier.com") || 
                       emailLower.endsWith("@educarrer.com") || 
                       emailLower.endsWith("@admin.com");
  const assignedRole = isAdminEmail ? "admin" : "student";

  const userId = "u-" + Math.random().toString(36).substring(2, 11);
  const newUser = {
    id: userId,
    fullName,
    email: emailLower,
    passwordHash: password, // simplified hashing for preview sandbox
    classLevel,
    interests: [],
    skills: [],
    preferredSubjects: [],
    careerInterests: [],
    role: assignedRole
  };

  store.users[email.toLowerCase()] = newUser;
  store.savedCareers[userId] = [];
  store.quizAttempts[userId] = [];
  store.conversations[userId] = [];
  store.notifications[userId] = [
    {
      id: "n-reg",
      title: "Account Created Successfully! \u2728",
      body: "Welcome aboard, " + fullName + "! Start exploring Streams or Career details.",
      timestamp: new Date().toISOString(),
      read: false
    }
  ];

  saveData(store);
  res.json({ message: "Registration successful", user: newUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ message: "Login successful", user });
});

// Profile Endpoints
app.get("/api/profile/:userId", (req, res) => {
  const { userId } = req.params;
  const user = Object.values(store.users).find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

app.put("/api/profile/:userId", (req, res) => {
  const { userId } = req.params;
  const userKey = Object.keys(store.users).find((k) => store.users[k].id === userId);
  if (!userKey) {
    return res.status(404).json({ error: "User not found" });
  }

  const updatedUser = {
    ...store.users[userKey],
    fullName: req.body.fullName || store.users[userKey].fullName,
    classLevel: req.body.classLevel || store.users[userKey].classLevel,
    interests: req.body.interests || store.users[userKey].interests,
    skills: req.body.skills || store.users[userKey].skills,
    preferredSubjects: req.body.preferredSubjects || store.users[userKey].preferredSubjects,
    careerInterests: req.body.careerInterests || store.users[userKey].careerInterests
  };

  store.users[userKey] = updatedUser;
  saveData(store);
  res.json(updatedUser);
});

// Bookmarks / Saved Careers
app.get("/api/saved-careers/:userId", (req, res) => {
  const { userId } = req.params;
  res.json(store.savedCareers[userId] || []);
});

app.get("/api/bookmarks/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ bookmarks: store.savedCareers[userId] || [] });
});

app.post("/api/bookmarks/toggle", (req, res) => {
  const { userId, careerId } = req.body;
  if (!userId || !careerId) {
    return res.status(400).json({ error: "userId and careerId are required" });
  }

  if (!store.savedCareers[userId]) {
    store.savedCareers[userId] = [];
  }

  const idx = store.savedCareers[userId].indexOf(careerId);
  if (idx > -1) {
    store.savedCareers[userId].splice(idx, 1);
  } else {
    store.savedCareers[userId].push(careerId);
  }

  saveData(store);
  res.json({ bookmarks: store.savedCareers[userId] });
});

app.post("/api/saved-careers/:userId", (req, res) => {
  const { userId } = req.params;
  const { careerId } = req.body;
  if (!careerId) {
    return res.status(400).json({ error: "Career ID is required" });
  }

  if (!store.savedCareers[userId]) {
    store.savedCareers[userId] = [];
  }

  if (!store.savedCareers[userId].includes(careerId)) {
    store.savedCareers[userId].push(careerId);
    saveData(store);
  }

  res.json(store.savedCareers[userId]);
});

app.delete("/api/saved-careers/:userId/:careerId", (req, res) => {
  const { userId, careerId } = req.params;
  if (store.savedCareers[userId]) {
    store.savedCareers[userId] = store.savedCareers[userId].filter((id) => id !== careerId);
    saveData(store);
  }
  res.json(store.savedCareers[userId] || []);
});

// Quiz Attempts
app.get("/api/quiz/:userId", (req, res) => {
  const { userId } = req.params;
  res.json(store.quizAttempts[userId] || []);
});

app.post("/api/quiz/:userId", (req, res) => {
  const { userId } = req.params;
  const { answers, vector } = req.body;

  if (!store.quizAttempts[userId]) {
    store.quizAttempts[userId] = [];
  }

  const attempt = {
    answers,
    vector,
    timestamp: new Date().toISOString()
  };

  store.quizAttempts[userId].push(attempt);

  // Add notification
  if (!store.notifications[userId]) {
    store.notifications[userId] = [];
  }
  store.notifications[userId].unshift({
    id: "n-quiz-" + Date.now(),
    title: "AI Career Quiz Completed \ud83c\udf93",
    body: "Your interests have been mapped. Check your personalized match scores on the Dashboard!",
    timestamp: new Date().toISOString(),
    read: false
  });

  saveData(store);
  res.json(attempt);
});

// Notifications
app.get("/api/notifications/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ notifications: store.notifications[userId] || [] });
});

app.post("/api/notifications/read/:userId", (req, res) => {
  const { userId } = req.params;
  if (store.notifications[userId]) {
    store.notifications[userId] = store.notifications[userId].map((n) => ({ ...n, read: true }));
    saveData(store);
  }
  res.json({ success: true, notifications: store.notifications[userId] || [] });
});

app.post("/api/notifications/:userId/:notificationId/read", (req, res) => {
  const { userId, notificationId } = req.params;
  if (store.notifications[userId]) {
    store.notifications[userId] = store.notifications[userId].map((n) => {
      if (n.id === notificationId) {
        return { ...n, read: true };
      }
      return n;
    });
    saveData(store);
  }
  res.json({ notifications: store.notifications[userId] || [] });
});

app.delete("/api/notifications/:userId/:notificationId", (req, res) => {
  const { userId, notificationId } = req.params;
  if (store.notifications[userId]) {
    store.notifications[userId] = store.notifications[userId].filter((n) => n.id !== notificationId);
    saveData(store);
  }
  res.json({ success: true, notifications: store.notifications[userId] || [] });
});

// AI Career Guide Chatbot
app.post("/api/ai/chat", async (req, res) => {
  const { message, history, userId } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Get user details for rich context setting
  let userContext = "";
  if (userId) {
    const user = Object.values(store.users).find((u) => u.id === userId);
    if (user) {
      userContext = `\n[Student Profile Context]:
- Student Name: ${user.fullName}
- Education Level: ${user.classLevel}
- Interests: ${user.interests.join(", ") || "None listed yet"}
- Skills: ${user.skills.join(", ") || "None listed yet"}
- Preferred Subjects: ${user.preferredSubjects.join(", ") || "None listed yet"}
- Career Interests: ${user.careerInterests.join(", ") || "None listed yet"}`;
    }
  }

  const customInstruction = store.aiConfig?.systemInstruction;
  const systemInstruction = customInstruction
    ? `${customInstruction}${userContext}`
    : `You are "Edu Carrier AI", an empathetic, highly knowledgeable, and encouraging professional career guidance counselor for Indian students (primarily Class 6 to 12 and early college).
Your goal is to answer queries about educational streams (MPC, BiPC, MEC, Arts), colleges, entrance exams, courses, and careers.
Provide structured, step-by-step career roads, skill-gap advice, and course selections.
Format your responses with clear markdown headers, bold key phrases, bullet points, and neat spacing. Avoid massive blocks of text.
Keep explanations jargon-free, objective, and realistic yet inspirational. Do not make up fake details or fake scholarships.
Whenever the student provides profile details, tailor your advice directly to their interests and academic levels.${userContext}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a simulated high-quality mock response if key is missing so the app doesn't crash
      const mockResponses: Record<string, string> = {
        "hello": `### Hello! Welcome to your AI Career Guide! \ud83c\udf93

I am **Edu Carrier AI**, your dedicated counselor. How can I assist you on your educational journey today? 
Whether you're curious about:
1. **Educational streams** (like MPC, BiPC, MEC, or Arts & Humanities)
2. **Top Colleges and Entrance Exams** (like JEE, NEET, or CLAT)
3. **Emerging Careers** (such as AI, Space Science, or Renewable Energy)

Feel free to ask me anything!`,
        "default": `### Guidance Insight from Edu Carrier AI \u2728

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
      
      // Store in memory
      if (userId) {
        if (!store.conversations[userId]) store.conversations[userId] = [];
        store.conversations[userId].push({ role: "user", text: message, timestamp: new Date().toISOString() });
        store.conversations[userId].push({ role: "model", text: reply, timestamp: new Date().toISOString() });
        saveData(store);
      }

      return res.json({ text: reply });
    }

    const ai = getGenAI();

    // Map history to Google GenAI structure
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [...formattedHistory, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I apologize, I wasn't able to construct a response. Please try asking again.";

    // Store in memory
    if (userId) {
      if (!store.conversations[userId]) store.conversations[userId] = [];
      store.conversations[userId].push({ role: "user", text: message, timestamp: new Date().toISOString() });
      store.conversations[userId].push({ role: "model", text: replyText, timestamp: new Date().toISOString() });
      saveData(store);
    }

    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "AI service is currently unavailable. Please try again later." });
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

app.get("/api/ai/chat/:userId", (req, res) => {
  const { userId } = req.params;
  res.json(store.conversations[userId] || []);
});

// Admin Panel Stats
app.get("/api/admin/stats", (req, res) => {
  const totalUsers = Object.keys(store.users).length;
  const quizAttempts = Object.values(store.quizAttempts).reduce((acc, curr) => acc + curr.length, 0);
  const totalSaved = Object.values(store.savedCareers).reduce((acc, curr) => acc + curr.length, 0);
  const aiConversations = Object.values(store.conversations).reduce((acc, curr) => acc + Math.ceil(curr.length / 2), 0);

  res.json({
    stats: {
      users: totalUsers,
      quizzes: quizAttempts,
      saved: totalSaved,
      conversations: aiConversations
    },
    users: Object.values(store.users).map((u: any) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      classLevel: u.classLevel || "Class 10",
      role: u.role || "student",
      registeredAt: u.registeredAt || new Date().toISOString()
    }))
  });
});

// GET platform custom data
app.get("/api/platform/data", (req, res) => {
  res.json({
    customCareers: store.customCareers || [],
    customStreams: store.customStreams || [],
    customResources: store.customResources || [],
    customQuizQuestions: store.customQuizQuestions || [],
    customColleges: store.customColleges || [],
    customExams: store.customExams || [],
    customCourses: store.customCourses || [],
    customSkills: store.customSkills || [],
    customRoadmaps: store.customRoadmaps || [],
    customRecommendations: store.customRecommendations || [],
    aiConfig: store.aiConfig || {}
  });
});

// POST to update platform custom data
app.post("/api/platform/save", (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) {
    return res.status(400).json({ error: "Missing type or data" });
  }

  switch (type) {
    case "careers":
      store.customCareers = data;
      break;
    case "streams":
      store.customStreams = data;
      break;
    case "resources":
      store.customResources = data;
      break;
    case "quizQuestions":
      store.customQuizQuestions = data;
      break;
    case "colleges":
      store.customColleges = data;
      break;
    case "exams":
      store.customExams = data;
      break;
    case "courses":
      store.customCourses = data;
      break;
    case "skills":
      store.customSkills = data;
      break;
    case "roadmaps":
      store.customRoadmaps = data;
      break;
    case "recommendations":
      store.customRecommendations = data;
      break;
    case "aiConfig":
      store.aiConfig = data;
      break;
    default:
      return res.status(400).json({ error: "Invalid data type" });
  }

  saveData(store);
  res.json({ success: true, message: `${type} updated successfully.` });
});

// Admin to delete/update any student
app.post("/api/admin/students/save", (req, res) => {
  const { studentId, action, data } = req.body;
  if (!studentId) {
    return res.status(400).json({ error: "Missing student ID" });
  }

  const userToModify = Object.values(store.users).find((u: any) => u.id === studentId);
  if (!userToModify) {
    return res.status(404).json({ error: "Student not found" });
  }

  const emailKey = userToModify.email.toLowerCase();

  if (action === "delete") {
    delete store.users[emailKey];
    delete store.savedCareers[studentId];
    delete store.quizAttempts[studentId];
    delete store.conversations[studentId];
    delete store.notifications[studentId];
  } else if (action === "update") {
    store.users[emailKey] = {
      ...store.users[emailKey],
      ...data
    };
  }

  saveData(store);
  res.json({ success: true, message: `Student account ${action}d successfully.` });
});

// Admin to create system-wide notifications
app.post("/api/admin/notifications/push", (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "Missing title or body" });
  }

  const newNotif = {
    id: "n-push-" + Date.now(),
    title,
    body,
    timestamp: new Date().toISOString(),
    read: false
  };

  // Push to all users
  Object.keys(store.users).forEach((email) => {
    const u = store.users[email];
    if (u && u.id) {
      if (!store.notifications[u.id]) {
        store.notifications[u.id] = [];
      }
      store.notifications[u.id].unshift(newNotif);
    }
  });

  saveData(store);
  res.json({ success: true, message: "Notification pushed to all students successfully." });
});

// GET all activities
app.get("/api/activities", (req, res) => {
  res.json({ activities: store.customActivities || [] });
});

// CREATE or UPDATE activity
app.post("/api/activities", (req, res) => {
  const activity = req.body;
  if (!activity.type || !activity.title) {
    return res.status(400).json({ error: "Missing type or title" });
  }

  if (!store.customActivities) store.customActivities = [];

  let isNew = false;
  let existingIndex = -1;

  if (activity.id) {
    existingIndex = store.customActivities.findIndex((a: any) => a.id === activity.id);
  }

  const savedActivity = {
    ...activity,
    id: activity.id || "act-" + Date.now(),
    createdAt: activity.createdAt || new Date().toISOString(),
    completions: activity.completions || [],
    participants: activity.participants || [],
    results: activity.results || []
  };

  if (existingIndex > -1) {
    const existing = store.customActivities[existingIndex];
    savedActivity.completions = activity.completions || existing.completions || [];
    savedActivity.participants = activity.participants || existing.participants || [];
    savedActivity.results = activity.results || existing.results || [];
    store.customActivities[existingIndex] = savedActivity;
  } else {
    isNew = true;
    store.customActivities.push(savedActivity);
  }

  // Push notifications if the activity is newly published or update status
  const statLower = (savedActivity.status || "").toLowerCase();
  if (statLower === "published" || statLower === "live" || statLower === "active") {
    const targetClass = savedActivity.targetAudience; // e.g. "Class 11", "Class 12", "All", "Class 11-12"
    
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
      read: false,
      activityId: savedActivity.id,
      activityType: savedActivity.type
    };

    Object.keys(store.users).forEach((email) => {
      const u = store.users[email];
      if (u && u.id && u.role !== "admin") {
        let isTarget = false;
        if (!targetClass || targetClass === "All") {
          isTarget = true;
        } else if (targetClass.toLowerCase().includes("11-12") || targetClass.toLowerCase().includes("11 - 12")) {
          isTarget = u.classLevel === "Class 11" || u.classLevel === "Class 12";
        } else if (targetClass.toLowerCase().includes("9-10") || targetClass.toLowerCase().includes("9 - 10")) {
          isTarget = u.classLevel === "Class 9" || u.classLevel === "Class 10";
        } else {
          isTarget = u.classLevel === targetClass;
        }

        if (isTarget) {
          if (!store.notifications[u.id]) {
            store.notifications[u.id] = [];
          }
          const hasNotif = store.notifications[u.id].some((n: any) => n.activityId === savedActivity.id);
          if (!hasNotif) {
            store.notifications[u.id].unshift(notificationItem);
          }
        }
      }
    });
  }

  saveData(store);
  res.json({ success: true, activity: savedActivity });
});

// DELETE activity
app.post("/api/activities/delete", (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing activity ID" });

  if (store.customActivities) {
    store.customActivities = store.customActivities.filter((a: any) => a.id !== id);
    saveData(store);
  }
  res.json({ success: true });
});

// INTERACT with activity (Complete task, quiz submission, register for event)
app.post("/api/activities/interact", (req, res) => {
  const { id, activityId, userId, action, data } = req.body;
  const targetId = id || activityId;
  if (!targetId || !userId) return res.status(400).json({ error: "Missing parameters" });

  if (!store.customActivities) store.customActivities = [];
  const act = store.customActivities.find((a: any) => a.id === targetId);
  if (!act) return res.status(404).json({ error: "Activity not found" });

  if (!act.completions) act.completions = [];
  if (!act.participants) act.participants = [];
  if (!act.results) act.results = [];

  if (action === "register" || action === "start") {
    if (!act.participants.includes(userId)) {
      act.participants.push(userId);
    }
  } else if (action === "complete") {
    if (!act.completions.includes(userId)) {
      act.completions.push(userId);
    }
    const finalScore = (data && data.score !== undefined) ? data.score : req.body.score;
    if (finalScore !== undefined) {
      const existingResIdx = act.results.findIndex((r: any) => r.userId === userId);
      const resItem = {
        userId,
        score: finalScore,
        answers: (data && data.answers) || req.body.answers || {},
        completedAt: new Date().toISOString()
      };
      if (existingResIdx > -1) {
        act.results[existingResIdx] = resItem;
      } else {
        act.results.push(resItem);
      }
    }
  }

  saveData(store);
  res.json({ success: true, activity: act });
});


// ----------------------------------------------------------------------------
// Vite and Static File Serving
// ----------------------------------------------------------------------------

if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
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
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running in development mode on http://localhost:${PORT}`);
    });
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
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running in production mode on port ${PORT}`);
  });
}
