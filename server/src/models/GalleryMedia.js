import mongoose from "mongoose";

const galleryMediaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  src: { type: String, required: true },
  type: { type: String, enum: ["image"], default: "image" },
  published: { type: Boolean, default: true },
}, { timestamps: true });

export const GalleryMedia = mongoose.model("GalleryMedia", galleryMediaSchema);
