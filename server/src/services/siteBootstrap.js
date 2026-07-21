import { Catalog } from "../models/Catalog.js";
import { GalleryMedia } from "../models/GalleryMedia.js";
import { SiteSettings } from "../models/SiteSettings.js";

const vehicles = [
  { name: "Hatchback", image: "/Hatchback.png", surcharge: 0 },
  { name: "Sedan", image: "/Sedan.png", surcharge: 150 },
  { name: "Crossover", image: "/Crossover.png", surcharge: 300 },
  { name: "SUV", image: "/SUV.png", surcharge: 450 },
  { name: "Minivan", image: "/Minivan.png", surcharge: 600 },
];

const packages = [
  { name: "Basic Wash", price: 999, features: ["Exterior detailed wash", "Interior vacuum", "Tire and rim cleaning", "Dashboard wipe"] },
  { name: "Premium Wash", price: 1499, featured: true, features: ["Exterior detailed wash", "Deep interior cleaning", "Tire shine", "Premium body wax", "Window polishing"] },
  { name: "Ultimate Shine", price: 2199, features: ["Complete detailing", "Interior shampoo", "Premium wax and polish", "Engine bay degreasing", "Leather conditioning", "Air freshener treatment"] },
];

const addons = [
  { name: "Tire Dressing", price: 500 },
  { name: "Sealer Hand Wax", price: 650 },
  { name: "Windows In & Out", price: 400 },
  { name: "Engine Cleaning", price: 800 },
  { name: "Interior Fragrance", price: 250 },
];

const timeSlots = [
  { label: "Morning", time: "9am to 12pm", capacity: 4 },
  { label: "Noon", time: "12pm to 3pm", capacity: 4 },
  { label: "Evening", time: "3pm to 6pm", capacity: 4 },
  { label: "Night", time: "6pm to 9pm", capacity: 4 },
];

const paymentMethods = [
  { id: "cash", label: "Cash on service", enabled: true, instructions: "Pay after your wash is completed." },
  { id: "jazzcash", label: "JazzCash", enabled: false, instructions: "Transfer the amount and enter your transaction reference." },
  { id: "easypaisa", label: "Easypaisa", enabled: false, instructions: "Transfer the amount and enter your transaction reference." },
  { id: "bank", label: "Bank transfer", enabled: false, instructions: "Use the configured bank details and enter your transaction reference." },
  { id: "card", label: "Card / secure payment link", enabled: false, instructions: "Continue through the secure payment link after booking." },
];

export async function ensureSiteData() {
  await Catalog.findOneAndUpdate(
    { accountKey: "primary" },
    { $setOnInsert: { vehicles, packages, addons, timeSlots } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const settings = await SiteSettings.findOneAndUpdate(
    { accountKey: "primary" },
    { $setOnInsert: { paymentMethods } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  let settingsChanged = false;
  for (const method of settings.paymentMethods) {
    if (method.id !== "cash" && method.enabled && !method.accountNumber && !method.paymentUrl) {
      method.enabled = false;
      settingsChanged = true;
    }
  }
  if (settingsChanged) await settings.save();
  if (await GalleryMedia.countDocuments() === 0) {
    await GalleryMedia.insertMany(Array.from({ length: 6 }, (_, index) => ({
      title: `Car Wash ${index + 1}`,
      src: `/G${index + 1}.png`,
    })));
  }
}
