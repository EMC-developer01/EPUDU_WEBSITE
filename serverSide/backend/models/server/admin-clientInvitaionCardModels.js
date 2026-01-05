import mongoose from "mongoose";

const clientInvitationCardSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        cardName: { type: String, required: true },
        eventName: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("ClientInvitationCard", clientInvitationCardSchema);
