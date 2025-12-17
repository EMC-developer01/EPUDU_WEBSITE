import express from "express";
import userRoutes from "./client-userRoutes.js";
import birthdayRoutes from "./client-birthdayRoutes.js";
import clientBilling from "./client-billingRoutes.js";

const router = express.Router();

// Mount routes
router.use("/users", userRoutes);
router.use("/birthday", birthdayRoutes);
router.use("/notifications", clientBilling);

export default router;
