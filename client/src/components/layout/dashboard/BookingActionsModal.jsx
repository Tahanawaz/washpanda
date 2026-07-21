import { LuEye, LuTrash2, LuX } from "react-icons/lu";
import { getBookingStatusStyle } from "../../../constants/bookingStatus";

const statuses = ["Pending", "Confirmed", "In Progress", "Complete", "Cancelled"];

export default function BookingActionsModal({ booking, onClose, onUpdate, onDelete, onView }) {
  if (!booking) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-actions-title"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4B95D1]">Booking #{booking.id}</p>
            <h2 id="booking-actions-title" className="mt-1 text-2xl font-bold text-gray-800">Manage booking</h2>
            <p className="mt-1 text-sm text-gray-500">{booking.name} · {booking.vehicle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close booking actions" className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <LuX size={22} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">Booking status</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdate({ status })}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${booking.status === status ? getBookingStatusStyle(status) : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">Payment status</p>
            <div className="grid grid-cols-2 gap-2">
              {["Paid", "Unpaid"].map((payment) => (
                <button
                  key={payment}
                  type="button"
                  onClick={() => onUpdate({ payment })}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${booking.payment === payment ? (payment === "Paid" ? "border-green-400 bg-green-50 text-green-600" : "border-red-300 bg-red-50 text-red-500") : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {payment}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          <button type="button" onClick={onDelete} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50">
            <LuTrash2 size={17} /> Delete
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Close</button>
            {onView && (
              <button type="button" onClick={onView} className="flex items-center gap-2 rounded-lg bg-[#4B95D1] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600">
                <LuEye size={17} /> View details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
