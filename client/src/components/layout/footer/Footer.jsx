import { FaEnvelope, FaFacebookF, FaInstagram, FaLocationDot, FaPhone, FaXTwitter } from "react-icons/fa6";
import { useSiteSettings } from "../../../hooks/useSiteSettings";

const footerLinks = [
  { label: "Home", href: "/" }, { label: "Booking", href: "/booking" }, { label: "About", href: "/#about" }, { label: "Gallery", href: "/#gallery" }, { label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

export default function Footer() {
  const settings = useSiteSettings();
  const contacts = [
    { icon: FaPhone, title: "Phone Number", value: settings.phone, href: `tel:${settings.phone.replace(/\s+/g, "")}` },
    { icon: FaEnvelope, title: "Mail Info", value: settings.email, href: `mailto:${settings.email}` },
    { icon: FaLocationDot, title: "Address", value: settings.address },
  ];
  const socials = [
    { label: "Facebook", icon: FaFacebookF, href: settings.facebook }, { label: "Instagram", icon: FaInstagram, href: settings.instagram }, { label: "X", icon: FaXTwitter, href: settings.twitter },
  ].filter((item) => item.href);

  return <footer><div className="bg-[#252525] px-4 py-5 text-white sm:px-8"><div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3 sm:gap-8">{contacts.map(({ icon: Icon, title, value, href }) => <div key={title} className="flex items-center gap-3 sm:justify-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-300"><Icon size={15} /></span><div><p className="text-sm font-semibold">{title}</p>{href ? <a href={href} className="text-xs text-gray-300 hover:text-white">{value}</a> : <p className="text-xs text-gray-300">{value}</p>}</div></div>)}</div></div><div className="bg-[#4B95D1] px-4 py-8 text-white sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row"><a href="/" aria-label="Wash Panda home"><img src="/logo.png" alt="Wash Panda" className="h-20 w-40 object-contain sm:h-24 sm:w-44" /></a><nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs">{footerLinks.map((link, index) => <span key={link.label} className="flex items-center gap-3">{index > 0 && <span className="text-blue-200">|</span>}<a href={link.href} className="hover:text-blue-100">{link.label}</a></span>)}</nav><div className="flex gap-2">{socials.map(({ label, icon: Icon, href }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 hover:bg-white hover:text-[#4B95D1]"><Icon size={13} /></a>)}</div></div><div className="mx-auto mt-6 max-w-6xl border-t border-white/30 pt-4 text-center text-xs text-blue-100">© 2026 {settings.businessName}. All rights reserved.</div></div></footer>;
}
