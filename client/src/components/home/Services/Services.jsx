import ServiceItem from "./ServiceItem";
import { services } from "./servicesData";

export default function Services() {
  return (
    <section className="mt-0">

      <div className="w-full">

        <div className="grid overflow-hidden lg:grid-cols-2">

          {/* Left Side */}

          <div
            className="flex flex-col justify-center bg-cover bg-center px-6 py-12 sm:px-10 lg:px-12 lg:py-16"
            style={{
              backgroundImage: "url('/bg-color.png')",
            }}
          >
            <p className="text-sm text-white">
              Find Who We Are
            </p>

            <h2 className="mt-3 max-w-md text-2xl font-extrabold leading-tight text-white">
              WE ONLY PROVIDE QUALITY CARE SERVICES
            </h2>

            <div className="mt-12 space-y-8">
              {services.map((service) => (
                <ServiceItem
              key={service.id}
              service={service}
                />
              ))}
            </div>
          </div>

          {/* Right Side */}

          <div>
            <img
  src="/Panda-wash.png"
  alt="Wash Panda"
  className="h-full w-full object-cover object-[80%_center]"
/>
          </div>

        </div>

      </div>

    </section>
  );
}
