import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  setEmployeeStatus,
  changeEmployeeRole,
} from "../controllers/employee.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", allowRoles("admin", "hr"), listEmployees);

router.post("/", allowRoles("admin", "hr"), createEmployee);

router.get("/:id", getEmployee);

router.patch("/:id/role", allowRoles("admin"), changeEmployeeRole);

router.patch("/:id", allowRoles("admin", "hr"), updateEmployee);

router.patch("/:id/status", allowRoles("admin"), setEmployeeStatus);

export default router;
