import mongoose from "mongoose";

const serviceHistorySchema = new mongoose.Schema(
  {
    serviceType: { type: String, required: true }, // Custom Gifts, Events, etc.

    name: String,
    email: String,
    phone: String,
    clientId: String,


    details: Object, // flexible: gifts, events, decorations

    amount: Number,
    paymentStatus: { type: String, default: "Pending" },


    paymentId: String,
    orderId: String,
  },
  { timestamps: true }
);

export default mongoose.model("ServiceHistory", serviceHistorySchema);
