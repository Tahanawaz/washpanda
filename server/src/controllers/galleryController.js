import { GalleryMedia } from "../models/GalleryMedia.js";

export async function getGallery(_request, response, next) {
  try {
    const media = await GalleryMedia.find({ published: true }).sort({ createdAt: -1 }).limit(24).lean();
    response.json({ success: true, count: media.length, data: media });
  } catch (error) {
    next(error);
  }
}

export async function getAdminGallery(_request, response, next) {
  try {
    const media = await GalleryMedia.find().sort({ createdAt: -1 }).limit(100).lean();
    response.json({ success: true, count: media.length, data: media });
  } catch (error) {
    next(error);
  }
}

export async function createGalleryMedia(request, response, next) {
  try {
    const src = String(request.body.src || "");
    const dataUrlMatch = src.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    const isLocalAsset = /^\/[A-Za-z0-9._/-]+$/.test(src);
    const size = dataUrlMatch ? Math.ceil(dataUrlMatch[2].length * 0.75) : 0;
    if ((!dataUrlMatch && !isLocalAsset) || size > 5 * 1024 * 1024) {
      return response.status(400).json({ success: false, message: "Upload a valid JPG, PNG or WebP image up to 5 MB" });
    }
    const media = await GalleryMedia.create({
      title: String(request.body.title || "").trim(),
      src,
      type: "image",
      published: request.body.published !== false,
    });
    response.status(201).json({ success: true, message: "Gallery image published", data: media });
  } catch (error) {
    next(error);
  }
}

export async function updateGalleryMedia(request, response, next) {
  try {
    const allowed = ["title", "published"];
    const changes = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)));
    const media = await GalleryMedia.findByIdAndUpdate(request.params.id, changes, { new: true, runValidators: true });
    if (!media) return response.status(404).json({ success: false, message: "Gallery image not found" });
    response.json({ success: true, message: "Gallery image updated", data: media });
  } catch (error) {
    next(error);
  }
}

export async function deleteGalleryMedia(request, response, next) {
  try {
    const media = await GalleryMedia.findByIdAndDelete(request.params.id);
    if (!media) return response.status(404).json({ success: false, message: "Gallery image not found" });
    response.json({ success: true, message: "Gallery image deleted" });
  } catch (error) {
    next(error);
  }
}
