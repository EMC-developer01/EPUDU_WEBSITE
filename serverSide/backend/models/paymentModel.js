import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number, // Store in INR (not paise)
    status: { type: String, default: "success" },
    date: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);
