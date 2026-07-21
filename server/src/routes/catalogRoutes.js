import { Router } from "express";
import { getAdminCatalog, getCatalog, updateCatalog } from "../controllers/catalogController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();
router.get("/", getCatalog);
router.get("/admin", requireAdmin, getAdminCatalog);
router.patch("/", requireAdmin, updateCatalog);
export default router;
