import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    return Promise.reject(Object.assign(error, { userMessage: message }));
  },
);

export const endpoint = {
  health: "/health",
  login: "/auth/login",
  logout: "/auth/logout",
  employees: "/employees",
  departments: "/departments",
  attendance: "/attendance",
  leaves: "/leaves",
  holidays: "/holidays",
  notifications: "/notifications",
  dashboard: "/dashboard/summary",
  reports: "/reports",
};
export default api;
