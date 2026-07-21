import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  image: { type: String, trim: true, default: "/Sedan.png", maxlength: 3 * 1024 * 1024 },
  surcharge: { type: Number, min: 0, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: false });

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0 },
  features: [{ type: String, required: true, trim: true, maxlength: 180 }],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: false });

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: false });

const timeSlotSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 50 },
  time: { type: String, required: true, trim: true, maxlength: 50 },
  capacity: { type: Number, required: true, min: 1, max: 100, default: 4 },
  active: { type: Boolean, default: true },
}, { timestamps: false });

const catalogSchema = new mongoose.Schema({
  accountKey: { type: String, unique: true, default: "primary", immutable: true },
  vehicles: { type: [vehicleSchema], default: [] },
  packages: { type: [packageSchema], default: [] },
  addons: { type: [addonSchema], default: [] },
  timeSlots: { type: [timeSlotSchema], default: [] },
}, { timestamps: true });

export const Catalog = mongoose.model("Catalog", catalogSchema);
