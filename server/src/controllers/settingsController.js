import { SiteSettings } from "../models/SiteSettings.js";

export async function getSettings(_request, response, next) {
  try {
    const settings = await SiteSettings.findOne({ accountKey: "primary" });
    if (!settings) return response.status(404).json({ success: false, message: "Website settings are not configured" });
    const data = settings.toObject();
    data.paymentMethods = data.paymentMethods.filter((method) => method.enabled).map((method) => ({
      id: method.id,
      label: method.label,
      enabled: true,
      instructions: method.instructions,
      accountTitle: method.accountTitle,
      accountNumber: method.accountNumber,
      paymentUrl: method.paymentUrl,
    }));
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSettings(_request, response, next) {
  try {
    const settings = await SiteSettings.findOne({ accountKey: "primary" });
    if (!settings) return response.status(404).json({ success: false, message: "Website settings are not configured" });
    return response.json({ success: true, data: settings });
  } catch (error) {
    return next(error);
  }
}

export async function updateSettings(request, response, next) {
  try {
    const allowed = ["businessName", "phone", "email", "address", "businessHours", "currency", "facebook", "instagram", "twitter", "paymentMethods"];
    const changes = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)));
    const invalidPayment = changes.paymentMethods?.find((method) => method.id !== "cash" && method.enabled && !String(method.accountNumber || "").trim() && !String(method.paymentUrl || "").trim());
    if (invalidPayment) {
      return response.status(400).json({ success: false, message: `${invalidPayment.label} needs an account number or secure payment URL before it can be enabled` });
    }
    const settings = await SiteSettings.findOneAndUpdate(
      { accountKey: "primary" },
      changes,
      { new: true, runValidators: true },
    );
    if (!settings) return response.status(404).json({ success: false, message: "Website settings are not configured" });
    response.json({ success: true, message: "Website settings updated", data: settings });
  } catch (error) {
    next(error);
  }
}
