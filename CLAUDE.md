# CLAUDE.md — On-Track

This file gives Claude Code full context for every session. Read this before doing anything.

---

## What this project is

On-Track is a full-stack multi-user job application tracker. Users log in, paste a job listing URL, and the app automatically scrapes the job details and saves the application. Users can track each application through stages, view stats on their job search, and update statuses manually.

This is a portfolio project. Code quality, clean structure, and impressive features matter.

---

## Tech stack

- **Frontend**: React + plain CSS (no UI libraries unless explicitly asked)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth (email/password + Google OAuth + GitHub OAuth)
- **Dev environment**: Docker + Docker Compose
- **Frontend hosting**: Vercel
- **Backend hosting**: Render

---

## Monorepo structure

```
on-track/
├── PLAN.md          ← full feature plan, read this too
├── CLAUDE.md        ← this file
├── docker-compose.yml
├── .env.example
├── frontend/        ← React app
└── backend/         ← Node/Express server
```

---

## Coding conventions

- Use `async/await`, not `.then()` chains
- Use `const` and `let`, never `var`
- Use named exports, not default exports (except React page components)
- Keep files small and focused — one responsibility per file
- Use environment variables for all secrets and config — never hardcode
- Always handle errors — no silent failures
- Write comments for anything non-obvious

### Frontend conventions

- Component files: `PascalCase.jsx`
- CSS files: `ComponentName.css` co-located with component
- API calls go in `src/services/` — never directly in components
- Custom hooks go in `src/hooks/`

### Backend conventions

- Route files: `kebab-case.js` inside `src/routes/`
- Controllers go in `src/controllers/`
- Database queries go in `src/db/`
- Middleware goes in `src/middleware/`
- Use `express-async-errors` or wrap async routes in try/catch

---

## Database tables

### users

- id, email, name, avatar_url, provider, created_at

### applications

- id, user_id (FK), job_title, company_name, location, remote_type, salary_range, job_description, job_url, stage, date_applied, date_posted, notes, created_at, updated_at

### Stages (enum)

applied → screen → interview → final → offer → rejected → withdrawn

---

## Auth flow

- Supabase Auth handles sessions and tokens
- Backend verifies Supabase JWT on every protected route
- Frontend stores session in React context, redirects unauthenticated users to /login

---

## What is done vs what is in progress

Update this section as work progresses.

### Done

- [x] Project setup — monorepo, Docker Compose, environment variables
- [x] Database — Supabase setup, create tables
- [x] Auth — backend routes, Supabase Auth, Google + GitHub OAuth
- [x] Frontend auth — login, signup, protected route wrapper
- [x] Add application (manual) — form, API, save to DB
- [x] Applications board — list all applications
- [x] Application detail — view and edit one application
- [x] Web scraper — parse job URLs, connect to add flow
- [x] Dashboard stats — aggregate data, charts

### Done (continued)

- [x] Polish — responsive design, error handling, loading states

### Todo (in order)

11. Deploy — Vercel + Render + Supabase

---

## Important rules for Claude Code

- Always ask before deleting any file
- Always ask before making large structural changes
- Keep the PLAN.md and this CLAUDE.md up to date as things get built
- If something is unclear, ask — do not guess and move forward
- Prefer small, testable commits over large sweeping changes
- The user (the developer) makes all product decisions — Claude Code implements them

---

## Environment variables needed

```
# Backend
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
PORT=3001

# Frontend (Vite — must start with VITE_)
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
