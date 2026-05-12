# On-Track

A full-stack job application tracker. Paste a job listing URL and On-Track automatically pulls in the job details. Track every application through its stages, view stats on your search, and never lose track of where you stand.

---

## What it does

- Paste a job URL — the app scrapes the title, company, location, salary, and description automatically
- Add applications manually if you prefer
- Move each application through stages: Applied → Screen → Interview → Final → Offer → Rejected / Withdrawn
- View dashboard stats: total applications, response rate, interview rate, applications by stage
- Edit any field on an application at any time
- Supports email/password login, Google OAuth, and GitHub OAuth

---

## Tech stack

| Layer    | Technology              | Hosting      |
|----------|-------------------------|--------------|
| Frontend | React + plain CSS       | Vercel       |
| Backend  | Node.js + Express       | Render       |
| Database | PostgreSQL               | Supabase     |
| Auth     | Supabase Auth           | Supabase     |
| Dev env  | Docker + Docker Compose | Local only   |

---

## Project structure

```
on-track/
├── docker-compose.yml        # runs frontend + backend together locally
├── .env.example              # copy this to .env and fill in your values
├── frontend/                 # React app (Vite)
│   └── src/
│       ├── components/       # reusable UI pieces (Sidebar, EditableField, charts...)
│       ├── pages/            # one file per route (Landing, Login, MainApp, etc.)
│       ├── hooks/            # custom React hooks
│       ├── services/         # all API calls live here, not in components
│       └── context/          # AuthContext — session state shared across the app
└── backend/                  # Node/Express API
    └── src/
        ├── routes/           # URL routing (auth, applications, scraper)
        ├── controllers/      # request handlers
        ├── middleware/        # JWT auth check
        ├── db/               # Supabase queries + schema.sql
        └── scraper/          # job URL scraper (Greenhouse, Lever, generic, Puppeteer)
```

---

## Pages and routes

| Page               | URL               | Who can access   |
|--------------------|-------------------|------------------|
| Landing            | `/`               | Everyone         |
| Sign up            | `/signup`         | Guests only      |
| Log in             | `/login`          | Guests only      |
| Dashboard / Board  | `/app`            | Logged-in users  |
| Add application    | `/app/new`        | Logged-in users  |
| Application detail | `/app/:id`        | Logged-in users  |

---

## API endpoints

| Method | Endpoint              | What it does                          |
|--------|-----------------------|---------------------------------------|
| GET    | `/health`             | Health check — confirms DB connection |
| POST   | `/auth/signup`        | Create account                        |
| POST   | `/auth/login`         | Log in                                |
| GET    | `/applications`       | Get all applications for the user     |
| POST   | `/applications`       | Create a new application              |
| GET    | `/applications/:id`   | Get one application                   |
| PUT    | `/applications/:id`   | Update an application                 |
| DELETE | `/applications/:id`   | Delete an application                 |
| POST   | `/scraper`            | Scrape a job URL                      |

All `/applications` and `/scraper` routes require a valid Supabase JWT in the `Authorization` header.

---

## How the scraper works

1. If the URL is a **Greenhouse** or **Lever** job board link, the scraper uses Cheerio (fast, no browser needed).
2. For any other URL, it first tries a generic Cheerio pass — looks for JSON-LD structured data and Open Graph meta tags.
3. If that doesn't return a job title and company name, it falls back to **Puppeteer** (headless Chrome) to handle JavaScript-rendered pages like LinkedIn.

---

## Local development setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd on-track
cp .env.example .env
```

Open `.env` and fill in every value (see the section below).

### 2. Set up the database

In the Supabase dashboard, open the **SQL Editor** and run the contents of:

```
backend/src/db/schema.sql
```

This creates the `users` and `applications` tables.

### 3. Start the app

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health

To stop: `docker compose down`

### 4. Run without Docker (optional)

If you prefer running the services directly:

**Backend**
```bash
cd backend
npm install
npm run dev       # starts with nodemon, auto-restarts on file changes
```

**Frontend**
```bash
cd frontend
npm install
npm run dev       # starts Vite dev server
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in these values:

```env
# Backend
DATABASE_URL=            # your Supabase PostgreSQL connection string
SUPABASE_URL=            # https://your-project.supabase.co
SUPABASE_ANON_KEY=       # from Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=  # from Supabase → Settings → API (keep this secret)
JWT_SECRET=              # any random string, used to verify tokens
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend (must start with VITE_ so Vite exposes them to the browser)
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=       # same as SUPABASE_URL above
VITE_SUPABASE_ANON_KEY=  # same as SUPABASE_ANON_KEY above
```

---

## Running tests

**Frontend**
```bash
cd frontend
npm test           # watch mode
npm run test:run   # run once and exit (used in CI)
```

**Backend**
```bash
cd backend
npm test
npm run test:run
```

Tests use [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com).

---

## Deployment

| Service  | Platform | Notes                                                  |
|----------|----------|--------------------------------------------------------|
| Frontend | Vercel   | Connect the `frontend/` folder; set all `VITE_` env vars in the Vercel dashboard |
| Backend  | Render   | Connect the `backend/` folder; set all backend env vars in Render; start command: `npm start` |
| Database | Supabase | Already hosted — just keep your keys safe              |

---

## Database schema

### `users`

| Column     | Type      | Notes                              |
|------------|-----------|------------------------------------|
| id         | UUID (PK) | Auto-generated                     |
| email      | TEXT      | Unique                             |
| name       | TEXT      |                                    |
| avatar_url | TEXT      | Nullable                           |
| provider   | TEXT      | `email`, `google`, or `github`     |
| created_at | TIMESTAMP |                                    |

### `applications`

| Column          | Type      | Notes                                                       |
|-----------------|-----------|-------------------------------------------------------------|
| id              | UUID (PK) | Auto-generated                                              |
| user_id         | UUID (FK) | References `users.id`                                       |
| job_title       | TEXT      | Required                                                    |
| company_name    | TEXT      | Required                                                    |
| location        | TEXT      | Nullable                                                    |
| remote_type     | TEXT      | `remote`, `hybrid`, or `onsite`                             |
| salary_range    | TEXT      | Nullable                                                    |
| job_description | TEXT      | Nullable                                                    |
| job_url         | TEXT      | Nullable                                                    |
| stage           | ENUM      | `applied` → `screen` → `interview` → `final` → `offer` → `rejected` / `withdrawn` |
| date_applied    | DATE      | Defaults to today                                           |
| date_posted     | DATE      | Nullable                                                    |
| notes           | TEXT      | Nullable                                                    |
| created_at      | TIMESTAMP |                                                             |
| updated_at      | TIMESTAMP | Auto-updated on every change                                |

---

## Planned features (V2)

- Gmail integration — auto-detect replies from companies and update application status
- Browser extension — one-click "Add to On-Track" from any job listing page
- Resume upload — attach a resume version to each application
- Follow-up reminders per application
- Advanced analytics — timeline charts, average response times
- CSV export
