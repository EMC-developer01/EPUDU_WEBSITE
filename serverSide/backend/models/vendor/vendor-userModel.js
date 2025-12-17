import mongoose from "mongoose";

const vendorUserSchema = new mongoose.Schema({
    name: { type: String, default: "Vendor" },
    mobile: { type: String, required: true, unique: true },
    mail: { type: String, required: true, },
    shopName: { type: String, required: true },
    vendorType: { type: String, required: true }, // ex: Decorator, Catering, Photography, etc.
    isRegistered: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("VendorUser", vendorUserSchema);
