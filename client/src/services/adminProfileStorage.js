export const ADMIN_PROFILE_KEY = "washpanda-admin-profile";
export const ADMIN_PROFILE_UPDATED_EVENT = "washpanda-admin-profile-updated";

export const defaultAdminProfile = {
  name: "Moshfar",
  role: "Administrator",
  email: "admin@washpanda.com",
  phone: "+92 300 0000000",
  bio: "Managing WashPanda bookings and customer operations.",
  avatar: "/man1.png",
};

export function getAdminProfile() {
  try {
    return { ...defaultAdminProfile, ...JSON.parse(localStorage.getItem(ADMIN_PROFILE_KEY) || "{}") };
  } catch {
    return defaultAdminProfile;
  }
}

export function saveAdminProfile(profile) {
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(ADMIN_PROFILE_UPDATED_EVENT));
}
