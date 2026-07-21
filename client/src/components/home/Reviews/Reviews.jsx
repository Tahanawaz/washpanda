import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "./Reviews.css";

import { getReviews } from "../../../services/api";
import ReviewCard from "./ReviewCard";

export default function Reviews() {
  const [reviewItems, setReviewItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getReviews()
      .then((payload) => { if (active) setReviewItems(payload.data.map(normalizeReview)); })
      .catch(() => { if (active) setReviewItems([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-1 bg-white px-4 pb-8 sm:px-6">
      <div className="text-center">
        <p className="text-2xl font-extrabold uppercase tracking-[4px] text-[#222] sm:text-3xl sm:tracking-[6px]">
          CLIENT REVIEWS
        </p>
      </div>

      <div className="mx-auto mt-10 w-full max-w-[980px] overflow-hidden pb-1 pt-7 lg:mt-14">
        {loading && <p className="pb-10 text-center text-sm text-gray-500">Loading customer reviews...</p>}

        {!loading && reviewItems.length === 0 && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl bg-blue-50 px-6 py-8 text-center">
            <p className="font-semibold text-gray-700">Customer reviews will appear here soon.</p>
          </div>
        )}

        {!loading && reviewItems.length > 0 && (
          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            centeredSlides
            loop={reviewItems.length > 3}
            speed={700}
            spaceBetween={0}
            autoplay={reviewItems.length > 1 ? { delay: 3000, disableOnInteraction: false } : false}
            pagination={{ clickable: true }}
            className="reviewSwiper pb-12"
          >
            {reviewItems.map((review) => (
              <SwiperSlide key={review.id} className="flex justify-center">
                {({ isActive }) => <ReviewCard review={review} active={isActive} />}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}

function normalizeReview(review) {
  return {
    id: review._id,
    name: review.name,
    car: review.car,
    review: review.review,
    image: review.image || "/man1.png",
    rating: review.rating || 5,
  };
}
