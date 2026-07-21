import AboutImage from "./AboutImage";
import AboutContent from "./AboutContent";

export default function About() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="px-4 sm:px-8 lg:px-12">

        <h2 className="mb-14 text-center text-4xl font-extrabold uppercase text-[#222]">
          WHO IS WASH PANDA
        </h2>

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <AboutImage />
          <AboutContent />
        </div>

      </div>
    </section>
  );
}
