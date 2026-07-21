import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  accountKey: { type: String, unique: true, default: "primary", immutable: true },
  name: { type: String, required: true, trim: true, default: "WashPanda Admin" },
  role: { type: String, required: true, trim: true, default: "Administrator" },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  bio: { type: String, trim: true, maxlength: 220, default: "Managing WashPanda operations." },
  avatar: { type: String, default: "/man1.png" },
  passwordHash: { type: String, required: true, select: false },
  sessionTokenHash: { type: String, select: false, default: "" },
  sessionExpiresAt: { type: Date, select: false },
  resetTokenHash: { type: String, select: false, default: "" },
  resetExpiresAt: { type: Date, select: false },
}, { timestamps: true });

export const Admin = mongoose.model("Admin", adminSchema);
