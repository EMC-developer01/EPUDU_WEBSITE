import express from "express";
import {
    sendAdminNotification,
    getAdminNotifications,
    markAsRead,
} from "../../controllers/server/admin-notificationController.js";

const router = express.Router();

router.post("/sendAdminNotification", sendAdminNotification);
router.get("/all", getAdminNotifications);
router.put("/mark-read/:id", markAsRead);

export default router;
