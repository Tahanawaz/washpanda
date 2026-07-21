import { Router } from "express";
import { changePassword, forgotPassword, getProfile, getSetupStatus, login, logout, resetPassword, setupAdmin, updateProfile, verifyResetCode } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createRateLimit } from "../middleware/rateLimit.js";

const router = Router();
const loginLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: "Too many login attempts. Please try again later." });
const resetLimit = createRateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: "Too many verification attempts. Please wait before trying again." });

router.get("/setup-status", getSetupStatus);
router.post("/setup", loginLimit, setupAdmin);
router.post("/login", loginLimit, login);
router.post("/forgot-password", resetLimit, forgotPassword);
router.post("/verify-reset-code", resetLimit, verifyResetCode);
router.post("/reset-password", resetLimit, resetPassword);
router.post("/logout", requireAdmin, logout);
router.route("/profile").get(requireAdmin, getProfile).patch(requireAdmin, updateProfile);
router.patch("/password", requireAdmin, changePassword);

export default router;
