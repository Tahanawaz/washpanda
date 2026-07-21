import { useSiteSettings } from "../../../hooks/useSiteSettings";

export default function ContactInfo() {
  const settings = useSiteSettings();
  return <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hidden items-center justify-end gap-3 xl:flex"><img src="/call-logo.png" alt="Contact" className="h-11 w-11 object-contain" /><div className="flex flex-col"><span className="text-[11px] text-gray-700">Have any question?</span><span className="whitespace-nowrap text-[14px] font-semibold text-gray-800">{settings.phone}</span></div></a>;
}
