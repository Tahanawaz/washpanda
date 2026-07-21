import { env } from "../config/env.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function securityHeaders(_request, response, next) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Cross-Origin-Resource-Policy", "same-site");
  if (env.isProduction) response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
}

export function requireTrustedOrigin(request, response, next) {
  if (!unsafeMethods.has(request.method)) return next();
  const origin = request.get("origin");
  if (!origin || env.clientUrls.includes(origin)) return next();
  return response.status(403).json({ success: false, message: "Request origin is not allowed" });
}
