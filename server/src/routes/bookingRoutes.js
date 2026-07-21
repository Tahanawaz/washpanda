import { Router } from "express";
import { createBooking, deleteBooking, getAvailability, getBooking, getBookings, getWeeklyAvailability, markBookingNotificationSeen, updateBooking } from "../controllers/bookingController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createRateLimit } from "../middleware/rateLimit.js";

const router = Router();
const bookingLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 8, message: "Too many booking requests. Please wait a few minutes and try again." });
router.route("/").get(requireAdmin, getBookings).post(bookingLimit, createBooking);
router.get("/availability/week", getWeeklyAvailability);
router.get("/availability", getAvailability);
router.patch("/:orderNumber/notification-seen", requireAdmin, markBookingNotificationSeen);
router.route("/:orderNumber").get(requireAdmin, getBooking).patch(requireAdmin, updateBooking).delete(requireAdmin, deleteBooking);
export default router;
