import Container from "../../common/Container";

export default function HeroContent() {
  return (
    <Container>
      <div className="px-4 pb-5 pt-6 text-center sm:pt-8">
        <p className="text-[11px] font-medium uppercase tracking-[3px] text-gray-600 sm:text-xs">
          Welcome To Wash Panda
        </p>

        <h1 className="mx-auto mt-3 max-w-4xl text-3xl font-extrabold uppercase leading-[1.08] text-[#2B2B2B] sm:text-4xl lg:text-5xl">
          Your car is always in great hands with us
        </h1>

        <a
          href="/booking"
          className="mt-5 inline-block rounded bg-[#4A90E2] px-7 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          Book Now
        </a>
      </div>

      <img
        src="/hero.png"
        alt="Wash Panda cleaning a car"
        className="block h-auto w-full"
      />
    </Container>
  );
}
