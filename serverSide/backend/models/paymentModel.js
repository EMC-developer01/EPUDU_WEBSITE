import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number, // Store in INR (not paise)
    clientName: String,
    eventId: mongoose.Schema.Types.ObjectId,
    eventType: String,
    paymentStatus: String,
    bookingStatus: String,
    status: { type: String, },
    date: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);