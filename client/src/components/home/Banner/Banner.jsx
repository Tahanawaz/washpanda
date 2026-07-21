export default function Banner() {
  const text =
    "EXPERIENCE TOP-QUALITY CAR CARE FOR LESS TODAY!";

  return (
    <section className="overflow-hidden py-14">

      {/* Blue Ribbon */}

      <div className="-rotate-3 overflow-hidden bg-[#4A9EFF] py-4">

        <div className="marquee">

          {[...Array(8)].map((_, index) => (
            <span
              key={index}
              className="mx-8 whitespace-nowrap text-3xl font-extrabold uppercase text-white lg:text-5xl"
            >
              {text}
            </span>
          ))}

        </div>

      </div>

      {/* White Ribbon */}

      <div className="mt-6 rotate-2 overflow-hidden bg-white py-4 shadow-md">

        <div
          className="marquee"
          style={{
            animationDirection: "reverse",
          }}
        >

          {[...Array(8)].map((_, index) => (
            <span
              key={index}
              className="mx-8 whitespace-nowrap text-3xl font-extrabold uppercase text-[#222] lg:text-5xl"
            >
              {text}
            </span>
          ))}

        </div>

      </div>

    </section>
  );
}