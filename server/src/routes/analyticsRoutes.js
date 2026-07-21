import { Router } from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();
router.get("/", requireAdmin, getAnalytics);
export default router;
