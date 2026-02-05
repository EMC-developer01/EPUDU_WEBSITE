import express from "express";
import { addCustomGift } from "../../controllers/client/client-CustomGiftsHistory.js";

const router = express.Router();

router.post("/add", addCustomGift);

export default router;
