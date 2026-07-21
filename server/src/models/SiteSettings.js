import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema({
  id: { type: String, required: true, enum: ["cash", "card", "bank", "jazzcash", "easypaisa"] },
  label: { type: String, required: true, trim: true, maxlength: 60 },
  enabled: { type: Boolean, default: true },
  instructions: { type: String, trim: true, maxlength: 500, default: "" },
  accountTitle: { type: String, trim: true, maxlength: 100, default: "" },
  accountNumber: { type: String, trim: true, maxlength: 100, default: "" },
  paymentUrl: { type: String, trim: true, maxlength: 500, default: "" },
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema({
  accountKey: { type: String, unique: true, default: "primary", immutable: true },
  businessName: { type: String, required: true, trim: true, default: "WashPanda" },
  phone: { type: String, required: true, trim: true, default: "+923455675769" },
  email: { type: String, required: true, trim: true, lowercase: true, default: "info@washpanda.com" },
  address: { type: String, required: true, trim: true, default: "Johar Town, Lahore" },
  businessHours: { type: String, trim: true, default: "Monday to Sunday · 9:00 AM to 9:00 PM" },
  currency: { type: String, trim: true, default: "PKR" },
  facebook: { type: String, trim: true, default: "" },
  instagram: { type: String, trim: true, default: "" },
  twitter: { type: String, trim: true, default: "" },
  paymentMethods: { type: [paymentMethodSchema], default: [] },
}, { timestamps: true });

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
