# Edu Carrier 🎓

Edu Carrier is an AI-powered career guidance platform designed to help students discover career pathways, assess their skills, and receive personalized career counseling.

---

## ✨ Features

- **Career & Stream Explorer**: Browse career paths, salary insights, and required academic streams.
- **Interactive Career Quiz**: Take assessments to get tailored career recommendations.
- **AI Career Guide**: Chat in real time with an AI counselor powered by Google Gemini.
- **Student Profile & Dashboard**: Track saved careers, review quiz results, and manage your skills.
- **Admin Panel**: Manage resources, view student activity, and monitor platform usage.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express
- **Database**: SQLite (`better-sqlite3`)
- **AI Engine**: Google Gemini API (`@google/genai`)

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **npm**

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and insert your Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 4. Start the App
```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Express + Vite) |
| `npm run build` | Build frontend for production into `dist/` |
| `npm start` | Run server in production mode |
| `npm run lint` | Check TypeScript types without emitting files |
| `npm test` | Run test suite with Vitest |

---

## 📁 Project Structure

```text
edu-carrier/
├── src/
│   ├── components/      # UI components (Home, Quiz, AI Guide, Admin, etc.)
│   ├── db/              # SQLite database setup and queries
│   ├── App.tsx          # Main application router/entry
│   ├── data.ts          # Default career and stream data
│   └── types.ts         # TypeScript interfaces and models
├── server.ts            # Express server (API endpoints + Vite middleware)
├── .env.example         # Environment template
└── package.json         # Scripts and dependencies
```
