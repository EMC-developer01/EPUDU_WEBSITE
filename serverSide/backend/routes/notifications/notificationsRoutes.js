import express from "express";
import {
    sendVendorNotification,
    sendClientNotification,
    sendAdminNotification
} from "../../controllers/notifications/send-notificationsController.js";

const router = express.Router();

// MATCH FRONTEND CALLS EXACTLY:
router.post("/sendVendorNotification", sendVendorNotification);
router.post("/sendClientNotification", sendClientNotification);
router.post("/sendAdminNotification", sendAdminNotification);

export default router;
