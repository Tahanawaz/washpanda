import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { hashPassword } from "../utils/password.js";

export async function ensureAdminAccount() {
  if (await Admin.exists({})) return;

  if (!env.adminEmail || !env.adminPassword || !env.adminPhone) {
    console.warn("Admin account not created from .env. Complete first-time setup at /setup-admin");
    return;
  }

  if (env.adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters");
  }

  await Admin.create({
    email: env.adminEmail,
    phone: env.adminPhone,
    passwordHash: await hashPassword(env.adminPassword),
  });
  console.log("Initial WashPanda admin account created");
}
