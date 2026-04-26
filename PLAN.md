# On-Track — Project Plan

## What is On-Track?

On-Track is a full-stack job application tracker for job seekers. Instead of manually filling out a spreadsheet, users paste a job listing URL and the app automatically scrapes and fills in the details. Users can then track each application through its stages, view statistics about their job search, and update statuses manually.

---

## Tech Stack

| Layer     | Technology              | Hosting              |
| --------- | ----------------------- | -------------------- |
| Frontend  | React + plain CSS       | Vercel (free)        |
| Backend   | Node.js + Express       | Render (free tier)   |
| Database  | PostgreSQL              | Supabase (free tier) |
| Auth      | Supabase Auth           | Supabase             |
| Container | Docker + Docker Compose | Local dev            |

---

## Application Stages

Every job application moves through these stages:

```
Applied → Phone Screen → Interview → Final Round → Offer → Rejected / Withdrawn
```

---

## Pages

| Page               | Route             | Access        | Description                       |
| ------------------ | ----------------- | ------------- | --------------------------------- |
| Landing            | /                 | Public        | Marketing page, CTA to sign up    |
| Sign Up            | /signup           | Public        | Email/password, Google, GitHub    |
| Login              | /login            | Public        | Email/password, Google, GitHub    |
| Dashboard          | /dashboard        | Auth required | Stats overview, recent activity   |
| Applications board | /applications     | Auth required | All jobs, filterable and sortable |
| Application detail | /applications/:id | Auth required | Full detail for one job           |
| Add application    | /applications/new | Auth required | Paste URL or fill manually        |

---

## Features — Version 1

### Authentication

- Email + password signup and login
- Google OAuth
- GitHub OAuth
- JWT session management
- Protected routes (redirect to login if not authenticated)

### Add application

- User pastes a job listing URL
- Backend scraper automatically extracts:
  - Job title
  - Company name
  - Location (remote / hybrid / onsite)
  - Salary range (if listed)
  - Job description summary
  - Date posted
- User reviews the scraped data before saving
- Fallback: user can also add an application manually without a URL

### Applications board

- View all applications in a table or kanban-style board
- Filter by: stage, company, date added
- Sort by: date added, company name, stage
- Quick status update from the board (no need to open detail page)

### Application detail page

- Full view of one application
- Edit any field
- Update the stage / status
- Add notes

### Dashboard

- Total applications submitted
- Response rate (% that replied)
- Interview rate (% that led to interview)
- Applications by stage (bar or donut chart)
- Recent activity feed

### Web scraper

- Node.js backend scraper using `cheerio` or `puppeteer`
- Accepts a URL, returns structured job data
- Handles common job boards: LinkedIn, Indeed, Greenhouse, Lever, Workday
- Graceful fallback if scraping fails (show form for manual entry)

---

## Features — Version 2 (future)

- Gmail listener — scan inbox for replies from companies and auto-update status
- Browser extension — one-click "Add to On-Track" from any job listing page
- Resume upload — attach a resume version to each application
- Notes and reminders — set follow-up reminders per application
- Advanced analytics — timeline charts, response time averages
- Export to CSV

---

## Database Schema (simplified)

### users

- id (uuid, primary key)
- email (string, unique)
- name (string)
- avatar_url (string, nullable)
- provider (email | google | github)
- created_at (timestamp)

### applications

- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- job_title (string)
- company_name (string)
- location (string)
- remote_type (remote | hybrid | onsite)
- salary_range (string, nullable)
- job_description (text, nullable)
- job_url (string, nullable)
- stage (applied | screen | interview | final | offer | rejected | withdrawn)
- date_applied (date)
- date_posted (date, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

---

## Monorepo Structure

```
on-track/
├── PLAN.md
├── CLAUDE.md
├── docker-compose.yml
├── .env.example
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/    (API calls)
│   │   └── styles/
│   └── public/
└── backend/
    ├── package.json
    ├── src/
    │   ├── routes/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── scraper/
    │   └── db/
    └── Dockerfile
```

---

## Development Order (V1)

1. Project setup — monorepo, Docker Compose, environment variables
2. Database — set up Supabase, create tables, test connection
3. Auth — backend auth routes, Supabase Auth integration, Google + GitHub OAuth
4. Frontend auth — login page, signup page, protected route wrapper
5. Add application (manual) — form, API route, save to DB
6. Applications board — fetch and display all applications for the user
7. Application detail page — view and edit a single application
8. Web scraper — build scraper, connect to Add Application flow
9. Dashboard stats — aggregate queries, charts
10. Polish — responsive layout, error handling, loading states
11. Deploy — Vercel (frontend) + Render (backend) + Supabase (DB)
