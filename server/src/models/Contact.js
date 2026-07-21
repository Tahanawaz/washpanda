import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, required: true, trim: true, maxlength: 24 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  status: { type: String, enum: ["New", "Read", "Replied"], default: "New" },
  notificationSeen: { type: Boolean, default: false },
}, { timestamps: true });

export const Contact = mongoose.model("Contact", contactSchema);
