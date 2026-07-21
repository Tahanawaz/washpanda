import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useSiteSettings";

const content = {
  privacy: {
    eyebrow: "Your privacy",
    title: "Privacy Policy",
    intro: "This policy explains what information WashPanda collects when you request a car wash, contact our team, or use this website.",
    sections: [
      ["Information we collect", "We collect the contact, vehicle, address, booking, payment-reference and message details you choose to provide."],
      ["How we use it", "We use your information to schedule and deliver services, provide receipts, respond to messages, manage payments and improve customer support."],
      ["Data protection", "Access to booking and contact records is limited to authorized administrators. We do not sell customer information."],
      ["Retention and requests", "Records are retained for operational and legal needs. You may contact us to request correction or deletion where applicable."],
    ],
  },
  terms: {
    eyebrow: "Service agreement",
    title: "Terms & Conditions",
    intro: "These terms apply when you book or purchase a WashPanda car-care service through this website.",
    sections: [
      ["Bookings", "A booking is accepted after confirmation. Availability may change until the booking request is successfully completed."],
      ["Pricing and payment", "The confirmed receipt shows the selected package, add-ons and total price. Manual online payments remain subject to verification."],
      ["Access and vehicle condition", "Customers must provide safe access to the vehicle and disclose conditions that may affect the requested service."],
      ["Changes and cancellations", "Contact WashPanda as early as possible if you need to change or cancel an appointment."],
    ],
  },
};

export default function LegalPage({ type }) {
  const settings = useSiteSettings();
  const page = content[type];
  return (
    <section className="min-h-[70vh] bg-[#f5f9fc] px-4 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_24px_70px_rgba(32,91,136,0.1)]">
        <header className="bg-gradient-to-br from-[#12344d] to-[#287fbd] px-6 py-10 text-white sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">{page.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-blue-50">{page.intro}</p>
        </header>
        <div className="space-y-8 px-6 py-9 sm:px-10">
          {page.sections.map(([title, body]) => <article key={title}><h2 className="text-xl font-bold text-[#20384a]">{title}</h2><p className="mt-2 leading-7 text-gray-600">{body}</p></article>)}
          <div className="rounded-2xl bg-blue-50 p-5 text-sm leading-6 text-gray-600">Questions about these terms can be sent to <a href={`mailto:${settings.email}`} className="font-bold text-[#287fbd]">{settings.email}</a> or discussed at <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="font-bold text-[#287fbd]">{settings.phone}</a>.</div>
          <Link to="/" className="inline-flex rounded-xl bg-[#4B95D1] px-5 py-3 font-bold text-white hover:bg-blue-600">Back to website</Link>
        </div>
      </div>
    </section>
  );
}
