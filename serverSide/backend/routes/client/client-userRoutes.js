// backend/routes/client/client-userRoutes.js
import express from "express";
import { getUserByMobile, addUser, getAllUsers, updateUser, deleteUser } from "../../controllers/client/client-userController.js";

const router = express.Router();

router.get("/:mobile", getUserByMobile);
router.post("/", addUser);
router.get("/", getAllUsers);
router.put("/:id", updateUser); 
router.delete("/:id", deleteUser);


export default router;
