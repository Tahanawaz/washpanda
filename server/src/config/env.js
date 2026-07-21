import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((value) => value.trim()).filter(Boolean),
  isProduction: process.env.NODE_ENV === "production",
  // MONGO_URI is retained as a fallback for existing local environments.
  mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  mongodbDbName: process.env.MONGODB_DB_NAME || "washpanda",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  adminPhone: process.env.ADMIN_PHONE || "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID || "",
};
