import express from "express";
import {
    addDecorationBooking,
    getDecorationHistory,
} from "../../controllers/client/client-decorationserviceController.js";

const router = express.Router();

/* 🎀 SAVE DECORATION */
router.post("/add", addDecorationBooking);

/* 📜 GET DECORATION HISTORY */
router.get("/history/:clientId", getDecorationHistory);

export default router;
