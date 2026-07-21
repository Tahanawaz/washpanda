import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  car: { type: String, required: true, trim: true, maxlength: 120 },
  review: { type: String, required: true, trim: true, maxlength: 2000 },
  image: { type: String, trim: true, default: "/man1.png" },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);
