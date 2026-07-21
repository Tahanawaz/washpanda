import { Review } from "../models/Review.js";

export async function getReviews(_request, response, next) {
  try {
    const reviews = await Review.find({ published: true }).sort({ featured: -1, createdAt: -1 });
    response.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function getAdminReviews(_request, response, next) {
  try {
    const reviews = await Review.find().sort({ featured: -1, createdAt: -1 });
    response.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function createReview(request, response, next) {
  try {
    const review = await Review.create(request.body);
    response.status(201).json({ success: true, message: "Review added successfully", data: review });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(request, response, next) {
  try {
    const allowed = ["name", "car", "review", "image", "rating", "featured", "published"];
    const changes = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)));
    const review = await Review.findByIdAndUpdate(request.params.id, changes, { new: true, runValidators: true });
    if (!review) return response.status(404).json({ success: false, message: "Review not found" });
    response.json({ success: true, message: "Review updated successfully", data: review });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(request, response, next) {
  try {
    const review = await Review.findByIdAndDelete(request.params.id);
    if (!review) return response.status(404).json({ success: false, message: "Review not found" });
    response.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
}
