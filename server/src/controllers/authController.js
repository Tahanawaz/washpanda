import { Admin } from "../models/Admin.js";
import { checkPasswordResetCode, sendPasswordResetCode } from "../services/twilioVerify.js";
import { createToken, hashPassword, hashToken, verifyPassword } from "../utils/password.js";
import { clearAdminSessionCookie, setAdminSessionCookie } from "../utils/sessionCookie.js";

function publicAdmin(admin) {
  return {
    id: admin._id,
    name: admin.name,
    role: admin.role,
    email: admin.email,
    phone: admin.phone,
    bio: admin.bio,
    avatar: admin.avatar,
  };
}

function requireStrongPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    const error = new Error("Password must contain at least 8 characters");
    error.status = 400;
    throw error;
  }
}

export async function getSetupStatus(_request, response, next) {
  try {
    response.json({ success: true, setupRequired: !(await Admin.exists({ accountKey: "primary" })) });
  } catch (error) {
    next(error);
  }
}

export async function setupAdmin(request, response, next) {
  try {
    if (await Admin.exists({ accountKey: "primary" })) {
      return response.status(409).json({ success: false, message: "Admin account is already configured. Please sign in." });
    }
    requireStrongPassword(request.body.password);
    const phone = String(request.body.phone || "").trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      return response.status(400).json({ success: false, message: "Phone number must use international format, for example +923001234567" });
    }

    const token = createToken();
    const admin = await Admin.create({
      accountKey: "primary",
      name: request.body.name,
      role: "Administrator",
      email: String(request.body.email || "").trim().toLowerCase(),
      phone,
      passwordHash: await hashPassword(request.body.password),
      sessionTokenHash: hashToken(token),
      sessionExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });
    setAdminSessionCookie(response, token, false);
    response.status(201).json({ success: true, data: publicAdmin(admin) });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ success: false, message: "Admin setup has already been completed" });
    }
    next(error);
  }
}

export async function login(request, response, next) {
  try {
    const email = String(request.body.email || "").trim().toLowerCase();
    const admin = await Admin.findOne({ email }).select("+passwordHash");
    if (!admin || !(await verifyPassword(request.body.password, admin.passwordHash))) {
      return response.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken();
    admin.sessionTokenHash = hashToken(token);
    const remember = Boolean(request.body.remember);
    admin.sessionExpiresAt = new Date(Date.now() + (remember ? 7 * 24 : 12) * 60 * 60 * 1000);
    await admin.save();
    setAdminSessionCookie(response, token, remember);
    response.json({ success: true, data: publicAdmin(admin) });
  } catch (error) {
    next(error);
  }
}

export async function logout(request, response, next) {
  try {
    await Admin.updateOne({ _id: request.admin._id }, { $set: { sessionTokenHash: "" }, $unset: { sessionExpiresAt: 1 } });
    clearAdminSessionCookie(response);
    response.json({ success: true, message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
}

export function getProfile(request, response) {
  response.json({ success: true, data: publicAdmin(request.admin) });
}

export async function updateProfile(request, response, next) {
  try {
    const allowed = ["name", "role", "email", "phone", "bio", "avatar"];
    if (request.body.phone !== undefined) {
      request.body.phone = String(request.body.phone).trim();
      if (!/^\+[1-9]\d{7,14}$/.test(request.body.phone)) {
        return response.status(400).json({ success: false, message: "Phone number must use international format, for example +923001234567" });
      }
    }
    for (const key of allowed) {
      if (request.body[key] !== undefined) request.admin[key] = request.body[key];
    }
    await request.admin.save();
    response.json({ success: true, message: "Admin information updated", data: publicAdmin(request.admin) });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(request, response, next) {
  try {
    requireStrongPassword(request.body.newPassword);
    const admin = await Admin.findById(request.admin._id).select("+passwordHash");
    if (!(await verifyPassword(request.body.currentPassword, admin.passwordHash))) {
      return response.status(400).json({ success: false, message: "Current password is incorrect" });
    }
    admin.passwordHash = await hashPassword(request.body.newPassword);
    await admin.save();
    response.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(request, response, next) {
  try {
    const phone = String(request.body.phone || "").trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      return response.status(400).json({ success: false, message: "Enter the registered phone number in international format, for example +923001234567" });
    }
    const admin = await Admin.findOne({ phone });
    if (!admin) return response.status(404).json({ success: false, message: "This phone number is not linked to the admin account" });
    await sendPasswordResetCode(phone);
    response.json({ success: true, message: "Verification code sent by SMS" });
  } catch (error) {
    next(error);
  }
}

export async function verifyResetCode(request, response, next) {
  try {
    const phone = String(request.body.phone || "").trim();
    const admin = await Admin.findOne({ phone });
    if (!admin) return response.status(400).json({ success: false, message: "Invalid verification request" });
    const verification = await checkPasswordResetCode(phone, String(request.body.code || "").trim());
    if (verification.status !== "approved") {
      return response.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }
    const resetToken = createToken();
    admin.resetTokenHash = hashToken(resetToken);
    admin.resetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();
    response.json({ success: true, resetToken });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(request, response, next) {
  try {
    requireStrongPassword(request.body.newPassword);
    const admin = await Admin.findOne({
      phone: String(request.body.phone || "").trim(),
      resetTokenHash: hashToken(request.body.resetToken || ""),
      resetExpiresAt: { $gt: new Date() },
    }).select("+passwordHash +resetTokenHash +resetExpiresAt +sessionTokenHash +sessionExpiresAt");
    if (!admin) return response.status(400).json({ success: false, message: "Reset session is invalid or expired" });

    admin.passwordHash = await hashPassword(request.body.newPassword);
    admin.resetTokenHash = "";
    admin.resetExpiresAt = undefined;
    admin.sessionTokenHash = "";
    admin.sessionExpiresAt = undefined;
    await admin.save();
    response.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
}
