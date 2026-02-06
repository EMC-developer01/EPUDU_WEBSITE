import express from "express";
import {
    addServiceHistory,
    getClientServiceHistory,
    updateServicePayment,
    deleteServiceHistory,
} from "../../controllers/client/client-servicesHistoryController.js";

const router = express.Router();

/* CREATE SERVICE HISTORY */
router.post("/add", addServiceHistory);

/* GET SERVICES BY CLIENT */
router.get("/history/:clientId", getClientServiceHistory);

/* UPDATE PAYMENT / STATUS */
router.put("/update/:id", updateServicePayment);

/* DELETE SERVICE */
router.delete("/delete/:id", deleteServiceHistory);

export default router;
