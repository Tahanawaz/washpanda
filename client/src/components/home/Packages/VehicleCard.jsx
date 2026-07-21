export default function VehicleCard({ vehicle }) {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 text-center">

      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="mx-auto h-16 object-contain"
      />

      <h3 className="mt-3 font-semibold text-gray-800">
        {vehicle.name}
      </h3>

    </div>
  );
}
