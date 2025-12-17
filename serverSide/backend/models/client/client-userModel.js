import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
 name: { type: String, default: "Guest" },
  mobile: { type: String, required: true, unique: true },
});

export default mongoose.model("User", userSchema);
