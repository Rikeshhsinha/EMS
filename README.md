# Employee Management System (EMS)

A full-stack employee management application with separate Admin, HR, and Employee experiences.

## Features

- Cookie-based authentication and role-based authorization
- Employee and department management
- Attendance and leave workflows
- Dashboard summaries and reports
- Health-check endpoint for deployment monitoring

## Tech stack

- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB / MongoDB Atlas
- **Authentication:** JWT in an HTTP-only cookie

## Repository layout

```text
EMS/
├── ems-backend/
└── ems-frontend/
```

## Run locally

Requirements: Node.js (20+ recommended) and MongoDB.

### Backend

```bash
cd ems-backend
npm ci
```

Create `.env` from `.env.example` and configure `MONGODB_URI`, `JWT_SECRET` (at least 32 characters), and admin seed variables.

```bash
npm run dev
```

The backend defaults to `http://localhost:5000`. Health check: `GET /api/v1/health`.

To create the initial administrator after setting the environment variables, run this once:

```bash
npm run seed:admin
```

The script leaves an existing account unchanged. Use a strong, unique admin password.

### Frontend

In another terminal:

```bash
cd ems-frontend
npm ci
```

Create a frontend `.env` based on `.env.example` and set `VITE_API_BASE_URL=http://localhost:5000/api/v1`.

```bash
npm run dev
```

Check the production bundle with `npm run build`.

## Deploy

### Backend (Render)

Create a Web Service from this repository:

- Root Directory: `ems-backend`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/api/v1/health`

Configure these environment variables in Render (do not commit their values):

- `NODE_ENV=production`
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: random secret of at least 32 characters
- `JWT_EXPIRES_IN=1d`
- `COOKIE_NAME=ems_token`
- `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=none` when frontend and backend are on different sites
- `CLIENT_URL`: exact deployed frontend origin, e.g. `https://your-app.vercel.app`
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: only needed when seeding the first admin

Render provides `PORT` automatically. Allow the hosted service to connect to your Atlas cluster through Atlas Network Access. Prefer the narrowest feasible access policy; avoid exposing the database to the entire internet where possible.

### Frontend (Vercel)

Import the repository and configure:

- Root Directory: `ems-frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://your-api.onrender.com/api/v1`

Replace example URLs with your real deployed URLs and redeploy after changing environment variables. The `vercel.json` file supplies the SPA fallback so direct navigation and refreshes resolve to the React app.

### Cookie and CORS notes

The API uses credentialed CORS and the exact `CLIENT_URL` origin. In production, cross-site cookie authentication needs HTTPS and `SameSite=None; Secure`. Some browsers may block third-party cookies across unrelated domains; if that occurs, use a same-site custom-domain setup or a same-origin proxy. Do not disable HTTP-only cookies or backend role authorization to work around cookie issues.

## Pre-launch checklist

- [ ] Atlas connection succeeds from the hosted backend
- [ ] `/api/v1/health` returns HTTP 200
- [ ] Frontend loads without build errors
- [ ] Login, logout, and session refresh work in the deployed browser
- [ ] Admin, HR, and Employee roles see the correct dashboards
- [ ] Protected API routes reject unauthorized requests
- [ ] Employee, attendance, department, and leave workflows have been tested
- [ ] No secrets are committed to Git

## Author

Rikesh Kumar — [GitHub](https://github.com/Rikeshhsinha)
