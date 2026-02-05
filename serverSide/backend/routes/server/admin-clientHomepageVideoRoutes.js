import express from "express";
import multer from "multer";
import {
    addVideo,
    getAllVideos,
    updateVideo,
    updateStatus,
} from "../../controllers/server/admin-clienthomepageController.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/homepageVideos",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

router.post("/add", upload.single("video"), addVideo);
router.get("/all", getAllVideos);
router.put("/update/:id", upload.single("video"), updateVideo);
router.patch("/status/:id", updateStatus);

export default router;
