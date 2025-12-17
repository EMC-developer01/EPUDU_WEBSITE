import mongoose from "mongoose";

const VendorAgreementSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    location: String,
    email: String,
    vendorSignatureUrl: String,
    adminSignatureUrl: { type: String, default: "/uploads/admin-sign.png" },
    agreementDate: { type: Date, default: Date.now }
});

export default mongoose.model("VendorAgreement", VendorAgreementSchema);
