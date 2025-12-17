import express from "express";
import adminUserRoutes from "./admin-userRoutes.js";
import adminNotification from "./admin-notificationRoutes.js"
import adminClientHomepageImages from "../../routes/server/admin-ClientHomepageimages-Routes.js";
const router = express.Router();

// /api/admin/users/...
router.use("/users", adminUserRoutes);
router.use("/notifications", adminNotification)
router.use("/Client-homepages-images", adminClientHomepageImages)

export default router;
