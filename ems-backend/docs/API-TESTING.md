# Quick API test sequence (Postman)

1. `GET http://localhost:5000/api/v1/health`
2. `POST /api/v1/auth/login` JSON `{ "email": "admin@example.com", "password": "your .env admin password" }`; enable cookie persistence in Postman.
3. `POST /api/v1/departments` JSON `{ "name": "Engineering", "code": "ENG" }`.
4. `POST /api/v1/employees` with required employee fields and department ID.
5. Login as employee, then `GET /api/v1/profile/me`, `POST /api/v1/attendance/check-in`, `POST /api/v1/leaves`.
6. Login as HR/Admin and `GET /api/v1/leaves?status=pending`, then `PATCH /api/v1/leaves/:id/decision` JSON `{ "decision": "approved", "reviewComment": "Approved" }`.
7. `GET /api/v1/dashboard/summary`, `GET /api/v1/reports/attendance`.

Remember: keep cookies between requests; do not paste tokens into localStorage or source code.
