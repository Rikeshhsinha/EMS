import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
const router = Router();
router.use(authenticate);
router.get("/", listDepartments);
router.post("/", allowRoles("admin", "hr"), createDepartment);
router.patch("/:id", allowRoles("admin", "hr"), updateDepartment);
router.delete("/:id", allowRoles("admin"), deleteDepartment);
export default router;
