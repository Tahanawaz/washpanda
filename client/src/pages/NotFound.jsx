import { Link } from "react-router-dom";
import { LuArrowLeft, LuHouse } from "react-icons/lu";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef6fb] px-5 py-12 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(75,149,209,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(20,61,92,0.14),transparent_34%)]" />
      <section className="relative w-full max-w-xl rounded-[32px] border border-white bg-white/90 px-6 py-12 shadow-[0_30px_90px_rgba(31,87,130,0.16)] backdrop-blur sm:px-10">
        <img src="/logo.png" alt="Wash Panda" className="mx-auto h-24 w-28 object-contain" />
        <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.28em] text-[#4B95D1]">Error 404</p>
        <h1 className="mt-3 text-4xl font-extrabold text-[#172b3b] sm:text-5xl">This page drove away</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-gray-500">The page you requested does not exist or its address has changed.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4B95D1] px-6 py-3 font-bold text-white shadow-lg shadow-blue-100"><LuHouse /> Go home</Link><button type="button" onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-600"><LuArrowLeft /> Go back</button></div>
      </section>
    </main>
  );
}
