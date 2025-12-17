import express from "express";
import { AdminUpdate, createBirthday, deleteEvent, getAllBirthdays, getBirthdayByorderId, getBirthdaysByUser, getEventStatusSummary, updatePaymentStatus, updateSteps } from "../../controllers/client/client-birthdayController.js";

const router = express.Router();

// ➕ Save birthday event
router.post("/create", createBirthday);

router.get("/order/:id", getBirthdayByorderId);

// 🔍 Get all birthdays by userId
router.get("/user/:userId", getBirthdaysByUser);
router.put("/update/admin/:id", AdminUpdate);
router.put("/update/:id", updatePaymentStatus);
router.put("/update-step", updateSteps);
router.delete("/delete/:id", deleteEvent);
router.get("/all", getAllBirthdays);
router.get("/status/summary", getEventStatusSummary);
export default router;
