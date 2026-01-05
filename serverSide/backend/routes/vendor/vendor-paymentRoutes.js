import express from "express";
import {
    createVendorPayment,
    getAllVendorPayments,
    markAsPaid
} from "../../controllers/vendor/vendor-paymentController.js";

const router = express.Router();

router.post("/create", createVendorPayment);
router.get("/all", getAllVendorPayments);
router.put("/pay/:id", markAsPaid);

export default router;
