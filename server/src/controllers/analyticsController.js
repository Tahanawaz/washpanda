import { Booking } from "../models/Booking.js";
import { Contact } from "../models/Contact.js";

export async function getAnalytics(_request, response, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const trendStart = new Date(today);
    trendStart.setDate(today.getDate() - 6);

    const [summaryRows, packageRows, dailyRows, newMessages] = await Promise.all([
      Booking.aggregate([{ $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0] } },
        paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "Complete"] }, 1, 0] } },
        statusPairs: { $push: "$status" },
      } }]),
      Booking.aggregate([
        { $group: { _id: "$washPackage.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: trendStart } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          bookings: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0] } },
        } },
      ]),
      Contact.countDocuments({ status: "New" }),
    ]);
    const summary = summaryRows[0] || { totalBookings: 0, revenue: 0, paid: 0, pending: 0, completed: 0, statusPairs: [] };
    const statusCounts = summary.statusPairs.reduce((counts, status) => ({ ...counts, [status]: (counts[status] || 0) + 1 }), {});
    const dailyMap = Object.fromEntries(dailyRows.map((row) => [row._id, row]));
    const dailyTrend = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - offset));
      const key = date.toISOString().slice(0, 10);
      const item = dailyMap[key] || { bookings: 0, revenue: 0 };
      return {
        date: date.toISOString(),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        bookings: item.bookings,
        revenue: item.revenue,
      };
    });

    response.json({
      success: true,
      data: {
        totalBookings: summary.totalBookings,
        revenue: summary.revenue,
        pending: summary.pending,
        completed: summary.completed,
        paid: summary.paid,
        unpaid: summary.totalBookings - summary.paid,
        newMessages,
        statusCounts,
        dailyTrend,
        popularPackages: packageRows.map((row) => ({ name: row._id, count: row.count })),
      },
    });
  } catch (error) {
    next(error);
  }
}
