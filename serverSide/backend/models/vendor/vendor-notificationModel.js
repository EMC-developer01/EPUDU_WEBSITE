import mongoose from "mongoose";

const vendorNotificationSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    orderId: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("VendorNotification", vendorNotificationSchema);
