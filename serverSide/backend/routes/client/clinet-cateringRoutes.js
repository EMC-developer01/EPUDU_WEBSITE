import express from "express";
import { addCateringService, getCateringHistory } from "../../controllers/client/client-cateringController.js";


const router = express.Router();

router.post("/add", addCateringService);
router.get("/history/:clientId", getCateringHistory);

export default router;
