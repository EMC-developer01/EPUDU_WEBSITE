import express from "express";
import multer from "multer";
import { addVendorItem, deleteVendorItem, getVendorItems, updateVendorItem } from "../../controllers/vendor/vendor-itemController.js";

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
    destination: "uploads/vendorItems",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// ADD ITEM
router.post("/additem", upload.single("image"), addVendorItem);

// GET ALL ITEMS
router.get("/getitems", getVendorItems);

// UPDATE ITEM
router.put("/update/:id", upload.single("image"), updateVendorItem);

// DELETE ITEM
router.delete("/delete/:id", deleteVendorItem);

export default router;
