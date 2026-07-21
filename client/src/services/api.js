const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function adminApiRequest(path, options = {}) {
  try {
    return await apiRequest(path, options);
  } catch (error) {
    if (error.status === 401) {
      if (window.location.pathname.startsWith("/dashboard")) window.location.assign("/login");
    }
    throw error;
  }
}

export const createBooking = (booking) => apiRequest("/bookings", { method: "POST", body: JSON.stringify(booking) });
export const getBookingAvailability = (date) => apiRequest(`/bookings/availability?date=${encodeURIComponent(date)}`);
export const getBookingAvailabilityWeek = (start, days = 7) => apiRequest(`/bookings/availability/week?start=${encodeURIComponent(start)}&days=${days}`);
export const getBookings = (query = "") => adminApiRequest(`/bookings${query ? `?${query}` : ""}`);
export const getBooking = (orderNumber) => adminApiRequest(`/bookings/${orderNumber}`);
export const updateBooking = (orderNumber, changes) => adminApiRequest(`/bookings/${orderNumber}`, {
  method: "PATCH",
  body: JSON.stringify(changes),
});
export const deleteBooking = (orderNumber) => adminApiRequest(`/bookings/${orderNumber}`, { method: "DELETE" });
export const createContact = (contact) => apiRequest("/contacts", { method: "POST", body: JSON.stringify(contact) });
export const getContacts = () => adminApiRequest("/contacts");
export const updateContact = (id, status) => adminApiRequest(`/contacts/${id}`, {
  method: "PATCH",
  body: JSON.stringify({ status }),
});
export const markBookingNotificationSeen = (orderNumber) => adminApiRequest(`/bookings/${orderNumber}/notification-seen`, { method: "PATCH" });
export const markContactNotificationSeen = (id) => adminApiRequest(`/contacts/${id}/notification-seen`, { method: "PATCH" });

export const getReviews = () => apiRequest("/reviews");
export const getAdminReviews = () => adminApiRequest("/reviews/admin");
export const createReview = (review) => adminApiRequest("/reviews", { method: "POST", body: JSON.stringify(review) });
export const updateReview = (id, review) => adminApiRequest(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(review) });
export const deleteReview = (id) => adminApiRequest(`/reviews/${id}`, { method: "DELETE" });

export const getCatalog = () => apiRequest("/catalog");
export const getAdminCatalog = () => adminApiRequest("/catalog/admin");
export const updateCatalog = (catalog) => adminApiRequest("/catalog", { method: "PATCH", body: JSON.stringify(catalog) });

export const getGallery = () => apiRequest("/gallery");
export const getAdminGallery = () => adminApiRequest("/gallery/admin");
export const createGalleryMedia = (media) => adminApiRequest("/gallery", { method: "POST", body: JSON.stringify(media) });
export const updateGalleryMedia = (id, changes) => adminApiRequest(`/gallery/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
export const deleteGalleryMedia = (id) => adminApiRequest(`/gallery/${id}`, { method: "DELETE" });

export const getSiteSettings = () => apiRequest("/settings");
export const getAdminSiteSettings = () => adminApiRequest("/settings/admin");
export const updateSiteSettings = (settings) => adminApiRequest("/settings", { method: "PATCH", body: JSON.stringify(settings) });
export const getAnalytics = () => adminApiRequest("/analytics");

export const loginAdmin = (credentials) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const getAdminSetupStatus = () => apiRequest("/auth/setup-status");
export const setupAdmin = (details) => apiRequest("/auth/setup", { method: "POST", body: JSON.stringify(details) });
export const logoutAdmin = () => adminApiRequest("/auth/logout", { method: "POST" });
export const getAdminProfile = () => adminApiRequest("/auth/profile");
export const updateAdminProfile = (profile) => adminApiRequest("/auth/profile", { method: "PATCH", body: JSON.stringify(profile) });
export const changeAdminPassword = (passwords) => adminApiRequest("/auth/password", { method: "PATCH", body: JSON.stringify(passwords) });
export const requestPasswordCode = (phone) => apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ phone }) });
export const verifyPasswordCode = (phone, code) => apiRequest("/auth/verify-reset-code", { method: "POST", body: JSON.stringify({ phone, code }) });
export const resetAdminPassword = (phone, resetToken, newPassword) => apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify({ phone, resetToken, newPassword }) });
