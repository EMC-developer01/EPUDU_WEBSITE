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
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();
connectDB();
initMailer()

const otpStore = new Map(); 

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
    "https://epudu.com",
    "https://www.epudu.com",
    "http://43.205.46.167",
    "http://43.205.46.167",
  ],

  credentials: true
}));
app.options(/.*/, cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }))

app.use("/api", uploadRoutes);

app.use(
  "/uploads/homepageVideos",
  express.static("uploads/homepageVideos")
);
app.use("/uploads", express.static("uploads"));
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

startAutoSync(30000);

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
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));