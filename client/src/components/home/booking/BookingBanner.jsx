export default function BookingBanner() {
  return (
    <section
      className="relative -mt-10 min-h-[120px] w-full overflow-hidden sm:min-h-[100px]"
      style={{
        backgroundImage: "url('/booking-banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top ",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[120px] flex-col items-center justify-center gap-4 px-5 py-5 text-center sm:min-h-[100px] sm:flex-row sm:justify-between sm:px-10 sm:text-left">
        {/* Left */}
        <h2 className="text-xl font-bold uppercase tracking-wide text-white sm:text-2xl lg:text-3xl">
          EASY ONLINE CAR WASH BOOKING SYSTEM
        </h2>

        {/* Right Button */}
        <a href="/booking" className="rounded-md bg-white px-8 py-3 font-semibold text-[#4A9EFF] transition-all duration-300 hover:scale-105 hover:bg-[#4A9EFF] hover:text-white">
          Book Now
        </a>
      </div>
    </section>
  );
}
