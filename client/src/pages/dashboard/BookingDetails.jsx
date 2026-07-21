import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LuCheck, LuPrinter } from "react-icons/lu";
import BookingReceiptModal from "../../components/booking/BookingReceiptModal";
import { getBooking, getSiteSettings, updateBooking } from "../../services/api";

const bookingStatuses = ["Pending", "Confirmed", "In Progress", "Complete", "Cancelled"];

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const orderNumber = useMemo(() => id || "2045", [id]);

  useEffect(() => {
    let active = true;
    getBooking(orderNumber)
      .then((payload) => {
        if (active) setBooking(payload.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [orderNumber]);

  useEffect(() => {
    getSiteSettings().then((payload) => setSettings(payload.data)).catch(() => undefined);
  }, []);

  const saveChanges = async (changes) => {
    try {
      setError("");
      const payload = await updateBooking(orderNumber, changes);
      setBooking(payload.data);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading booking details...</p>;
  if (!booking) return <p role="alert" className="m-6 rounded-lg bg-red-50 p-4 text-red-600">{error || "Booking not found"}</p>;

  const bookingDate = new Date(booking.bookingDate);
  const formattedDate = Number.isNaN(bookingDate.getTime())
    ? "—"
    : bookingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const vehicleImage = `/${booking.vehicle.type}.png`;
  const activityHistory = booking.statusHistory?.length
    ? [...booking.statusHistory].sort((left, right) => new Date(left.changedAt) - new Date(right.changedAt))
    : [
        { status: "Pending", changedAt: booking.createdAt, changedBy: "Customer booking" },
        ...(booking.status !== "Pending" ? [{ status: booking.status, changedAt: booking.updatedAt, changedBy: "Administrator" }] : []),
      ];

  return (
    <div className="space-y-7 pb-4">
      <p className="text-lg font-semibold text-[#5c5c5c]">
        <Link to="/dashboard" className="text-[#3f93dc] hover:underline">Dashboard</Link>
        <span>/</span>
        <Link to="/dashboard/bookings" className="text-[#3f93dc] hover:underline">Bookings</Link>
        <span>/Booking Details</span>
      </p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

      <section className="min-h-[calc(100vh-184px)] rounded-2xl bg-white px-5 py-7 shadow-[0_7px_25px_rgba(0,0,0,0.035)] sm:px-7 lg:px-8">
        <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.62fr)_minmax(390px,1fr)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-[26px] font-semibold leading-tight text-[#262626]">Order Number #{orderNumber}</h2><button type="button" onClick={() => setReceiptOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-bold text-[#287fbd] hover:bg-blue-100"><LuPrinter /> Print receipt</button></div>

            <div className="mt-10 flex flex-col gap-6 border-b border-[#e4e4e4] pb-8 sm:flex-row sm:items-start">
              <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-xl border border-[#dedede] bg-white p-4">
                <img src={vehicleImage} alt={booking.vehicle.type} className="h-full w-full object-contain" />
              </div>

              <div className="min-w-0 flex-1 text-[17px] leading-[1.8] text-[#5e5e5e]">
                <p className="text-[20px] font-semibold leading-none text-[#252525]">{booking.vehicle.type}</p>
                <p className="mt-3"><span className="font-medium text-[#292929]">Package:</span> {booking.washPackage.name}</p>
                <div className="flex flex-wrap gap-x-1">
                  <span className="font-medium text-[#292929]">Addons:</span>
                  <div>
                    {booking.addons.length > 0
                      ? booking.addons.map((addon) => <p key={addon.name}>{addon.name}-{addon.price}<span className="text-xs">PKR</span></p>)
                      : <p>None</p>}
                  </div>
                </div>
                <p className="mt-1"><span className="font-medium text-[#292929]">Date &amp; Time:</span> {formattedDate} - {booking.timeSlot.label}</p>
              </div>

              <p className="shrink-0 text-[24px] font-semibold text-[#232323]">{booking.totalAmount.toLocaleString("en-PK")}<span className="text-base font-medium">PKR</span></p>
            </div>

            <div className="grid gap-8 border-b border-[#e4e4e4] py-8 lg:grid-cols-[minmax(0,1fr)_265px]">
              <div className="grid grid-cols-[52px_1fr] gap-3 text-[17px] leading-6">
                <span className="font-semibold text-[#292929]">Note:</span>
                <p className="max-w-[390px] text-[#686868]">{booking.note || "No note provided."}</p>
              </div>
              <div className="text-[18px]">
                <div className="flex justify-between border-b border-[#e4e4e4] pb-6 text-[#666]"><span>Subtotal:</span><span>{booking.totalAmount.toLocaleString("en-PK")}<span className="text-xs">PKR</span></span></div>
                <div className="flex justify-between pt-6 font-medium text-[#292929]"><span>Total :</span><span>{booking.totalAmount.toLocaleString("en-PK")}<span className="text-xs">PKR</span></span></div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[25px] font-semibold text-[#292929]">Customer Details</h3>
                <button type="button" onClick={() => saveChanges({ paymentStatus: "Paid" })} disabled={booking.paymentStatus === "Paid"} className="rounded-md bg-[#e4f8e9] px-5 py-2 text-[16px] text-[#13af3b] transition hover:bg-[#d6f3dd] disabled:cursor-default disabled:opacity-75">
                  {booking.paymentStatus === "Paid" ? "Paid" : "Mark as Paid"}
                </button>
              </div>

              <div className="mt-9 grid gap-x-14 gap-y-5 text-[17px] lg:grid-cols-2">
                <Detail label="Customer Name" value={booking.customer.fullName} />
                <Detail label="Vehicle Make & Model" value={booking.vehicle.makeAndModel} />
                <Detail label="Phone Number" value={booking.customer.phone} />
                <Detail label="Payment Method" value={booking.paymentMethod} />
                <Detail label="Email" value={booking.customer.email} />
                <Detail label="Payment Status" value={booking.paymentStatus} accent={booking.paymentStatus === "Paid" ? "text-green-500" : "text-[#ff3f3f]"} />
                <Detail label="Address" value={booking.customer.address} />
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-[#dedede] bg-slate-50/50 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4B95D1]">Live record</p><h3 className="mt-1 text-[25px] font-semibold text-[#292929]">Activity</h3></div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusColor(booking.status)}`}>{booking.status}</span>
            </div>
            <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-gray-500">Update booking status
              <select value={booking.status} onChange={(event) => saveChanges({ status: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-[#4B95D1] focus:ring-4 focus:ring-blue-50">
                {bookingStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <div className="mt-7">
              {activityHistory.map((item, index) => (
                <div key={`${item.status}-${item.changedAt}-${index}`} className="relative flex items-start gap-4 pb-7 last:pb-1">
                  {index < activityHistory.length - 1 && <span className="absolute left-[10px] top-5 h-[calc(100%-5px)] border-l border-dashed border-[#91a7b8]" />}
                  <span className={`relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.status === "Cancelled" ? "bg-red-500" : "bg-[#4B95D1]"} text-white`}><LuCheck size={14} strokeWidth={3} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-base font-semibold text-[#282828]">{item.status}</span><span className="mt-1 block text-xs text-gray-400">{item.changedBy || "Administrator"}</span></span>
                  <time className="shrink-0 text-right text-xs leading-5 text-[#666]" dateTime={item.changedAt}>{formatActivityDate(item.changedAt)}</time>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
      {receiptOpen && <BookingReceiptModal booking={booking} settings={settings} onClose={() => setReceiptOpen(false)} onHome={() => setReceiptOpen(false)} />}
    </div>
  );
}

function Detail({ label, value, accent = "text-[#666]" }) {
  return (
    <div className="grid grid-cols-[165px_1fr] gap-4">
      <span className="font-medium text-[#292929]">{label}</span>
      <span className={accent}>{value}</span>
    </div>
  );
}

function formatActivityDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusColor(status) {
  return {
    Pending: "bg-amber-100 text-amber-700",
    Confirmed: "bg-blue-100 text-blue-700",
    "In Progress": "bg-violet-100 text-violet-700",
    Complete: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  }[status] || "bg-gray-100 text-gray-600";
}
