import express from "express";
import multer from "multer";
import { registerVendorAgreement } from "../../controllers/vendor/vendor-registrationController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/register", upload.single("vendorSignature"), registerVendorAgreement);

export default router;
