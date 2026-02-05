import express from "express";
import { addFunActivities } from "../../controllers/client/client-funActivitiesController.js";

const router = express.Router();

router.post("/add", addFunActivities);

export default router;
