# Edu Carrier

Edu Carrier is a career-guidance web application built with React, TypeScript, Vite, Express, SQLite, and the Google Gemini API. It helps students explore career paths and academic streams, complete a career quiz, save careers, manage their profile, browse learning resources, and use an AI-powered career guide.

> **Security notice:** This documentation describes the project as inspected. The code review identified security issues that must be fixed and re-tested before deployment, including password handling, self-service administrator role assignment, password reset verification, and authorization on private API routes. Do not deploy this version with real user data until those issues are resolved.

## Features

- **Authentication:** Registration, login, and password-reset interface.
- **Student dashboard:** Overview of career-guidance activity and student information.
- **Career quiz:** Answer questions and view career recommendations.
- **Career explorer:** Browse career options and save careers.
- **Stream explorer:** Explore academic streams and related pathways.
- **AI career guide:** Ask career-related questions using the Gemini API.
- **Profile management:** View and update student details, skills, and interests.
- **Learning resources:** Browse learning and career-development resources.
- **Bookmarks and saved careers:** Keep track of interesting career options.
- **Notifications:** Display account and platform notifications.
- **Admin panel:** Administrative views and platform-management features.

The exact features available in the interface depend on the current implementation and configuration.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React, TypeScript |
| Build tool and development server | Vite |
| Backend | Node.js, Express |
| Database | SQLite using `better-sqlite3` |
| AI integration | Google Gemini via `@google/genai` |
| Icons and motion | `lucide-react`, `motion` |
| Styling | CSS and Tailwind CSS tooling |

## Requirements

- Node.js compatible with the installed Vite version (use Node.js **20.19+** or **22.12+**).
- npm.
- A Google Gemini API key for live AI-guide responses.
- Permission to create or write to the local SQLite database.

Check the installed versions:

```bash
node --version
npm --version
```

## Installation

1. Open a terminal in the project root.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file by copying `.env.example` to `.env`:

   **Windows PowerShell**
   ```powershell
   Copy-Item .env.example .env
   ```

   **Windows Command Prompt**
   ```bat
   copy .env.example .env
   ```

   **macOS/Linux**
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and set your own Gemini API key:

   ```dotenv
   GEMINI_API_KEY=your_actual_gemini_api_key
   PORT=3000
   NODE_ENV=development
   ```

   Keep the key private. Never commit `.env` or expose the key in frontend code, screenshots, public repositories, or logs. If the AI feature is not configured, the application may show fallback behavior, but live Gemini responses will not work.

## Run the application

The Express server starts Vite middleware during development, so the frontend and API are served from the same local server.

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

To stop the server, press `Ctrl+C` in the terminal.

If port `3000` is already in use, stop the process using it or start the application with a supported port argument:

```bash
npm run dev -- --port 3001
```

Then open `http://localhost:3001`.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Express server with Vite development middleware |
| `npm run build` | Build the frontend into `dist/` |
| `npm run lint` | Run the TypeScript compiler in no-emit mode |
| `npm start` | Start the server in production mode; build the frontend first |
| `npm run clean` | Remove the `dist/` build directory on environments that support the script's shell command |

Run the production build:

```bash
npm run build
```

Run the TypeScript check:

```bash
npm run lint
```

Start the production server after building:

**macOS/Linux**
```bash
NODE_ENV=production npm start
```

**Windows PowerShell**
```powershell
$env:NODE_ENV = "production"
npm start
```

The production server serves the compiled frontend from `dist/` and uses the port specified by `PORT`, falling back to `3000`.

> The current package scripts do not define a dedicated automated test or browser E2E command. Add and configure a test suite before relying on automated regression testing.

## Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `GEMINI_API_KEY` | Server-side key used for Gemini AI requests | Required for live AI responses |
| `PORT` | Port used by the Express server | Optional; defaults to `3000` |
| `NODE_ENV` | Selects development or production server behavior | Set to `production` for production deployment |
| `APP_URL` | Optional deployment URL documented in the environment template | Configure only if used by your deployment or application flow |

Use `.env.example` as a template. Put actual secrets only in a local `.env` file or your deployment platform's secret manager.

## Data storage

The application uses SQLite through `better-sqlite3`. The database initialization and query helpers are located in:

```text
src/db/sqlite.ts
```

A local `database.sqlite` file may be created or used by the application. Back it up before schema changes or migrations. Do not delete or recreate a database containing user data unless you explicitly intend to reset it and have a verified backup.

For testing, use a separate temporary database and test accounts. Never run destructive test cases against the original database.

## Project structure

```text
edu-carrier/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx
│   │   ├── AiGuide.tsx
│   │   ├── Auth.tsx
│   │   ├── CareerExplorer.tsx
│   │   ├── CareerQuiz.tsx
│   │   ├── FloatingAi.tsx
│   │   ├── Home.tsx
│   │   ├── Profile.tsx
│   │   ├── Resources.tsx
│   │   └── StreamExplorer.tsx
│   ├── db/
│   │   └── sqlite.ts
│   ├── App.tsx
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── server.ts
├── index.html
├── package.json
├── .env.example
└── README.md
```

## API overview

The Express server exposes JSON endpoints under `/api`. The route groups in the current implementation include:

- Authentication: `/api/auth/register`, `/api/auth/login`, `/api/auth/reset-password`
- Profile: `/api/profile/:userId`
- Saved careers and bookmarks
- Career quiz attempts
- Notifications
- AI chat
- Administrative statistics and platform-management operations
- Custom activity operations

Refer to `server.ts` for the exact route definitions and request/response shapes.

**Important:** Before production use, verify that every private route requires authentication and enforces ownership or administrator permissions on the server. Hiding a button in the frontend is not access control.

## Security and production checklist

Before using real accounts or deploying publicly, verify that all of the following have been implemented and tested:

- [ ] Passwords are stored using a secure password-hashing algorithm; plaintext passwords are never stored.
- [ ] Passwords and password hashes are never returned by API endpoints.
- [ ] Public registration cannot assign an administrator role.
- [ ] Password reset requires a secure, expiring, single-use verification token.
- [ ] All private API routes authenticate requests and enforce authorization.
- [ ] Users cannot read or change another user's profile, quiz attempts, bookmarks, saved careers, or notifications.
- [ ] Administrative endpoints enforce server-side administrator authorization.
- [ ] Registration and notification creation use unique IDs and safe transactions.
- [ ] Inputs are validated, request sizes are limited, and sensitive endpoints are rate-limited.
- [ ] CORS, security headers, cookie/session settings, and CSRF protections are appropriate to the chosen authentication design.
- [ ] Environment secrets are not committed or exposed to the browser.
- [ ] Database migrations preserve existing data and are tested against a backup or disposable database.
- [ ] Dependency, build, and test checks pass.
- [ ] Authentication, authorization, and primary user journeys have automated regression tests.
- [ ] Production logs do not contain passwords, tokens, API keys, or unnecessary personal data.

Do not mark a checklist item complete until the implementation has been reviewed and verified.

## Troubleshooting

### Dependencies fail to install

- Confirm the Node.js version is compatible with the installed Vite version.
- Run `npm install` from the project root.
- Check network access and native build-tool requirements for `better-sqlite3`.
- Review the first meaningful error in the terminal output before changing dependencies or deleting the lockfile.

### The AI career guide does not respond

- Check that `GEMINI_API_KEY` is configured in the server's environment.
- Restart the server after changing `.env`.
- Check server logs for provider errors without printing the API key.
- Confirm the API key is valid and has access to the configured Gemini service.

### The database fails to open

- Confirm the application has permission to read and write the database location.
- Back up the database before attempting recovery or migration.
- Review the startup error and the database initialization code in `src/db/sqlite.ts`.
- Do not delete the database as a first troubleshooting step.

### Port 3000 is occupied

Stop the other process or start the app on another port:

```bash
npm run dev -- --port 3001
```

## Testing recommendations

After implementing the security fixes, create automated unit, API integration, and browser E2E tests. At minimum, test:

1. Registration of multiple users without notification ID collisions.
2. Successful and unsuccessful login, plus logout and session invalidation.
3. Password reset with valid, expired, invalid, and reused tokens.
4. Rejection of unauthorized profile, quiz, bookmark, and notification access.
5. Rejection of administrator API requests from ordinary users.
6. Career quiz completion and result persistence.
7. Career saving and bookmark persistence after reload.
8. AI chat input validation and correct skills/interests context.
9. Dashboard cards, navigation, loading states, errors, and empty states.
10. Production build and server startup.

Record actual test outcomes. A test that was not executed must be marked **Not run** or **Blocked**, not Passed.

## Contributing and maintenance

- Keep changes focused and preserve existing working features.
- Add regression tests for every fixed defect.
- Keep dependencies and lockfiles in sync.
- Never commit `.env`, API keys, real user databases, or test credentials.
- Update this README when setup commands, environment variables, scripts, API behavior, or features change.

## License

No license information was supplied with the inspected project. Add a `LICENSE` file and update this section if the project is to be distributed publicly.