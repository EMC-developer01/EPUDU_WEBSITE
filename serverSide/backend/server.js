import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mainRoutes from "./routes/mainRoutes.js";
import mongoose from "mongoose";
import axios from "axios";
import { startAutoSync } from "./controllers/vendor/vendor-orderListController.js";
import path from "path";
import { fileURLToPath } from "url";
import { initMailer } from "./testMail.js";

dotenv.config();
connectDB();
initMailer()

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const otpStore = new Map(); // mobile -> otp

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://epudu.com"
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }))

// CLIENT
app.use("/client", express.static(path.join(__dirname, "../clientSide/client/dist")));

// ADMIN
app.use("/admin", express.static(path.join(__dirname, "../clientSide/admin/dist")));

// VENDOR
app.use("/vendor", express.static(path.join(__dirname, "../clientSide/vendor/dist")));

// ✅ Mount all main routes
app.use("/api", mainRoutes);
app.use("/uploads", express.static("uploads"));


// React fallback
app.get(/^\/client\/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../clientSide/client/dist/index.html")
  );
});

app.get(/^\/admin\/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../clientSide/admin/dist/index.html")
  );
});

app.get(/^\/vendor\/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../clientSide/vendor/dist/index.html")
  );
});

// app.post("/api/send-otp", async (req, res) => {
//   const { mobile } = req.body;

//   if (!/^[6-9]\d{9}$/.test(mobile)) {
//     return res.status(400).json({ message: "Invalid mobile number" });
//   }
//   const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

//   try {
//     const response = await axios.get(
//       `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${mobile}/AUTOGEN/SLVTECH`
//     );

//     res.json({
//       success: true,
//       sessionId: response.data.Details, // IMPORTANT
//     });
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ message: "Failed to send OTP" });
//   }
// });
startAutoSync(30000); // auto sync every 60s
// app.post("/api/verify-otp", async (req, res) => {
//   const { otp, sessionId } = req.body;

//   try {
//     const response = await axios.get(
//       `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
//     );

//     if (response.data.Status === "Success") {
//       res.json({ verified: true });
//     } else {
//       res.status(400).json({ verified: false });
//     }
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ message: "OTP verification failed" });
//   }
// });

app.post("/api/send-otp", (req, res) => {
  const { mobile } = req.body;

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  otpStore.set(mobile, otp);

  // auto-expire OTP in 2 minutes
  setTimeout(() => otpStore.delete(mobile), 2 * 60 * 1000);

  res.json({
    success: true,
    otp, // ⚠️ DEV ONLY
  });
});

app.post("/api/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;

  const savedOtp = otpStore.get(mobile);

  if (savedOtp && savedOtp === otp) {
    otpStore.delete(mobile);
    return res.json({ verified: true });
  }

  res.status(400).json({ verified: false });
});

app.get("/get", (req, res) => {
  res.send("🎯 EPUDU API Server Running Successfully!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
