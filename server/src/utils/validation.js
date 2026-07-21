const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s()-]{7,19}$/;

export function cleanText(value, { field, min = 1, max }) {
  const text = String(value || "").trim();
  if (text.length < min || (max && text.length > max)) {
    const range = max ? `${min}-${max}` : `at least ${min}`;
    const error = new Error(`${field} must contain ${range} characters`);
    error.status = 400;
    throw error;
  }
  return text;
}

export function cleanEmail(value) {
  const email = cleanText(value, { field: "Email", max: 160 }).toLowerCase();
  if (!emailPattern.test(email)) {
    const error = new Error("Please enter a valid email address");
    error.status = 400;
    throw error;
  }
  return email;
}

export function cleanPhone(value) {
  const phone = cleanText(value, { field: "Phone number", max: 24 });
  if (!phonePattern.test(phone)) {
    const error = new Error("Please enter a valid phone number");
    error.status = 400;
    throw error;
  }
  return phone;
}

export function isHoneypotFilled(body) {
  return Boolean(String(body.website || "").trim());
}
