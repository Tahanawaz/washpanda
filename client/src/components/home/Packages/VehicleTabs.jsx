import { vehicles } from "./packagesData";
import VehicleCard from "./VehicleCard";

export default function VehicleTabs() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">

      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
        />
      ))}

    </div>
  );
}
