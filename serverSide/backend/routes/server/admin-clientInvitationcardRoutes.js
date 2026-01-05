import express from "express";
import multer from "multer";
import {
    addCard,
    getAllCards,
    updateCard,
    toggleCardStatus,
} from "../../controllers/server/admin-ClientInvitationCardController.js";

/* ---------------- MULTER ---------------- */
const storage = multer.diskStorage({
    destination: "uploads/invitationCards",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/add", upload.single("image"), addCard);
router.get("/all", getAllCards);
router.put("/update/:id", upload.single("image"), updateCard);
router.patch("/status/:id", toggleCardStatus);

export default router;
