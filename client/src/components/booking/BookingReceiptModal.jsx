import { FaCheck } from "react-icons/fa6";
import { LuCreditCard, LuDownload, LuHouse, LuX } from "react-icons/lu";

export default function BookingReceiptModal({ booking, settings, onClose, onHome }) {
  if (!booking) return null;
  const payment = settings?.paymentMethods?.find((method) => method.id === booking.paymentMethod);
  const bookingDate = new Date(booking.bookingDate);
  const printReceipt = () => window.print();

  return (
    <div className="booking-receipt-print fixed inset-0 z-[250] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm print:static print:block print:bg-white print:p-0" role="dialog" aria-modal="true" aria-labelledby="booking-confirmation-title">
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl print:max-w-none print:rounded-none print:shadow-none">
        <div className="relative bg-gradient-to-br from-[#0f3a56] to-[#287fbd] px-6 py-7 text-center text-white sm:px-9">
          <button type="button" onClick={onClose} aria-label="Close confirmation" className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 hover:bg-white/20 print:hidden"><LuX size={20} /></button>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-white shadow-lg"><FaCheck size={25} /></span>
          <h2 id="booking-confirmation-title" className="mt-4 text-2xl font-bold">Booking confirmed</h2>
          <p className="mt-1 text-sm text-blue-100">Order #{booking.orderNumber} · Keep this receipt for your record</p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-5"><div><img src="/logo.png" alt="WashPanda" className="h-14 w-24 object-contain" /><p className="mt-1 text-xs text-gray-400">{settings?.address}</p></div><div className="text-right"><p className="text-xs font-bold uppercase tracking-wide text-gray-400">Receipt total</p><p className="mt-1 text-2xl font-extrabold text-[#1f6faa]">{booking.totalAmount.toLocaleString("en-PK")} <span className="text-sm">{settings?.currency || "PKR"}</span></p></div></div>

          <div className="grid gap-5 py-5 text-sm sm:grid-cols-2">
            <ReceiptGroup title="Customer"><ReceiptRow label="Name" value={booking.customer.fullName} /><ReceiptRow label="Phone" value={booking.customer.phone} /><ReceiptRow label="Email" value={booking.customer.email} /></ReceiptGroup>
            <ReceiptGroup title="Appointment"><ReceiptRow label="Date" value={bookingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} /><ReceiptRow label="Time" value={`${booking.timeSlot.label} · ${booking.timeSlot.time}`} /><ReceiptRow label="Status" value={booking.status} /></ReceiptGroup>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm"><ReceiptRow label={`${booking.vehicle.type} · ${booking.vehicle.makeAndModel}`} value={`${booking.vehicle.surcharge.toLocaleString("en-PK")} PKR surcharge`} /><ReceiptRow label={booking.washPackage.name} value={`${booking.washPackage.price.toLocaleString("en-PK")} PKR`} />{booking.addons.map((addon) => <ReceiptRow key={addon.name} label={addon.name} value={`${addon.price.toLocaleString("en-PK")} PKR`} />)}</div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex items-center gap-2 font-bold text-gray-800"><LuCreditCard className="text-[#4B95D1]" /> {payment?.label || booking.paymentMethod}</div>{payment?.instructions && <p className="mt-2 text-sm leading-6 text-gray-600">{payment.instructions}</p>}{payment?.accountNumber && <p className="mt-2 text-sm font-semibold text-gray-700">{payment.accountTitle ? `${payment.accountTitle} · ` : ""}{payment.accountNumber}</p>}{booking.paymentReference && <p className="mt-2 text-xs text-gray-500">Transaction reference: {booking.paymentReference}</p>}{payment?.paymentUrl && <a href={payment.paymentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-[#4B95D1] px-4 py-2.5 text-sm font-bold text-white print:hidden">Continue to secure payment</a>}</div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end print:hidden"><button type="button" onClick={onHome} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-600"><LuHouse /> Back to home</button><button type="button" onClick={printReceipt} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4B95D1] px-5 py-3 font-bold text-white"><LuDownload /> Print / Save PDF</button></div>
        </div>
      </div>
    </div>
  );
}

function ReceiptGroup({ title, children }) { return <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#4B95D1]">{title}</p><div className="space-y-2">{children}</div></div>; }
function ReceiptRow({ label, value }) { return <div className="flex items-start justify-between gap-4"><span className="text-gray-500">{label}</span><span className="text-right font-semibold text-gray-800">{value}</span></div>; }
