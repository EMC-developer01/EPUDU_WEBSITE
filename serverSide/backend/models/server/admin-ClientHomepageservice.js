import mongoose from "mongoose";

const clientHomepageServiceSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        title: { type: String, required: true },
        desc: { type: String, required: true },
        link: { type: String, required: true },
        btn: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model(
    "ClientHomepageService",
    clientHomepageServiceSchema
);
