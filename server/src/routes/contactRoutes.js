import { Router } from "express";
import { createContact, getContacts, markContactNotificationSeen, updateContact } from "../controllers/contactController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createRateLimit } from "../middleware/rateLimit.js";

const router = Router();
const contactLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: "Too many messages sent. Please wait a few minutes and try again." });
router.route("/").get(requireAdmin, getContacts).post(contactLimit, createContact);
router.patch("/:id/notification-seen", requireAdmin, markContactNotificationSeen);
router.patch("/:id", requireAdmin, updateContact);
export default router;
