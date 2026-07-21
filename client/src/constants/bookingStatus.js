export const bookingStatusStyles = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Confirmed: "border-violet-200 bg-violet-50 text-violet-700",
  "In Progress": "border-sky-200 bg-sky-50 text-sky-700",
  Complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  Canceled: "border-rose-200 bg-rose-50 text-rose-700",
};

export const bookingStatusDotStyles = {
  Pending: "bg-amber-500",
  Confirmed: "bg-violet-500",
  "In Progress": "bg-sky-500",
  Complete: "bg-emerald-500",
  Cancelled: "bg-rose-500",
  Canceled: "bg-rose-500",
};

export function getBookingStatusStyle(status) {
  return bookingStatusStyles[status] || "border-slate-200 bg-slate-50 text-slate-600";
}

export function getBookingStatusDotStyle(status) {
  return bookingStatusDotStyles[status] || "bg-slate-400";
}
