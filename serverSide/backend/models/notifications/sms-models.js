import mongoose from "mongoose";

const smsLogSchema = new mongoose.Schema(
    {
        birthdayId: { type: String, required: true },
        clientPhone: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, default: "sent" },
    },
    { timestamps: true }
);

export default mongoose.model("SMSLog", smsLogSchema);
