import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { dashboardSummary } from "../controllers/dashboard.controller.js";
const router = Router();
router.use(authenticate);
router.get("/summary", dashboardSummary);
export default router;
