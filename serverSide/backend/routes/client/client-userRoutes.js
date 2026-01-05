// backend/routes/client/client-userRoutes.js
import express from "express";
import { getUserByMobile, addUser, getAllUsers, updateUser, deleteUser } from "../../controllers/client/client-userController.js";
// middleware/upload.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


const router = express.Router();

router.get("/:mobile", getUserByMobile);
router.post("/", addUser);
router.get("/", getAllUsers);
router.put("/:id", upload.single("photo"), updateUser); // ✅ image support
router.delete("/:id", deleteUser);

export default router;
