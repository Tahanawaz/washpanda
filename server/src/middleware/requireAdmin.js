import { Admin } from "../models/Admin.js";
import { hashToken } from "../utils/password.js";
import { ADMIN_SESSION_COOKIE, readCookie } from "../utils/sessionCookie.js";

export async function requireAdmin(request, response, next) {
  try {
    const authorization = request.get("authorization") || "";
    const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const token = readCookie(request, ADMIN_SESSION_COOKIE) || bearerToken;
    if (!token) return response.status(401).json({ success: false, message: "Admin login required" });

    const admin = await Admin.findOne({
      sessionTokenHash: hashToken(token),
      sessionExpiresAt: { $gt: new Date() },
    });
    if (!admin) return response.status(401).json({ success: false, message: "Session expired. Please sign in again." });

    request.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}
