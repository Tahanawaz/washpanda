import { Router } from "express";
import { createReview, deleteReview, getAdminReviews, getReviews, updateReview } from "../controllers/reviewController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.route("/").get(getReviews).post(requireAdmin, createReview);
router.get("/admin", requireAdmin, getAdminReviews);
router.route("/:id").patch(requireAdmin, updateReview).delete(requireAdmin, deleteReview);

export default router;
