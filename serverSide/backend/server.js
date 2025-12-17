import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mainRoutes from "./routes/mainRoutes.js";
import twilio from "twilio";
import mongoose from "mongoose";
import { startAutoSync } from "./controllers/vendor/vendor-orderListController.js";


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));


dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }))

// ✅ Mount all main routes
app.use("/api", mainRoutes);
app.use("/uploads", express.static("uploads"));

// ✅ OTP Route
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID);
console.log("Razorpay Secret:", process.env.RAZORPAY_SECRET);

app.post("/api/send-otp", async (req, res) => {
  const { mobile, otp } = req.body;
  const phoneNumber = mobile.startsWith("+91") ? mobile : `+91${mobile}`;

  try {
    await twilioClient.messages.create({
      body: `Your OTP for login is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber,
    });
    res.status(200).json({ message: "OTP sent successfully ✅" });
  } catch (err) {
    console.error("Twilio Error:", err.message);
    res.status(500).json({ error: "Failed to send OTP", details: err.message });
  }
});
startAutoSync(30000); // auto sync every 30s


app.get("/", (req, res) => res.send("🎯 EPUDU API Server Running Successfully!"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
