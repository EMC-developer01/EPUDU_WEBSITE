import express from "express";
import {
    addBanner,
    getAllBanners,
    updateBanner,
    toggleBannerStatus,
} from "../../controllers/server/admin-clientBannerController.js";

/* ---------------- MULTER SETUP ---------------- */
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/banners"); // 👈 separate folder for banners
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });



const router = express.Router();

/* ---------------- ROUTES ---------------- */
router.post("/add", addBanner);
router.get("/all", getAllBanners);
router.put("/update/:id", updateBanner);
router.patch("/status/:id", toggleBannerStatus);

export default router;
