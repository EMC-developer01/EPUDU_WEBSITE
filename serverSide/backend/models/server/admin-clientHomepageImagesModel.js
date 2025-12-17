import mongoose from "mongoose";

const clientHomepageImageSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        imageName: { type: String, required: true },
        eventName: { type: String, required: true },
        description: String,
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model(
    "ClientHomepageImage",
    clientHomepageImageSchema
);
