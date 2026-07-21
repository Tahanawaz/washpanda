import { FaQuoteLeft } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

export default function ReviewCard({ review, active }) {
  return (
    <div className={`mx-auto w-full max-w-[330px] transition-all duration-500 ${active ? "relative z-30 lg:-translate-y-[23px] lg:scale-x-[1.08] lg:scale-y-105" : "relative z-10"}`}>
      <div
        className={`flex h-[160px] flex-col items-center justify-center rounded-md px-6 py-5 text-center transition-all duration-500 ${
          active
            ? "relative z-20 bg-[#4B95D1] text-white shadow-xl"
            : "bg-white text-gray-600 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        }`}
      >
        <FaQuoteLeft className={`text-[42px] ${active ? "text-[#75B2E3]" : "text-gray-200"}`} />
        <p className="mt-3 line-clamp-4 text-[12px] leading-[18px]" title={review.review}>{review.review}</p>
      </div>

      <div className="relative z-30 -mt-4 text-center">
        <img
          src={review.image}
          alt={review.name}
          loading="lazy"
          decoding="async"
          className="mx-auto h-9 w-9 rounded-full border-2 border-white object-cover shadow"
        />
        <h3 className="mt-1.5 text-base font-bold text-gray-900">{review.name}</h3>
        <p className="mt-0.5 text-[10px] text-gray-500">{review.car}</p>
        <div className="mt-1 flex justify-center gap-0.5 text-[10px] text-amber-400" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, index) => <FaStar key={index} className={index < review.rating ? "fill-current" : "text-gray-200"} />)}
        </div>
      </div>
    </div>
  );
}
