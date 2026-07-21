import { Review } from "../models/Review.js";

const starterReviews = [
  { name: "Momin Nasir", car: "Toyota V8", review: "WashPanda provided an excellent service. The team was professional, careful, and returned my car looking completely refreshed." },
  { name: "Sara Khan", car: "Honda Civic", review: "The premium wash was worth it. The interior was spotless, the body shine looked great, and the booking process was very convenient." },
  { name: "Hamza Ali", car: "BMW X5", review: "Very friendly staff and impressive detailing work. They paid attention to the wheels, dashboard, windows, and every small corner." },
  { name: "Ayesha Noor", car: "KIA Sportage", review: "My vehicle was cleaned on time and the results were excellent. I especially liked the interior cleaning and fresh finish." },
  { name: "Bilal Raza", car: "Toyota Corolla", review: "Easy online booking, fair pricing, and reliable service. I will definitely book WashPanda again for my next complete car wash." },
];

export async function ensureStarterReviews() {
  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) await Review.insertMany(starterReviews);
}
