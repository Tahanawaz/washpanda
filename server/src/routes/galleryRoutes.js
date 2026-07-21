import { Router } from "express";
import { createGalleryMedia, deleteGalleryMedia, getAdminGallery, getGallery, updateGalleryMedia } from "../controllers/galleryController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();
router.get("/", getGallery);
router.get("/admin", requireAdmin, getAdminGallery);
router.post("/", requireAdmin, createGalleryMedia);
router.route("/:id").patch(requireAdmin, updateGalleryMedia).delete(requireAdmin, deleteGalleryMedia);
export default router;
