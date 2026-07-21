import { FaSearchPlus } from "react-icons/fa";

export default function GalleryCard({ item }) {
  return (
    <div className="group relative h-[480px] overflow-hidden rounded-2xl">

      <img
  src={item.image}
  alt={item.title}
  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[0.98]"
/>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2E89FF]/70 opacity-0 transition duration-500 group-hover:opacity-100">

        <FaSearchPlus className="text-4xl text-white" />

        <h3 className="mt-4 text-xl font-bold text-white">
          {item.title}
        </h3>

      </div>
    </div>
  );
}