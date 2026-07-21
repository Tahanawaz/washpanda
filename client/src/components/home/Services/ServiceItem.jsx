export default function ServiceItem({ service }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white shadow">
        <img
          src={service.image}
          alt=""
          aria-hidden="true"
          className="h-8 w-8 object-contain"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">
          {service.title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-blue-100">
          {service.description}
        </p>
      </div>
    </div>
  );
}
