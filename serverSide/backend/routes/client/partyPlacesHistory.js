import express from "express";
import { addPartyPlace } from "../../controllers/client/client-partPlacesHistory.js";

const router = express.Router();

router.post("/add", addPartyPlace);

export default router;
