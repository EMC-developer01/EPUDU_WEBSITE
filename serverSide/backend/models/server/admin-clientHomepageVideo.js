import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        video: { type: String, required: true },
        title: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("ClientHomepageVideo", schema);
