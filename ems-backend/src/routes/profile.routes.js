import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMyProfile, updateMyProfile } from "../controllers/profile.controller.js";
const router = Router();
router.use(authenticate);
router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
export default router;
