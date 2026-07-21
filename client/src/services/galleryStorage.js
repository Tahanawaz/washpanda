export const GALLERY_STORAGE_KEY = "washpanda-gallery-media";
export const GALLERY_UPDATED_EVENT = "washpanda-gallery-updated";

export function getSavedGalleryMedia() {
  try {
    return JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveGalleryMedia(media) {
  localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(media));
  window.dispatchEvent(new CustomEvent(GALLERY_UPDATED_EVENT));
}
