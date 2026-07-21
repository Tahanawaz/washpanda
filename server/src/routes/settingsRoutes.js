import { Router } from "express";
import { getAdminSettings, getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();
router.get("/admin", requireAdmin, getAdminSettings);
router.get("/", getSettings);
router.patch("/", requireAdmin, updateSettings);
export default router;
