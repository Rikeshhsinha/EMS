# EMS Backend (MERN)

Modular Express + MongoDB backend for an Employee Management System. API prefix: `/api/v1`.

## Features
- Login/logout/current user with JWT stored in an HTTP-only cookie
- Roles: `admin`, `hr`, `employee`
- Employee and department management
- Employee self-service profile
- Attendance check-in/check-out and HR correction
- Leave application, overlap checks, HR/Admin approval/rejection and notifications
- Holidays, in-app notifications, dashboard summaries and aggregate reports
- Pagination, basic search/filtering, Helmet, CORS credentials, login rate limiting, centralized errors

## Requirements
- Node.js 20+ recommended
- MongoDB local or MongoDB Atlas

## Setup (Windows PowerShell)
```powershell
cd ems-backend
npm install
Copy-Item .env.example .env
```
Edit `.env`: set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, admin credentials, and `CLIENT_URL=http://localhost:5173`.

For production set `NODE_ENV=production`, `COOKIE_SECURE=true`, HTTPS, and a suitable `COOKIE_SAME_SITE` value. If frontend and API are on different sites, use `sameSite=none` and `secure=true`, and implement CSRF protection before deployment.

```powershell
npm run seed:admin
npm run dev
```
Health check: `http://localhost:5000/api/v1/health`

## Authentication and frontend
Login sets the `ems_token` cookie. Browser requests must include credentials:
```js
axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true
});
```
Do not store JWT in localStorage. CORS must use the exact frontend origin when credentials are enabled.

## API summary
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/change-password`
- `GET /profile/me`, `PATCH /profile/me`
- `/employees`: GET list (admin/hr), POST create (admin/hr), GET `/:id` (own record for employees), PATCH `/:id` (admin/hr), PATCH `/:id/status` (admin)
- `/departments`: GET list, POST/PATCH (admin/hr), DELETE (admin; soft deactivation)
- `/attendance`: POST `/check-in`, PATCH `/check-out`, GET `/me`, GET list (admin/hr), PATCH `/:id` correction (admin/hr)
- `/leaves`: POST apply, GET `/me`, GET list (admin/hr), PATCH `/:id/decision` (admin/hr), PATCH `/:id/cancel` (owner; pending only)
- `/holidays`: GET list, POST/PATCH (admin/hr), DELETE (admin)
- `/notifications`: GET own, PATCH `/:id/read`, PATCH `/read-all`, POST (admin/hr)
- `/dashboard/summary`
- `/reports/attendance`, `/reports/leaves`, `/reports/employees` (admin/hr)

All request bodies are JSON. Login body: `{ "email": "...", "password": "..." }`.
Create employee body example:
```json
{
  "firstName": "Asha",
  "lastName": "Sharma",
  "email": "asha@example.com",
  "password": "ChangeMe123!",
  "employeeCode": "EMP-1001",
  "jobTitle": "Frontend Developer",
  "joiningDate": "2026-10-15",
  "department": "<existing Department ObjectId>",
  "role": "employee"
}
```
To create a department first, use `POST /departments` as admin/HR with `{ "name": "Engineering", "code": "ENG" }`.

## Important implementation notes
- This is a solid educational starter, not a security-audited production HR system.
- Add CSRF protection for cookie-authenticated write requests, audit logs, schema validation (e.g. Zod/Joi), automated tests, and a defined timezone/business calendar before production.
- Attendance date keys currently use the server's local timezone; configure the server timezone or change date handling to your business timezone before deployment.
- The report aggregation endpoints return counts by status, not a payroll or legally compliant timekeeping calculation.
- Password reset email delivery, file/avatar upload storage, audit trails, and notification delivery outside the app are not implemented.
- Employee creation is a multi-document operation; use MongoDB transactions if deployed on a replica set and you need atomic guarantees.
- Do not expose private HR records to employees. Review permissions and data fields before production.
