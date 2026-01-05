import mongoose from "mongoose";

const vendorPaymentSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    totalAmount: Number,
    guestCount: Number,
    discountPerGuest: Number,
    totalDiscount: Number,
    payableAmount: Number,
    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" }
}, { timestamps: true });

export default mongoose.model("VendorPayment", vendorPaymentSchema);
