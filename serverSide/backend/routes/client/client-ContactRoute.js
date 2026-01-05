import express from "express";
import { sendContactMail } from "../../controllers/client/client-contactController.js";

const router = express.Router();

router.post("/send", sendContactMail);

export default router;
