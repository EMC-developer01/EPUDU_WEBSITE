import express from "express";
import vendorUsers from "./vendor-userRoutes.js";
import vendorRegistration from "./vendor-registrationRoutes.js"
import vendorItems from "./vendor-itemRoutes.js"
import ordersList from "./vendor-orderListRoutes.js"
const router = express.Router();

// /api/admin/users/...
router.use("/users", vendorUsers);
router.use("/agreement", vendorRegistration);
router.use("/items", vendorItems);
router.use("/orders", ordersList)

export default router;
