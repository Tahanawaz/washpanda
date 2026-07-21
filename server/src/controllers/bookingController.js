import { randomInt } from "node:crypto";
import { Booking } from "../models/Booking.js";
import { Catalog } from "../models/Catalog.js";
import { SiteSettings } from "../models/SiteSettings.js";
import { cleanEmail, cleanPhone, cleanText, isHoneypotFilled } from "../utils/validation.js";

const activeBookingFilter = { status: { $ne: "Cancelled" } };

function dateBounds(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const start = new Date(year, month - 1, day);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) return null;
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}

function localDateKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function slotStartAt(date, value) {
  const match = String(value || "").match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hour += 12;
  const slotStart = new Date(date);
  slotStart.setHours(hour, Number(match[2] || 0), 0, 0);
  return slotStart;
}

function isExpiredSlot(date, time, now = new Date()) {
  const start = slotStartAt(date, time);
  return start ? start <= now : false;
}

function bookingFilter(bounds, slotTime, extra = {}) {
  return {
    bookingDate: { $gte: bounds.start, $lt: bounds.end },
    "timeSlot.time": slotTime,
    ...activeBookingFilter,
    ...extra,
  };
}

function isSlotCollision(error) {
  return error?.code === 11000 && Boolean(error.keyPattern?.slotPosition);
}

function isOrderCollision(error) {
  return error?.code === 11000 && Boolean(error.keyPattern?.orderNumber);
}

async function createReservedBooking(data, bounds, slot) {
  const legacyCount = await Booking.countDocuments(bookingFilter(bounds, slot.time, { slotPosition: { $exists: false } }));
  const reservablePositions = Math.max(0, slot.capacity - legacyCount);

  for (let slotPosition = 1; slotPosition <= reservablePositions; slotPosition += 1) {
    for (let orderAttempt = 0; orderAttempt < 5; orderAttempt += 1) {
      try {
        return await Booking.create({
          ...data,
          orderNumber: randomInt(100000000, 1000000000),
          slotPosition,
        });
      } catch (error) {
        if (isOrderCollision(error)) continue;
        if (isSlotCollision(error)) break;
        throw error;
      }
    }
  }
  return null;
}

async function reserveExistingBooking(booking, bounds, slot) {
  const legacyCount = await Booking.countDocuments(bookingFilter(bounds, slot.time, {
    slotPosition: { $exists: false },
    _id: { $ne: booking._id },
  }));
  const reservablePositions = Math.max(0, slot.capacity - legacyCount);
  for (let slotPosition = 1; slotPosition <= reservablePositions; slotPosition += 1) {
    booking.slotPosition = slotPosition;
    try {
      await booking.save();
      return true;
    } catch (error) {
      if (!isSlotCollision(error)) throw error;
    }
  }
  booking.slotPosition = undefined;
  return false;
}

function availabilitySlots(catalog, counts, date) {
  return catalog.timeSlots.filter((item) => item.active).map((slot) => {
    const booked = counts[slot.time] || 0;
    const expired = isExpiredSlot(date, slot.time);
    return {
      id: slot._id,
      label: slot.label,
      time: slot.time,
      capacity: slot.capacity,
      booked,
      remaining: Math.max(0, slot.capacity - booked),
      expired,
      available: !expired && booked < slot.capacity,
    };
  });
}

export async function createBooking(request, response, next) {
  try {
    if (isHoneypotFilled(request.body)) {
      return response.status(201).json({ success: true, message: "Booking request received" });
    }

    const [catalog, settings] = await Promise.all([
      Catalog.findOne({ accountKey: "primary" }),
      SiteSettings.findOne({ accountKey: "primary" }),
    ]);
    if (!catalog) return response.status(503).json({ success: false, message: "Booking catalog is unavailable" });

    const requestedVehicle = request.body.vehicle || {};
    const requestedPackage = request.body.washPackage || {};
    const vehicle = catalog.vehicles.find((item) => item.active && (String(item._id) === String(requestedVehicle.id || "") || item.name === requestedVehicle.type));
    const washPackage = catalog.packages.find((item) => item.active && (String(item._id) === String(requestedPackage.id || "") || item.name === requestedPackage.name));
    const slot = catalog.timeSlots.find((item) => item.active && item.time === request.body.timeSlot?.time);
    if (!vehicle || !washPackage || !slot) {
      return response.status(400).json({ success: false, message: "Please select an available vehicle, package and time slot" });
    }

    const bounds = dateBounds(request.body.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!bounds || bounds.start < today) {
      return response.status(400).json({ success: false, message: "Please select a valid booking date" });
    }
    if (isExpiredSlot(bounds.start, slot.time)) {
      return response.status(409).json({ success: false, message: "This time slot has already passed. Please select a later time." });
    }

    const selectedAddonIds = new Set((request.body.addonIds || []).map(String));
    const selectedAddons = catalog.addons.filter((item) => item.active && selectedAddonIds.has(String(item._id)));
    const paymentMethod = String(request.body.paymentMethod || "");
    const enabledPayment = settings?.paymentMethods.find((item) => item.id === paymentMethod && item.enabled);
    if (!enabledPayment) return response.status(400).json({ success: false, message: "Selected payment method is unavailable" });

    const customer = request.body.customer || {};
    const totalAmount = washPackage.price + vehicle.surcharge + selectedAddons.reduce((sum, item) => sum + item.price, 0);
    const bookingData = {
      customer: {
        fullName: cleanText(customer.fullName, { field: "Full name", min: 2, max: 120 }),
        email: cleanEmail(customer.email),
        phone: cleanPhone(customer.phone),
        address: cleanText(customer.address, { field: "Address", min: 5, max: 300 }),
      },
      vehicle: {
        type: vehicle.name,
        makeAndModel: cleanText(requestedVehicle.makeAndModel, { field: "Vehicle make and model", max: 120 }),
        surcharge: vehicle.surcharge,
      },
      washPackage: { name: washPackage.name, price: washPackage.price },
      addons: selectedAddons.map(({ name, price }) => ({ name, price })),
      bookingDate: bounds.start,
      timeSlot: { label: slot.label, time: slot.time },
      totalAmount,
      paymentMethod,
      paymentReference: String(request.body.paymentReference || "").trim().slice(0, 160),
      note: String(request.body.note || "").trim().slice(0, 1000),
    };

    const booking = await createReservedBooking(bookingData, bounds, slot);
    if (!booking) {
      return response.status(409).json({ success: false, message: "This time slot has just filled up. Please select another slot." });
    }
    return response.status(201).json({ success: true, message: "Booking confirmed", data: booking });
  } catch (error) {
    return next(error);
  }
}

export async function getAvailability(request, response, next) {
  try {
    const bounds = dateBounds(request.query.date);
    if (!bounds) return response.status(400).json({ success: false, message: "A valid date is required" });
    const catalog = await Catalog.findOne({ accountKey: "primary" });
    if (!catalog) return response.status(503).json({ success: false, message: "Booking catalog is unavailable" });
    const counts = await Booking.aggregate([
      { $match: { bookingDate: { $gte: bounds.start, $lt: bounds.end }, ...activeBookingFilter } },
      { $group: { _id: "$timeSlot.time", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((item) => [item._id, item.count]));
    return response.json({ success: true, data: availabilitySlots(catalog, countMap, bounds.start) });
  } catch (error) {
    return next(error);
  }
}

export async function getWeeklyAvailability(request, response, next) {
  try {
    const firstBounds = dateBounds(request.query.start);
    const days = Math.min(14, Math.max(1, Number(request.query.days) || 7));
    if (!firstBounds) return response.status(400).json({ success: false, message: "A valid start date is required" });
    const rangeEnd = new Date(firstBounds.start);
    rangeEnd.setDate(rangeEnd.getDate() + days);
    const [catalog, bookings] = await Promise.all([
      Catalog.findOne({ accountKey: "primary" }),
      Booking.find({ bookingDate: { $gte: firstBounds.start, $lt: rangeEnd }, ...activeBookingFilter }).select("bookingDate timeSlot.time").lean(),
    ]);
    if (!catalog) return response.status(503).json({ success: false, message: "Booking catalog is unavailable" });

    const counts = {};
    for (const booking of bookings) {
      const key = localDateKey(booking.bookingDate);
      counts[key] ||= {};
      counts[key][booking.timeSlot.time] = (counts[key][booking.timeSlot.time] || 0) + 1;
    }
    const data = {};
    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(firstBounds.start);
      date.setDate(date.getDate() + offset);
      const key = localDateKey(date);
      data[key] = availabilitySlots(catalog, counts[key] || {}, date);
    }
    return response.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function getBookings(request, response, next) {
  try {
    const { status, paymentStatus, search } = request.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { "customer.fullName": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
      ];
    }
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    return response.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    return next(error);
  }
}

export async function getBooking(request, response, next) {
  try {
    const booking = await Booking.findOne({ orderNumber: request.params.orderNumber });
    if (!booking) return response.status(404).json({ success: false, message: "Booking not found" });
    return response.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

export async function updateBooking(request, response, next) {
  try {
    const booking = await Booking.findOne({ orderNumber: request.params.orderNumber });
    if (!booking) return response.status(404).json({ success: false, message: "Booking not found" });

    if (request.body.paymentStatus !== undefined) booking.paymentStatus = request.body.paymentStatus;
    if (request.body.note !== undefined) booking.note = String(request.body.note || "").trim().slice(0, 1000);

    const nextStatus = request.body.status;
    if (nextStatus !== undefined && nextStatus !== booking.status) {
      const previousStatus = booking.status;
      booking.status = nextStatus;
      booking.statusHistory.push({ status: nextStatus, changedAt: new Date(), changedBy: request.admin.name || "Administrator" });

      if (nextStatus === "Cancelled") {
        booking.slotPosition = undefined;
      } else if (previousStatus === "Cancelled" && !booking.slotPosition) {
        const catalog = await Catalog.findOne({ accountKey: "primary" });
        const slot = catalog?.timeSlots.find((item) => item.active && item.time === booking.timeSlot.time);
        const bounds = dateBounds(localDateKey(booking.bookingDate));
        if (!slot || !bounds || isExpiredSlot(bounds.start, slot.time)) {
          return response.status(409).json({ success: false, message: "This booking cannot be reactivated because its time slot is no longer available" });
        }
        if (!(await reserveExistingBooking(booking, bounds, slot))) {
          return response.status(409).json({ success: false, message: "This time slot is full. Keep the booking cancelled or create it in another slot." });
        }
        return response.json({ success: true, data: booking });
      }
    }

    await booking.save();
    return response.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

export async function deleteBooking(request, response, next) {
  try {
    const booking = await Booking.findOneAndDelete({ orderNumber: request.params.orderNumber });
    if (!booking) return response.status(404).json({ success: false, message: "Booking not found" });
    return response.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    return next(error);
  }
}

export async function markBookingNotificationSeen(request, response, next) {
  try {
    const booking = await Booking.findOneAndUpdate(
      { orderNumber: request.params.orderNumber },
      { notificationSeen: true },
      { new: true },
    );
    if (!booking) return response.status(404).json({ success: false, message: "Booking not found" });
    return response.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}
