// models/client/client-userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Guest" },
    mobile: { type: String, required: true, unique: true },
    mail: { type: String },
    photo: { type: String } // ✅ profile photo path
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
