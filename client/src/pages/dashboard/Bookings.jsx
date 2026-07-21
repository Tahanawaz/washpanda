import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LuEllipsisVertical } from "react-icons/lu";
import BookingActionsModal from "../../components/layout/dashboard/BookingActionsModal";
import { getBookingStatusDotStyle, getBookingStatusStyle } from "../../constants/bookingStatus";
import {
  deleteBooking as removeBooking,
  getBookings,
  updateBooking as saveBooking,
} from "../../services/api";

function pageButtons(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis-end", total];
  if (current >= total - 3) return [1, "ellipsis-start", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", total];
}

export default function Bookings() {
  const navigate = useNavigate();
  const { search = "" } = useOutletContext() || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter((booking) => Object.values(booking).join(" ").toLowerCase().includes(query));
  }, [bookings, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleBookings = filtered.slice(start, start + pageSize);

  useEffect(() => {
    let active = true;
    getBookings()
      .then((payload) => {
        if (active) setBookings(payload.data.map(normalizeBooking));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateBooking = async (id, changes) => {
    try {
      setError("");
      await saveBooking(id, {
        ...(changes.status ? { status: changes.status } : {}),
        ...(changes.payment ? { paymentStatus: changes.payment } : {}),
      });
      setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, ...changes } : booking));
      setActiveMenu(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteBooking = async (id) => {
    try {
      setError("");
      await removeBooking(id);
      setBookings((current) => current.filter((booking) => booking.id !== id));
      setActiveMenu(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-7">
      <p className="text-lg font-semibold text-gray-600"><span className="text-[#4B95D1]">Dashboard</span>/Bookings</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_7px_25px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-[#222]">
                {["Id", "Customer Name", "Phone", "Email", "Vehicle Type", "Package", "Amount", "Payment Status", "Booking Status", "Date & Time", "Action"].map((heading) => (
                  <th key={heading} className="whitespace-nowrap px-7 py-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-200 text-xs text-gray-500 hover:bg-gray-50/60">
                  <td className="px-7 py-4">{booking.id}</td>
                  <td className="whitespace-nowrap px-7 py-4">{booking.name}</td>
                  <td className="whitespace-nowrap px-7 py-4">{booking.phone}</td>
                  <td className="whitespace-nowrap px-7 py-4">{booking.email}</td>
                  <td className="whitespace-nowrap px-7 py-4">{booking.vehicle}</td>
                  <td className="whitespace-nowrap px-7 py-4">{booking.package}</td>
                  <td className="whitespace-nowrap px-7 py-4">{booking.amount}<span className="text-[9px]">PKR</span></td>
                  <td className={`whitespace-nowrap px-7 py-4 font-medium ${booking.payment === "Paid" ? "text-green-500" : "text-red-500"}`}>{booking.payment}</td>
                  <td className="whitespace-nowrap px-7 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-semibold ${getBookingStatusStyle(booking.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${getBookingStatusDotStyle(booking.status)}`} />
                      {booking.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-7 py-4">{booking.date}</td>
                  <td className="relative px-7 py-4">
                    <button type="button" onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)} aria-label={`Actions for booking ${booking.id}`} className="rounded p-2 hover:bg-gray-100"><LuEllipsisVertical size={19} /></button>
                  </td>
                </tr>
              ))}
              {loading && <tr><td colSpan="11" className="px-7 py-14 text-center text-gray-500">Loading bookings...</td></tr>}
              {!loading && visibleBookings.length === 0 && <tr><td colSpan="11" className="px-7 py-14 text-center text-gray-500">No bookings match “{search}”.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 px-7 py-5 text-sm text-gray-700 lg:flex-row lg:items-center lg:justify-between">
          <p>Showing {filtered.length === 0 ? 0 : start + 1} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries</p>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3">Show
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-full border border-gray-500 bg-white px-4 py-2 outline-none">
                <option value="10">10</option><option value="20">20</option><option value="50">50</option>
              </select>Entries
            </label>
            <nav aria-label="Bookings pagination" className="flex items-center gap-1">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              {pageButtons(currentPage, totalPages).map((item) => typeof item === "number" ? (
                <button key={item} type="button" onClick={() => setPage(item)} className={`h-8 min-w-8 border px-2 ${currentPage === item ? "border-gray-800 bg-gray-50" : "border-transparent hover:bg-gray-50"}`}>{item}</button>
              ) : <span key={item} className="px-1">...</span>)}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </nav>
          </div>
        </div>
      </section>

      <BookingActionsModal
        booking={bookings.find((booking) => booking.id === activeMenu)}
        onClose={() => setActiveMenu(null)}
        onUpdate={(changes) => updateBooking(activeMenu, changes)}
        onDelete={() => deleteBooking(activeMenu)}
        onView={() => navigate(`/dashboard/bookings/${activeMenu}`)}
      />
    </div>
  );
}

function normalizeBooking(booking) {
  const bookingDate = new Date(booking.bookingDate);
  const date = Number.isNaN(bookingDate.getTime())
    ? booking.timeSlot?.label || "—"
    : `${bookingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} - ${booking.timeSlot?.label || ""}`;

  return {
    id: booking.orderNumber,
    name: booking.customer?.fullName || "—",
    phone: booking.customer?.phone || "—",
    email: booking.customer?.email || "—",
    vehicle: booking.vehicle?.type || "—",
    package: booking.washPackage?.name || "—",
    amount: booking.totalAmount || 0,
    payment: booking.paymentStatus || "Unpaid",
    status: booking.status || "Pending",
    date,
  };
}
