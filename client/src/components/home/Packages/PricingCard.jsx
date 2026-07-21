import { FaCheckCircle } from "react-icons/fa";

export default function PricingCard({ item }) {
  return (
    <div className="flex min-h-[560px] w-[360px] flex-col rounded-2xl border-t-[4px] border-[#3B82F6] bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">

      {/* Package Title */}

      <h3 className="text-sm font-bold uppercase text-[#3B82F6]">
        {item.title}
      </h3>

      {/* Price */}

      <div className="mt-3">

        <p className="text-sm text-gray-500">
          Starting From
        </p>

        <div className="mt-1 flex items-end">

          <span className="text-[56px] font-extrabold leading-none text-[#222]">
            {item.price}
          </span>

          <span className="mb-1 ml-1 text-3xl text-gray-600">
            PKR
          </span>

        </div>

      </div>

      <hr className="my-6 border-gray-200" />

      {/* Features */}

      <ul className="flex-1 space-y-4">

        {item.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 text-[15px] text-gray-700"
          >
            <FaCheckCircle className="text-[#8EC5FF]" />

            <span>{feature}</span>

          </li>
        ))}

      </ul>

      {/* Button */}

      <button
        className="mt-8 rounded-md border border-[#3B82F6]
        py-3 font-medium text-[#3B82F6]
        transition-all duration-300
        hover:bg-[#3B82F6]
        hover:text-white"
      >
        Select Plan
      </button>

    </div>
  );
}
