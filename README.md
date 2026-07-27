# Client Lead Management System (Mini CRM)

A small, real MERN-stack CRM for tracking leads from "someone filled out a
contact form" through to "converted client." Built as Task 2 for the Full
Stack Web Development internship program.

## What it does

- Admins log in with an email/password (JWT stored in an httpOnly cookie, no
  tokens sitting in localStorage).
- Every lead has a name, email, phone, company, source, and status.
- Leads move through a status pipeline: `New → Contacted → Qualified →
  Proposal → Negotiation → Converted`, or `Lost` at any point.
- Each lead has a notes thread for follow-ups, plus an auto-generated
  activity timeline (created, status changed, note added).
- The dashboard shows lead counts by status, a conversion rate, and a feed
  of recent activity across all leads.
- The leads table supports search (name/email/company) and status filtering.
- Every `/api/leads*` and `/api/dashboard*` route is behind auth middleware —
  no token, no data.

## Tech stack

| Layer    | Choice                                                   |
|----------|-----------------------------------------------------------|
| Frontend | React 18, React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS |
| Backend  | Node.js, Express                                          |
| Database | MongoDB (Mongoose)                                         |
| Auth     | JWT in an httpOnly cookie, bcrypt-hashed passwords         |

## Project structure

```
crm-project/
  backend/
    config/db.js          Mongo connection
    controllers/           auth, leads, notes, dashboard logic
    middleware/            JWT auth guard, error handler
    models/                Lead, User, Note, Activity
    routes/                REST route definitions
    seed.js                creates an admin user + sample leads
    server.js
  frontend/
    src/
      api/axios.js          shared axios instance
      context/AuthContext.jsx
      components/           Navbar, Sidebar, PrivateRoute
      layouts/MainLayout.jsx
      pages/
        Login/
        Dashboard/
        Leads/               lead list, search & filter
        LeadDetail/          profile, notes, status changer, activity log
        LeadForm/             create / edit lead
```

## Setup

You'll need Node 18+ and a MongoDB instance (local install, or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster — either works).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET if needed
npm run seed               # creates the first admin user + 5 sample leads
npm run dev                 # starts on http://localhost:5000
```

The seed script prints the admin credentials it created (defaults to
`admin@example.com` / `admin123` — change `ADMIN_PASSWORD` in `.env` before
seeding if you want something else, or just change it after logging in).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm start                   # starts on http://localhost:3000
```

Log in with the seeded admin credentials and you're in.

### Troubleshooting

- **`npm run build` fails with "Environment key jest/globals is unknown"** —
  this is a known version mismatch between `react-scripts@5` and
  `eslint-plugin-jest`, unrelated to this project's code. The included
  `.env` already sets `DISABLE_ESLINT_PLUGIN=true` to work around it.
- **Login fails silently / 401 on every request** — double check
  `CLIENT_URL` in the backend `.env` matches the URL you're loading the
  frontend from, and that both `.env` files exist (they're gitignored).
- **MongoDB connection error on startup** — confirm `MONGO_URI` in
  `backend/.env` points at a running Mongo instance.

## API overview

| Method | Route                    | Description                    |
|--------|---------------------------|---------------------------------|
| POST   | `/api/auth/login`          | Log in, sets auth cookie        |
| POST   | `/api/auth/logout`         | Clear auth cookie               |
| GET    | `/api/auth/me`              | Current logged-in user          |
| GET    | `/api/leads`                 | List leads (`?search=&status=`) |
| POST   | `/api/leads`                  | Create a lead                   |
| GET    | `/api/leads/:id`               | Lead + its notes + activity     |
| PUT    | `/api/leads/:id`                | Update a lead (incl. status)    |
| DELETE | `/api/leads/:id`                 | Delete a lead                    |
| GET    | `/api/leads/:id/notes`            | List notes for a lead            |
| POST   | `/api/leads/:id/notes`             | Add a note                        |
| GET    | `/api/dashboard/stats`              | Counts, conversion rate, recent activity |

All routes except `/api/auth/login` require the auth cookie.

## Notes on scope

This covers the required features (lead listing, status updates, notes,
protected admin access) plus the bonus items called out in the brief:
search/filter, timestamps on everything, and a stats dashboard. Things it
deliberately leaves out, as fair next steps rather than gaps in the current
scope: role-based permissions beyond admin/manager/sales on the schema,
email notifications, and CSV export.
