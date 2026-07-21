import { FaCheckCircle } from "react-icons/fa";

const items = [
  "Professional Staff",
  "Eco Friendly Products",
  "Premium Service",
  "Affordable Prices",
];

export default function FeatureList() {
  return (
    <ul className="space-y-4">

      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-3 text-gray-700"
        >
          <FaCheckCircle className="text-blue-500" />
          {item}
        </li>
      ))}

    </ul>
  );
}