import express from "express";
import {
  addPhotographyBooking,
  getPhotographyHistory,
} from "../../controllers/client/client-photographyController.js";

const router = express.Router();

/* 📸 SAVE PHOTOGRAPHY BOOKING */
router.post("/add", addPhotographyBooking);

/* 📜 GET PHOTOGRAPHY HISTORY */
router.get("/history/:clientId", getPhotographyHistory);

export default router;
