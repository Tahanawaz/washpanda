import { useEffect, useMemo, useState } from "react";
import { FaCalendarDays, FaCarSide, FaCheck, FaCreditCard } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import BookingReceiptModal from "../components/booking/BookingReceiptModal";
import { createBooking, getBookingAvailability, getBookingAvailabilityWeek, getCatalog, getSiteSettings } from "../services/api";

const money = (value) => `${Number(value || 0).toLocaleString("en-PK")} PKR`;

function StepHeading({ number, title, subtitle, action }) {
  return <div className="mb-6 flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4B95D1] text-sm font-bold text-white shadow-lg shadow-blue-100">{number}</span><div><h2 className="text-xl font-bold text-gray-800 sm:text-2xl">{title}</h2><p className="mt-1 text-xs text-gray-500 sm:text-sm">{subtitle}</p></div></div>{action}</div>;
}

function getWeek(offset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Booking() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [settings, setSettings] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [washPackage, setWashPackage] = useState(null);
  const [addons, setAddons] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; });
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState({});
  const [loadedWeekStart, setLoadedWeekStart] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const week = useMemo(() => getWeek(weekOffset), [weekOffset]);

  useEffect(() => {
    Promise.all([getCatalog(), getSiteSettings()])
      .then(([catalogPayload, settingsPayload]) => {
        const nextCatalog = catalogPayload.data;
        const nextSettings = settingsPayload.data;
        setCatalog(nextCatalog);
        setSettings(nextSettings);
        setVehicle(nextCatalog.vehicles[0] || null);
        setWashPackage(nextCatalog.packages.find((item) => item.featured) || nextCatalog.packages[0] || null);
        setSelectedTime(null);
        setPaymentMethod(nextSettings.paymentMethods.find((method) => method.enabled)?.id || "");
      })
      .catch((error) => setSubmitError(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    getBookingAvailabilityWeek(dateKey(week[0]), 7)
      .then((payload) => {
        if (!active) return;
        setAvailability((current) => ({ ...current, ...payload.data }));
        setLoadedWeekStart(dateKey(week[0]));
        const daySlots = payload.data[dateKey(week[0])] || [];
        setSelectedTime((current) => daySlots.find((slot) => slot.time === current?.time && slot.available) || daySlots.find((slot) => slot.available) || null);
      })
      .catch((error) => { if (active) setSubmitError(error.message); });
    return () => { active = false; };
  }, [week]);

  useEffect(() => {
    if (!bookingResult) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [bookingResult]);

  const total = (washPackage?.price || 0) + (vehicle?.surcharge || 0) + addons.reduce((sum, addon) => sum + addon.price, 0);
  const availabilityLoading = loadedWeekStart !== dateKey(week[0]);
  const selectedPayment = settings?.paymentMethods.find((method) => method.id === paymentMethod);

  const toggleAddon = (addon) => setAddons((current) => current.some((item) => item._id === addon._id) ? current.filter((item) => item._id !== addon._id) : [...current, addon]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTime) return setSubmitError("Please select an available time slot.");
    setSubmitting(true);
    setSubmitError("");
    const form = new FormData(event.currentTarget);
    try {
      const payload = await createBooking({
        customer: { fullName: form.get("fullName"), email: form.get("email"), phone: form.get("phone"), address: form.get("address") },
        vehicle: { id: vehicle._id, type: vehicle.name, makeAndModel: form.get("vehicleModel") },
        washPackage: { id: washPackage._id, name: washPackage.name },
        addonIds: addons.map((addon) => addon._id),
        bookingDate: dateKey(selectedDate),
        timeSlot: { label: selectedTime.label, time: selectedTime.time },
        paymentMethod,
        paymentReference: form.get("paymentReference"),
        note: form.get("note"),
      });
      setBookingResult(payload.data);
    } catch (error) {
      setSubmitError(error.message);
      const availabilityPayload = await getBookingAvailability(dateKey(selectedDate)).catch(() => null);
      if (availabilityPayload) setAvailability((current) => ({ ...current, [dateKey(selectedDate)]: availabilityPayload.data }));
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center bg-[#f6fafe] text-gray-500">Preparing your booking options...</div>;
  if (!catalog || !vehicle || !washPackage) return <div className="flex min-h-[70vh] items-center justify-center text-red-500">Booking options are currently unavailable.</div>;

  return (
    <div className="bg-[#f8fbfd]">
      <section className="relative h-[280px] overflow-hidden sm:h-[360px] lg:h-[430px]"><img src="/book-wash.png" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/booking-banner.png"; }} alt="Wash Panda booking assistance" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-slate-950/25" /><div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">Premium doorstep car care</p><h1 className="mt-4 text-4xl font-extrabold sm:text-5xl lg:text-6xl">Book your wash</h1><p className="mt-4 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">Live pricing, available time slots and a printable receipt—all in one simple flow.</p></div></section>

      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8 lg:py-14">
        <BookingSection><StepHeading number="01" title="Choose your vehicle" subtitle="Pricing automatically adjusts for vehicle size." /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{catalog.vehicles.map((item) => { const active = vehicle._id === item._id; return <button key={item._id} type="button" onClick={() => setVehicle(item)} className={`rounded-2xl border p-4 text-center transition ${active ? "border-[#4B95D1] bg-blue-50 ring-4 ring-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}><img src={item.image} alt={item.name} className="mx-auto h-16 w-full object-contain" /><span className={`mt-3 block font-bold ${active ? "text-[#287fbd]" : "text-gray-800"}`}>{item.name}</span>{item.surcharge > 0 && <small className="mt-1 block text-gray-400">+{money(item.surcharge)}</small>}</button>; })}</div></BookingSection>

        <BookingSection><StepHeading number="02" title="Select a wash package" subtitle={`Best options for your ${vehicle.name}.`} /><div className="grid gap-5 lg:grid-cols-3">{catalog.packages.map((item) => { const active = washPackage._id === item._id; return <button key={item._id} type="button" onClick={() => setWashPackage(item)} className={`relative rounded-2xl border p-5 text-left transition ${active ? "border-[#4B95D1] bg-blue-50/60 ring-4 ring-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}>{item.featured && <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase text-violet-600">Recommended</span>}<h3 className="font-bold uppercase text-[#4B95D1]">{item.name}</h3><p className="mt-3 text-3xl font-extrabold text-gray-900">{money(item.price + vehicle.surcharge)}</p><ul className="mt-5 space-y-2">{item.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-gray-500"><FaCheck className="mt-1 shrink-0 text-[#4B95D1]" />{feature}</li>)}</ul></button>; })}</div></BookingSection>

        <BookingSection><StepHeading number="03" title="Optional add-ons" subtitle="Small upgrades for a more complete finish." action={<button type="button" onClick={() => setAddons([])} className="rounded-xl border border-blue-100 px-3 py-2 text-xs font-bold text-[#4B95D1]">Clear all</button>} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{catalog.addons.map((addon) => { const active = addons.some((item) => item._id === addon._id); return <button key={addon._id} type="button" onClick={() => toggleAddon(addon)} className={`rounded-2xl border px-3 py-4 text-center transition ${active ? "border-[#4B95D1] bg-blue-50 ring-2 ring-blue-50" : "border-gray-100 bg-white hover:border-blue-200"}`}><span className="block text-xs text-gray-600">{addon.name}</span><span className="mt-2 block font-bold text-gray-800">{money(addon.price)}</span></button>; })}</div></BookingSection>

        <BookingSection><StepHeading number="04" title="Pick an available slot" subtitle="Full and already-passed slots are disabled automatically." /><div className="mb-4 flex items-center justify-between"><button type="button" disabled={weekOffset === 0} onClick={() => { const next = Math.max(0, weekOffset - 1); setWeekOffset(next); setSelectedDate(getWeek(next)[0]); setSelectedTime(null); }} className="h-10 w-10 rounded-xl border border-gray-200 text-xl text-gray-500 disabled:opacity-30">←</button><h3 className="font-bold text-gray-800">{week[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3><button type="button" onClick={() => { const next = weekOffset + 1; setWeekOffset(next); setSelectedDate(getWeek(next)[0]); setSelectedTime(null); }} className="h-10 w-10 rounded-xl bg-[#4B95D1] text-xl text-white">→</button></div><div className="overflow-x-auto rounded-2xl border border-gray-100"><div className="grid min-w-[820px] grid-cols-7">{week.map((date) => { const activeDate = dateKey(date) === dateKey(selectedDate); const slots = availability[dateKey(date)] || catalog.timeSlots; return <div key={date.toISOString()} className="border-r border-gray-100 last:border-r-0"><button type="button" onClick={() => { setSelectedDate(date); setSelectedTime(slots.find((slot) => slot.available) || null); }} className={`w-full border-b border-gray-100 px-2 py-3 text-center ${activeDate ? "bg-[#edf7fe] text-[#287fbd]" : "bg-slate-50 text-gray-600"}`}><span className="block text-xs">{date.toLocaleDateString("en-US", { weekday: "short" })}</span><span className="mt-1 block text-lg font-bold">{date.getDate()}</span></button><div className="space-y-2 p-2">{slots.map((slot) => { const available = slot.available !== false; const selected = activeDate && selectedTime?.time === slot.time; return <button key={slot.time} type="button" disabled={!available || availabilityLoading} onClick={() => { setSelectedDate(date); setSelectedTime(slot); }} className={`w-full rounded-xl border px-1 py-2 text-[10px] leading-4 transition ${selected ? "border-[#4B95D1] bg-[#4B95D1] text-white" : available ? "border-gray-100 bg-white hover:border-blue-300" : slot.expired ? "cursor-not-allowed border-amber-100 bg-amber-50 text-amber-500" : "cursor-not-allowed border-red-100 bg-red-50 text-red-400"}`}>{slot.label}<br />{available ? slot.time : slot.expired ? "Passed" : "Full"}{slot.remaining !== undefined && available && <small className="block opacity-70">{slot.remaining} left</small>}</button>; })}</div></div>; })}</div></div></BookingSection>

        <BookingSection><StepHeading number="05" title="Your details & payment" subtitle="Review the total and confirm your appointment." /><div className="grid gap-3 md:grid-cols-3"><Summary icon={FaCalendarDays} title={`${selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${selectedTime?.label || "Select time"}`} subtitle="Appointment" /><Summary icon={FaCreditCard} title={money(total)} subtitle="Total amount" /><Summary icon={FaCarSide} title={vehicle.name} subtitle="Selected vehicle" /></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">{[["fullName", "Full name", "text", 120], ["email", "Email", "email", 160], ["phone", "Phone number", "tel", 24], ["address", "Address", "text", 300], ["vehicleModel", "Vehicle make & model", "text", 120]].map(([id, label, type, maxLength]) => <FormField key={id} id={id} label={label}><input id={id} name={id} type={type} maxLength={maxLength} required className={formControl} /></FormField>)}<FormField id="payment" label="Payment method"><select id="payment" name="payment" required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={formControl}>{settings.paymentMethods.filter((method) => method.enabled).map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}</select></FormField>
            {selectedPayment && paymentMethod !== "cash" && <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm sm:col-span-2"><p className="font-bold text-gray-800">{selectedPayment.label}</p><p className="mt-1 leading-6 text-gray-600">{selectedPayment.instructions}</p>{selectedPayment.accountNumber && <p className="mt-2 font-semibold text-gray-700">{selectedPayment.accountTitle ? `${selectedPayment.accountTitle} · ` : ""}{selectedPayment.accountNumber}</p>}<label className="mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500">Transaction reference (optional before payment)<input name="paymentReference" className={formControl} /></label></div>}
            <FormField id="note" label="Note" className="sm:col-span-2"><textarea id="note" name="note" rows="4" maxLength="1000" className={`${formControl} resize-none`} /></FormField>
            <label className="absolute -left-[9999px]" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
          </div>
          {submitError && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{submitError}</p>}
          <button type="submit" disabled={submitting || !selectedTime} className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#438fca] to-[#2879b8] px-6 py-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-64">{submitting ? "Confirming booking..." : "Confirm booking"}</button>
        </BookingSection>
      </form>

      <BookingReceiptModal booking={bookingResult} settings={settings} onClose={() => setBookingResult(null)} onHome={() => navigate("/")} />
    </div>
  );
}

const formControl = "mt-2 w-full rounded-xl border border-gray-200 bg-[#fbfdff] px-4 py-3 text-sm font-normal text-gray-700 outline-none focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50";
function BookingSection({ children }) { return <section className="rounded-3xl bg-white p-5 shadow-[0_14px_45px_rgba(31,87,130,0.06)] sm:p-7 lg:p-8">{children}</section>; }
function FormField({ id, label, children, className = "" }) { return <label htmlFor={id} className={`text-sm font-semibold text-gray-700 ${className}`}>{label}*{children}</label>; }
function Summary({ icon: Icon, title, subtitle }) { return <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#fbfdff] p-4"><span className="rounded-xl bg-[#4B95D1] p-3 text-white"><Icon /></span><div><p className="font-bold text-[#287fbd]">{title}</p><p className="text-xs text-gray-400">{subtitle}</p></div></div>; }
