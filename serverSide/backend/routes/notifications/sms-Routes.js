import express from "express";
import { sendClientSMS } from "../../controllers/notifications/sms-controller.js";

const router = express.Router();

router.post("/sendClient", sendClientSMS);

export default router;
