import express from "express";
import multer from "multer";
import {
    createImage,
    getImages,
    updateImage,
    toggleStatus,
} from "../../controllers/server/admin-ClientHomepageimages-Controller.js";

const router = express.Router();

/* ---------------- MULTER SETUP ---------------- */
const storage = multer.diskStorage({
    destination: "uploads/homepageImages",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

/* ---------------- ROUTES ---------------- */

// ADD IMAGE
router.post("/add", upload.single("image"), createImage);

// GET ALL IMAGES
router.get("/all", getImages);

// UPDATE IMAGE
router.put("/update/:id", upload.single("image"), updateImage);

// ACTIVATE / DEACTIVATE
router.patch("/status/:id", toggleStatus);

export default router;
