import express from "express";
import { adminLogin } from "../../controllers/server/admin-userController.js";

const router = express.Router();

// POST /api/admin/users/login
router.post("/login", adminLogin);

export default router;
