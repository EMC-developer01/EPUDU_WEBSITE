import express from "express";
import adminUserRoutes from "./admin-userRoutes.js";
import adminNotification from "./admin-notificationRoutes.js"
import adminClientHomepageImages from "./admin-ClientHomepageimages-Routes.js";
import adminClientHomepageServices from "./admin-ClientHomepageService.js";
import adminClientHomepageVideos from "./admin-clientHomepageVideoRoutes.js";
import clientBanner from "./admin-clientBannerRoutes.js";
import clientInvitationCards from "./admin-clientInvitationcardRoutes.js"
const router = express.Router();

// /api/admin/users/...
router.use("/users", adminUserRoutes);
router.use("/notifications", adminNotification)
router.use("/Client-homepages-images", adminClientHomepageImages)
router.use("/client-banner", clientBanner)
router.use("/client-invitation", clientInvitationCards)
router.use("/client-homepage-services", adminClientHomepageServices)
router.use("/client-homepage-videos", adminClientHomepageVideos)
export default router;
