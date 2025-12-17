import express from "express";
import { sendClientBill } from "../../controllers/client/client-billingController.js";

const router = express.Router();

router.post("/client-bill", sendClientBill);

export default router;
