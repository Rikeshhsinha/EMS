# Employee Management System (EMS)

A full-stack web application for managing employees, HR operations, attendance, leave requests, departments, and reports through role-based access control.

## Overview

The **Employee Management System (EMS)** simplifies employee administration by providing separate dashboards and permissions for Admin, HR, and Employees. It helps organizations manage employee information and streamline everyday HR workflows through a centralized platform.

## Features

### Authentication & Authorization
- Secure login and logout.
- Cookie-based authentication using HTTP-only cookies.
- Role-based access control.
- Separate access permissions for Admin, HR, and Employees.
- Account activation status checks.

### Admin Dashboard
- Access employee management workflows.
- Manage departments.
- View reports.
- Access attendance and leave management.
- Manage administrative operations.

### HR Dashboard
- Dedicated HR dashboard.
- View employee and department information.
- Access attendance and leave workflows.
- Review reports.
- View departments without administrative modification permissions.

### Employee Dashboard
- Personalized employee dashboard.
- Access attendance features.
- Submit and manage leave requests.
- Access permitted employee features.

### Attendance Management
- Attendance workflow access.
- Role-based access to attendance features.

### Leave Management
- Leave request workflow.
- Role-based access to leave features.

### Department Management
- View departments.
- Admin-only department creation, updating, and deletion.
- Role-based permissions enforced on the backend.

### Reports
- Reports accessible to authorized Admin and HR users.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- CSS / project styling

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Cookie Parser
- Helmet
- Morgan
- Express Rate Limit
- CORS

## Project Structure

```text
EMS/
├── ems-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── scripts/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── ems-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

*Note: The directory tree is illustrative; adjust it to match the actual files in your repository.*

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB or a MongoDB Atlas database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Rikeshhsinha/EMS.git
cd EMS
```

### 2. Configure the Backend

```bash
cd ems-backend
npm install
```

Create a `.env` file using `.env.example` as a reference. Configure the required database connection string, JWT secret, port, and any other environment variables required by the backend.

**Important:** Never commit your `.env` file or expose database credentials and JWT secrets publicly.

### 3. Start the Backend

```bash
npm run dev
```

The backend is configured to run locally on:

```text
http://localhost:3000
```

Health check endpoint:

```text
GET http://localhost:3000/api/v1/health
```

### 4. Configure the Frontend

Open another terminal:

```bash
cd ems-frontend
npm install
```

The frontend uses the following API base URL by default:

```text
http://localhost:3000/api/v1
```

To configure a different API URL, create a frontend `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 5. Start the Frontend

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 6. Build for Production

From the frontend directory:

```bash
npm run build
```

Vite generates the production build in the `dist` directory.

## API Overview

The backend uses a versioned API under `/api/v1`.

| Endpoint | Purpose |
|---|---|
| `/api/v1/health` | Check backend health |
| `/api/v1/auth/login` | Authenticate a user |
| `/api/v1/auth/me` | Retrieve the current authenticated user |

Additional protected routes support employee, department, attendance, leave, dashboard, and report workflows. Refer to the backend route files for the complete endpoint list and required permissions.

## Security

- Password hashing with bcryptjs.
- HTTP-only authentication cookies.
- JWT-based authentication.
- Backend middleware for authentication and role authorization.
- Inactive-account checks.
- CORS and security headers.
- Rate limiting for request protection.
- Environment variables for sensitive configuration.

Frontend route protection is used for navigation and user experience. **Backend authorization remains the security boundary** for protected operations.

## User Roles

| Feature | Admin | HR | Employee |
|---|---|---|---|
| Dashboard | Admin dashboard | HR dashboard | Employee dashboard |
| Employee workflows | Yes | Yes | Restricted |
| Department viewing | Yes | Yes | Based on route permissions |
| Department modification | Yes | No | No |
| Attendance | Yes | Yes | Yes |
| Leave workflows | Yes | Yes | Yes |
| Reports | Yes | Yes | No |

Permissions shown here reflect the intended application access model; verify individual endpoints for their exact restrictions.

## Testing Checklist

Before deploying, verify:

- [ ] Login and logout work correctly.
- [ ] Each role lands on the correct dashboard.
- [ ] Inactive users cannot log in.
- [ ] Unauthorized users cannot access protected API endpoints.
- [ ] Admin can manage departments.
- [ ] HR can view departments but cannot modify them.
- [ ] Employees see only their permitted navigation and workflows.
- [ ] Attendance and leave workflows work as expected.
- [ ] The frontend production build completes successfully.
- [ ] Environment secrets are excluded from Git.

## Future Improvements

- Employee profile management.
- Search, filtering, and pagination.
- Attendance summaries and analytics.
- Leave approval notifications.
- Employee document management.
- Automated testing.
- Production deployment and monitoring.

## Author

**Rikesh Kumar**

- GitHub: [@Rikeshhsinha](https://github.com/Rikeshhsinha)
- Project Repository: [Employee Management System](https://github.com/Rikeshhsinha/EMS)

## License

Add a license file if you intend to distribute this project under a specific open-source license.
