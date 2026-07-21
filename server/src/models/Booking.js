import mongoose from "mongoose";

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true, enum: ["Pending", "Confirmed", "In Progress", "Complete", "Cancelled"] },
  changedAt: { type: Date, required: true, default: Date.now },
  changedBy: { type: String, trim: true, maxlength: 120, default: "System" },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  orderNumber: { type: Number, unique: true, index: true },
  customer: {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 24 },
    address: { type: String, required: true, trim: true, minlength: 5, maxlength: 300 },
  },
  vehicle: {
    type: { type: String, required: true, trim: true },
    makeAndModel: { type: String, required: true, trim: true, maxlength: 120 },
    surcharge: { type: Number, default: 0, min: 0 },
  },
  washPackage: {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  addons: { type: [addonSchema], default: [] },
  bookingDate: { type: Date, required: true },
  timeSlot: {
    label: { type: String, required: true },
    time: { type: String, required: true },
  },
  slotPosition: { type: Number, min: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true, enum: ["cash", "card", "bank", "jazzcash", "easypaisa"] },
  paymentReference: { type: String, trim: true, maxlength: 160, default: "" },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  status: { type: String, enum: ["Pending", "Confirmed", "In Progress", "Complete", "Cancelled"], default: "Pending" },
  statusHistory: { type: [statusHistorySchema], default: [] },
  note: { type: String, trim: true, maxlength: 1000, default: "" },
  notificationSeen: { type: Boolean, default: false },
}, { timestamps: true });

bookingSchema.pre("save", function setOrderNumber() {
  if (!this.orderNumber) this.orderNumber = Number(`${Date.now()}`.slice(-9));
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status || "Pending", changedAt: new Date(), changedBy: "Customer booking" });
  }
});

bookingSchema.index(
  { bookingDate: 1, "timeSlot.time": 1, slotPosition: 1 },
  { unique: true, partialFilterExpression: { slotPosition: { $type: "number" } } },
);

export const Booking = mongoose.model("Booking", bookingSchema);
