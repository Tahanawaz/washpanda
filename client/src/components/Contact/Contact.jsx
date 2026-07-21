import ContactForm from "./ContactForm";

export default function Contact() {
  return (
    <section id="contact" className="bg-white px-4 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center text-3xl font-extrabold uppercase text-[#222] sm:text-4xl">
          Quick Contact
        </h2>

        <div className="grid items-stretch gap-8 md:grid-cols-2 lg:gap-12">
          <div className="min-h-[360px] overflow-hidden rounded-lg">
            <img
              src="/contact-panda.png"
              alt="Wash Panda customer support"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
