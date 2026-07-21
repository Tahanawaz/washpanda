import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { getCatalog } from "../../../services/api";

export default function Packages() {
  const [catalog, setCatalog] = useState({ vehicles: [], packages: [] });

  useEffect(() => {
    getCatalog().then((payload) => setCatalog(payload.data)).catch(() => undefined);
  }, []);

  if (catalog.packages.length === 0) return null;

  return (
    <section id="packages" className="bg-white px-4 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#4B95D1]">Simple pricing</p><h2 className="mt-3 text-3xl font-extrabold uppercase text-gray-900 sm:text-4xl">Wash Packages</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500">Choose a package, then select your vehicle and available time during booking.</p></div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {catalog.vehicles.map((vehicle) => <article key={vehicle._id} className="rounded-2xl border border-gray-100 bg-[#fbfdff] p-4 text-center shadow-sm"><img src={vehicle.image} alt={vehicle.name} className="mx-auto h-14 w-full object-contain" /><h3 className="mt-3 font-bold text-gray-800">{vehicle.name}</h3>{vehicle.surcharge > 0 && <p className="mt-1 text-xs text-gray-400">+{vehicle.surcharge.toLocaleString("en-PK")} PKR</p>}</article>)}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {catalog.packages.map((item) => <article key={item._id} className={`relative flex min-h-[500px] flex-col rounded-3xl border bg-white p-6 shadow-[0_18px_50px_rgba(32,103,155,0.08)] transition hover:-translate-y-1 hover:shadow-xl ${item.featured ? "border-[#4B95D1] ring-4 ring-blue-50" : "border-gray-100"}`}>{item.featured && <span className="absolute right-5 top-5 rounded-full bg-[#4B95D1] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Most popular</span>}<p className="text-sm font-bold uppercase tracking-wide text-[#4B95D1]">{item.name}</p><p className="mt-5 text-sm text-gray-400">Starting from</p><p className="mt-1 text-5xl font-extrabold text-gray-900">{item.price.toLocaleString("en-PK")}<span className="ml-1 text-lg font-semibold text-gray-400">PKR</span></p><div className="my-6 h-px bg-gray-100" /><ul className="flex-1 space-y-4">{item.features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-5 text-gray-600"><FaCheckCircle className="mt-0.5 shrink-0 text-[#78b8e9]" />{feature}</li>)}</ul><Link to="/booking" className={`mt-8 rounded-xl border px-5 py-3 text-center font-bold transition ${item.featured ? "border-[#4B95D1] bg-[#4B95D1] text-white hover:bg-blue-600" : "border-[#4B95D1] text-[#4B95D1] hover:bg-blue-50"}`}>Book this package</Link></article>)}
        </div>
      </div>
    </section>
  );
}
