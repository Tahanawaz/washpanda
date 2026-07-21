import { LuCalendarClock, LuCircleDollarSign, LuCircleCheckBig, LuEllipsisVertical, LuMessageSquare, LuShoppingBag } from "react-icons/lu";

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import BookingActionsModal from '../../components/layout/dashboard/BookingActionsModal';
import { getBookingStatusDotStyle, getBookingStatusStyle } from '../../constants/bookingStatus';
import {
  deleteBooking as removeBooking,
  getAnalytics,
  getBookings,
  updateBooking as saveBooking,
} from '../../services/api';

function normalizeBooking(booking) {
  const bookingDate = new Date(booking.bookingDate);
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
    date: Number.isNaN(bookingDate.getTime())
      ? booking.timeSlot?.label || "—"
      : `${bookingDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} - ${booking.timeSlot?.label || ""}`,
  };
}

function SummaryCard({ title, value, icon: Icon = LuShoppingBag, tone = "blue" }) {
  const tones = { blue: "bg-blue-50 text-[#4B95D1]", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600" };
  return (
    <article className="flex min-h-[122px] items-center justify-between rounded-3xl border border-white bg-white px-6 py-5 shadow-[0_10px_35px_rgba(30,91,136,0.06)]">
      <div>
        <p className="text-lg text-gray-500 xl:text-xl">{title}</p>
        <p className="mt-2 text-3xl font-bold text-[#222]">{value}</p>
      </div>
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon size={29} strokeWidth={1.7} />
      </span>
    </article>
  );
}

function StatusBadge({ children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${getBookingStatusStyle(children)}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${getBookingStatusDotStyle(children)}`} />
      {children}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { search = "" } = useOutletContext() || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [analytics, setAnalytics] = useState(null);

  const filters = ["All", "Pending", "Confirmed", "In Progress", "Complete", "Cancelled", "Paid", "Unpaid"];

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesSearch = !query || Object.values(booking).join(" ").toLowerCase().includes(query);
      const matchesFilter = activeFilter === "All"
        || booking.status === activeFilter
        || booking.payment === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, bookings, search]);

  const totalEarnings = bookings
    .filter((booking) => booking.payment === "Paid")
    .reduce((sum, booking) => sum + booking.amount, 0);

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

  useEffect(() => {
    getAnalytics().then((payload) => setAnalytics(payload.data)).catch(() => undefined);
  }, []);

  const updateBooking = async (id, changes) => {
    try {
      setError("");
      await saveBooking(id, {
        ...(changes.status ? { status: changes.status } : {}),
        ...(changes.payment ? { paymentStatus: changes.payment } : {}),
      });
      setBookings((current) => current.map((booking) =>
        booking.id === id ? { ...booking, ...changes } : booking,
      ));
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
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard title="Total Bookings" value={analytics?.totalBookings ?? bookings.length} icon={LuShoppingBag} />
        <SummaryCard title="Paid Revenue" value={`${(analytics?.revenue ?? totalEarnings).toLocaleString("en-PK")} PKR`} icon={LuCircleDollarSign} tone="green" />
        <SummaryCard title="Pending" value={analytics?.pending ?? 0} icon={LuCalendarClock} tone="amber" />
        <SummaryCard title="New Messages" value={analytics?.newMessages ?? 0} icon={LuMessageSquare} tone="violet" />
      </div>

      {analytics && <AnalyticsOverview analytics={analytics} />}

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_7px_25px_rgba(0,0,0,0.03)]">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div><h2 className="text-lg font-bold text-[#222]">Recent Bookings</h2><p className="mt-0.5 text-xs text-gray-400">Filter and manage booking records</p></div>
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1" aria-label="Filter recent bookings">
              {filters.map((filter) => {
                const count = filter === "All"
                  ? bookings.length
                  : bookings.filter((booking) => booking.status === filter || booking.payment === filter).length;
                return (
                  <button key={filter} type="button" onClick={() => setActiveFilter(filter)} aria-pressed={activeFilter === filter} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${activeFilter === filter ? "bg-[#4B95D1] text-white shadow-sm" : "bg-[#F5F8FB] text-gray-600 hover:bg-blue-50 hover:text-[#4B95D1]"}`}>
                    {filter}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeFilter === filter ? "bg-white/15 text-blue-50" : "bg-white text-gray-400"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-[#222]">
                {['Id', 'Customer Name', 'Phone', 'Email', 'Vehicle Type', 'Package', 'Amount', 'Payment Status', 'Booking Status', 'Date & Time', 'Action'].map((heading) => (
                  <th key={heading} className="px-3 py-2.5 text-xs font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-200 text-xs text-gray-500 last:border-0 hover:bg-gray-50/70">
                  <td className="px-3 py-2.5">{booking.id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{booking.name}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{booking.phone}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{booking.email}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{booking.vehicle}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{booking.package}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{booking.amount}<span className="text-[9px]">PKR</span></td>
                  <td className={`whitespace-nowrap px-3 py-2.5 font-medium ${booking.payment === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>{booking.payment}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusBadge>{booking.status}</StatusBadge></td>
                  <td className="whitespace-nowrap px-3 py-2.5">{booking.date}</td>
                  <td className="relative px-3 py-2.5">
                    <button type="button" onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)} aria-label={`Actions for booking ${booking.id}`} className="rounded p-2 hover:bg-gray-100"><LuEllipsisVertical size={20} /></button>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td colSpan="11" className="px-7 py-12 text-center text-gray-500">Loading bookings...</td></tr>
              )}
              {!loading && filteredBookings.length === 0 && (
                <tr><td colSpan="11" className="px-7 py-12 text-center text-gray-500">No bookings match “{search}”.</td></tr>
              )}
            </tbody>
          </table>
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

function AnalyticsOverview({ analytics }) {
  const maxBookings = Math.max(1, ...analytics.dailyTrend.map((item) => item.bookings));
  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <section className="rounded-3xl bg-white p-5 shadow-[0_10px_35px_rgba(30,91,136,0.05)] sm:p-6">
        <div className="flex items-center justify-between"><div><h2 className="font-bold text-gray-800">7-day booking trend</h2><p className="mt-1 text-xs text-gray-400">New bookings received each day</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#4B95D1]">Live</span></div>
        <div className="mt-6 flex h-40 items-end justify-between gap-2 sm:gap-4">{analytics.dailyTrend.map((item) => <div key={item.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-gray-600">{item.bookings}</span><div className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-[#4B95D1] to-[#8cc7f2] transition-all" style={{ height: `${Math.max(8, (item.bookings / maxBookings) * 100)}%` }} /><span className="text-[10px] font-semibold text-gray-400">{item.label}</span></div>)}</div>
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-[0_10px_35px_rgba(30,91,136,0.05)] sm:p-6"><div className="flex items-center gap-2"><LuCircleCheckBig className="text-emerald-500" /><h2 className="font-bold text-gray-800">Popular packages</h2></div><div className="mt-5 space-y-4">{analytics.popularPackages.map((item) => <div key={item.name}><div className="flex justify-between text-sm"><span className="font-semibold text-gray-600">{item.name}</span><span className="font-bold text-[#4B95D1]">{item.count}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gradient-to-r from-[#4B95D1] to-[#8cc7f2]" style={{ width: `${Math.max(10, (item.count / Math.max(1, analytics.popularPackages[0]?.count)) * 100)}%` }} /></div></div>)}{analytics.popularPackages.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No booking data yet.</p>}</div></section>
    </div>
  );
}
