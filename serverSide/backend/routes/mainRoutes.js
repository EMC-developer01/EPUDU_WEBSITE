import express from "express";
import clientRoutes from "./client/client-main-routes.js";
import paymentRoutes from "./paymentRoutes.js";
import serverRoutes from "./server/server-main-routes.js";
import vendorRoutes from "./vendor/vendor-main-routes.js";
import sendnotifications from "./notifications/notificationsRoutes.js"
import smsRoutes from "./notifications/sms-Routes.js";

const router = express.Router();
router.use("/client", clientRoutes);
router.use("/payment", paymentRoutes);
router.use("/admin", serverRoutes);
router.use("/vendor", vendorRoutes);


export default router;
