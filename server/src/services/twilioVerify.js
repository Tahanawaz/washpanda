import { env } from "../config/env.js";

function assertConfigured() {
  const accountSidValid = /^AC[0-9a-fA-F]{32}$/.test(env.twilioAccountSid);
  const verifyServiceSidValid = /^VA[0-9a-fA-F]{32}$/.test(env.twilioVerifyServiceSid);
  const authTokenValid = env.twilioAuthToken.length >= 20
    && !/(placeholder|your_|replace|real_)/i.test(env.twilioAuthToken);

  if (!accountSidValid || !verifyServiceSidValid || !authTokenValid) {
    const error = new Error("Twilio SMS credentials are invalid. Add the live Account SID, Auth Token and Verify Service SID in server/.env, then restart the backend.");
    error.status = 503;
    throw error;
  }
}

async function twilioRequest(path, values) {
  assertConfigured();
  const authorization = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString("base64");
  const response = await fetch(`https://verify.twilio.com/v2/Services/${env.twilioVerifyServiceSid}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(values),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Unable to send or verify the SMS code");
    error.status = response.status >= 500 ? 502 : 400;
    throw error;
  }
  return payload;
}

export function sendPasswordResetCode(phone) {
  return twilioRequest("Verifications", { To: phone, Channel: "sms" });
}

export function checkPasswordResetCode(phone, code) {
  return twilioRequest("VerificationCheck", { To: phone, Code: code });
}
