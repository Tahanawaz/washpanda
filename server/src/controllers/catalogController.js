import { Catalog } from "../models/Catalog.js";

function validVehicleImage(value) {
  const src = String(value || "");
  if (/^\/[A-Za-z0-9._/-]+$/.test(src)) return true;
  const match = src.match(/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  return Boolean(match) && Math.ceil(match[1].length * 0.75) <= 2 * 1024 * 1024;
}

function publicCatalog(catalog) {
  const data = catalog.toObject();
  return {
    ...data,
    vehicles: data.vehicles.filter((item) => item.active),
    packages: data.packages.filter((item) => item.active),
    addons: data.addons.filter((item) => item.active),
    timeSlots: data.timeSlots.filter((item) => item.active),
  };
}

export async function getCatalog(_request, response, next) {
  try {
    const catalog = await Catalog.findOne({ accountKey: "primary" });
    if (!catalog) return response.status(404).json({ success: false, message: "Service catalog is not configured" });
    response.json({ success: true, data: publicCatalog(catalog) });
  } catch (error) {
    next(error);
  }
}

export async function getAdminCatalog(_request, response, next) {
  try {
    const catalog = await Catalog.findOne({ accountKey: "primary" });
    if (!catalog) return response.status(404).json({ success: false, message: "Service catalog is not configured" });
    response.json({ success: true, data: catalog });
  } catch (error) {
    next(error);
  }
}

export async function updateCatalog(request, response, next) {
  try {
    const allowed = ["vehicles", "packages", "addons", "timeSlots"];
    const changes = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)));
    if (changes.vehicles?.some((vehicle) => !validVehicleImage(vehicle.image))) {
      return response.status(400).json({ success: false, message: "Each vehicle needs a valid JPG, PNG or WebP image up to 2 MB after optimization" });
    }
    const catalog = await Catalog.findOneAndUpdate(
      { accountKey: "primary" },
      changes,
      { new: true, runValidators: true },
    );
    if (!catalog) return response.status(404).json({ success: false, message: "Service catalog is not configured" });
    response.json({ success: true, message: "Packages and booking options updated", data: catalog });
  } catch (error) {
    next(error);
  }
}
