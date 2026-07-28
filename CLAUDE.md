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
- One responsibility per file. Treat ~150 lines as the signal to ask "should this split?" — not a hard cap, just the point where a file is probably doing more than one job
- Use environment variables for all secrets and config — never hardcode
- Always handle errors — no silent failures
- Comments explain *why*, never *what* — the code already says what it does. Only add a comment for a non-obvious constraint, a workaround, or a reason a reader couldn't infer from the code itself. If removing a comment wouldn't confuse anyone, don't write it

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

### Done — V1 complete ✓

- [x] Project setup — monorepo, Docker Compose, environment variables
- [x] Database — Supabase setup, create tables
- [x] Auth — backend routes, Supabase Auth, Google + GitHub OAuth
- [x] Frontend auth — login, signup, protected route wrapper
- [x] Add application (manual) — form, API, save to DB
- [x] Applications board — list all applications
- [x] Application detail — view and edit one application
- [x] Web scraper — parse job URLs, connect to add flow
- [x] Dashboard stats — aggregate data, charts
- [x] Polish — responsive design, error handling, loading states
- [x] Deploy — Vercel (frontend) + Render (backend) + Supabase (DB)

### Post-V1 additions

- [x] Forgot password flow — request page + reset page, PKCE flow
- [x] Login/Signup page updates

---

## Important rules for Claude Code

### Git / PR workflow

- Claude Code always works on a single shared branch: `dev-claude`. Check it out at the start of a task (creating it from `main` if it doesn't already exist) rather than branching per task. CI already runs on pushes to this branch (see `.github/workflows/ci.yml`).
- Every batch of work on `dev-claude` goes through a PR into `main` — no direct commits to `main`. Review before merge is manual: the user reads the diff and merges it themselves; GitHub's required-approval count stays at 0 since a solo repo owner can't approve their own PR. CI passing (Backend + Frontend checks, enforced by branch protection on `main`) is the automated gate; the user's read-through is the human one.
- Prefer small, testable commits over large sweeping changes.
- Always ask before deleting any file.
- Always ask before making large structural changes (schema changes, moving/renaming directories, swapping a library or service).

### Decision autonomy

- The user makes all product and scope decisions — always ask first, with no "it's obviously fine" exception. This covers: whether a feature is in scope, whether something is "done enough" to ship, and any tradeoff between two reasonable implementations.
- If something is unclear, ask — do not guess and move forward.
- Implementation details that don't change behavior or scope (variable names, which existing util to reuse, file layout within a module) don't need sign-off.

### Doc maintenance

- CLAUDE.md and PLAN.md are updated **in the same PR** as any change that adds a feature, changes a config value (ports, env vars, URLs), or changes scope — not as a follow-up cleanup later.
- At the start of a new session, don't trust CLAUDE.md's claims (env vars, ports, the done/in-progress checklist) at face value — cross-check against `git log --oneline` and the actual config files first. This repo's docs have drifted from `main` before.

---

## Environment variables needed

```
# Backend
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
PORT=3636

# Frontend (Vite — must start with VITE_)
VITE_API_URL=http://localhost:3636
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
