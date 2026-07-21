import { pricing } from "./packagesData";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  return (
    <div className="mt-16 flex flex-wrap justify-center gap-8">
        {pricing.map((item) => (
          <PricingCard key={item.id} item={item} />
        ))}
    </div>
  );
}
