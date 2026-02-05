import express from "express";
import multer from "multer";

import { addService, getAllServices, updateService, updateStatus } from "../../controllers/server/admin-clientHomepageService.js";

const router = express.Router();
const storage = multer.diskStorage({
    destination: "uploads/homepageservices",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

router.post("/add", upload.single("image"), addService);
router.get("/all", getAllServices);
router.put("/update/:id", upload.single("image"), updateService);
router.patch("/status/:id", updateStatus);

export default router;
