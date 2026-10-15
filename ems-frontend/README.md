# PeopleDesk — EMS Frontend

React + Vite + Tailwind CSS frontend for the Employee Management System backend.

## Requirements
- Node.js 20+ recommended
- EMS backend running at `http://localhost:3000`

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, if `cp` is not available, copy `.env.example` to `.env` manually. The default API URL is `http://localhost:3000/api/v1`.

## Implemented screens
- Cookie-based login
- Dashboard with employee and department summaries
- Employee list, search, and create form
- Department list, search, and create form
- Attendance, leave, holiday, and reports collection views
- Responsive sidebar and route protection

## Backend integration notes
- Axios uses `withCredentials: true`; the backend must allow credentials from the Vite origin (`http://localhost:5173`).
- Login expects `POST /api/v1/auth/login` with `{ "email": "...", "password": "..." }` and a response containing `user` (or `data.user`). The backend should set the HttpOnly cookie.
- Employee and department list/create calls use the existing `/api/v1/employees` and `/api/v1/departments` routes.
- Collection views for attendance, leaves, holidays, and reports are read-only scaffolds until the backend's exact response and action contracts are confirmed.
- For a fresh browser tab, this starter stores the returned user in sessionStorage. The server's HttpOnly cookie remains the authentication credential; no JWT is saved in browser storage.
