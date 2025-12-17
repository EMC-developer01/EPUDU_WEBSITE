import express from "express";
import multer from "multer";
import {
    getVendorOrders,
    syncVendorOrdersFromBirthdays,
    updateOrderStatus,
    updatePaymentStatus,
} from "../../controllers/vendor/vendor-orderListController.js";

const router = express.Router();

/**
 * Sync vendor orders from birthday API
 * POST /api/vendor-orders/sync
 */
router.post("/sync", syncVendorOrdersFromBirthdays);

/**
 * Get vendor orders
 * GET /api/vendor-orders
 */
router.get("/", getVendorOrders);

/**
 * Update order status (vendor)
 * PATCH /api/vendor-orders/:orderId/status
 */
router.patch("/:orderId/status", updateOrderStatus);

/**
 * Update payment status (admin)
 * PATCH /api/vendor-orders/:orderId/payment
 */
router.patch("/:orderId/payment", updatePaymentStatus);

export default router;
