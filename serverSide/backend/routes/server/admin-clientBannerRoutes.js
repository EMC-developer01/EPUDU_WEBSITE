import express from "express";
import multer from "multer";
import {
    addBanner,
    getAllBanners,
    updateBanner,
    toggleBannerStatus,
} from "../../controllers/server/admin-clientBannerController.js";

/* ---------------- MULTER SETUP ---------------- */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/banners"); // 👈 separate folder for banners
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

const router = express.Router();

/* ---------------- ROUTES ---------------- */
router.post("/add", upload.single("image"), addBanner);
router.get("/all", getAllBanners);
router.put("/update/:id", upload.single("image"), updateBanner);
router.patch("/status/:id", toggleBannerStatus);

export default router;
