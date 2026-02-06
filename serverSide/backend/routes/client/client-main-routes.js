import express from "express";
import userRoutes from "./client-userRoutes.js";
import birthdayRoutes from "./client-birthdayRoutes.js";
import clientBilling from "./client-billingRoutes.js";
import contactRoutes from "./client-ContactRoute.js";
import customGifts from "./client-customGiftsRoutes.js";
import partPlaces from "./partyPlacesHistory.js";
import funActivities from "./client-FunActivitiesRoutes.js";
import decorservices from "./client-decorservicesRoutes.js";
import photography from "./client-photographyRoutes.js";
import catering from "./clinet-cateringRoutes.js";
import servicesHistory from "./client-servicesHistory.js";

const router = express.Router();

// Mount routes
router.use("/users", userRoutes);
router.use("/birthday", birthdayRoutes);
router.use("/notifications", clientBilling);
router.use("/contact", contactRoutes)
router.use("/party-places", partPlaces)
router.use("/custom-gifts", customGifts)
router.use("/fun-activities", funActivities)
router.use("/decoration", decorservices)
router.use("/photography", photography)
router.use("/catering", catering)
router.use("/services", servicesHistory)


export default router;