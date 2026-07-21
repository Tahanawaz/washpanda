import { env } from "../config/env.js";

export const ADMIN_SESSION_COOKIE = "washpanda_admin_session";

export function readCookie(request, name) {
  const cookieHeader = request.get("cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }
  return "";
}

export function setAdminSessionCookie(response, token, remember = false) {
  const maxAgeSeconds = (remember ? 7 * 24 : 12) * 60 * 60;
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/api",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (env.isProduction) attributes.push("Secure");
  response.setHeader("Set-Cookie", attributes.join("; "));
}

export function clearAdminSessionCookie(response) {
  const attributes = [
    `${ADMIN_SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/api",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (env.isProduction) attributes.push("Secure");
  response.setHeader("Set-Cookie", attributes.join("; "));
}
