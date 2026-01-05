import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mainRoutes from "./routes/mainRoutes.js";
import twilio from "twilio";
import mongoose from "mongoose";
import axios from "axios";
import { startAutoSync } from "./controllers/vendor/vendor-orderListController.js";

dotenv.config();
connectDB();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));




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

// app.post("/api/send-otp", async (req, res) => {
//   const { mobile, otp } = req.body;
//   const phoneNumber = mobile.startsWith("+91") ? mobile : `+91${mobile}`;

//   try {
//     await twilioClient.messages.create({
//       body: `Your OTP for login is ${otp}`,
//       from: process.env.TWILIO_PHONE,
//       to: phoneNumber,
//     });
//     res.status(200).json({ message: "OTP sent successfully ✅" });
//   } catch (err) {
//     console.error("Twilio Error:", err.message);
//     res.status(500).json({ error: "Failed to send OTP", details: err.message });
//   }
// });

app.post("/api/send-otp", async (req, res) => {
  const { mobile } = req.body;

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${mobile}/AUTOGEN/SLVTECH`
    );

    res.json({
      success: true,
      sessionId: response.data.Details, // IMPORTANT
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});
startAutoSync(50000); // auto sync every 30s

app.post("/api/verify-otp", async (req, res) => {
  const { otp, sessionId } = req.body;

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    if (response.data.Status === "Success") {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "OTP verification failed" });
  }
});



app.get("/", (req, res) => res.send("🎯 EPUDU API Server Running Successfully!"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
