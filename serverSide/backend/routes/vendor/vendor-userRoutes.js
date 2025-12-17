// backend/routes/vendor/vendor-userRoutes.js
import express from "express";
import {
    getVendorByMobile,
    addVendor,
    getAllVendors,
    updateVendor,
    deleteVendor
} from "../../controllers/vendor/vendor-userController.js";

const router = express.Router();

router.get("/:mobile", getVendorByMobile);
router.post("/", addVendor);
router.get("/", getAllVendors);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

export default router;
