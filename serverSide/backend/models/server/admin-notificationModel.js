import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema(
  {
    birthdayId: { type: String, required: true },
    eventType: { type: String, },
    clientName: { type: String,},

    isRead: { type: Boolean, default: false }, // for admin panel
  },
  { timestamps: true }
);

export default mongoose.model("AdminNotification", adminNotificationSchema);