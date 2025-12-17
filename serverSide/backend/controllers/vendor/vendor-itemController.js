import fs from "fs";
import path from "path";
import VendorItem from "../../models/vendor/vendor-itemModel.js";

// Helper function to delete image file
const deleteImage = (filename) => {
    try {
        const filePath = path.join("uploads", "vendorItems", filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Image delete error:", err.message);
    }
};

// ADD ITEM
export const addVendorItem = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const newItem = new VendorItem({
            vendorId: req.body.vendorId || null,
            name: req.body.name,
            price: req.body.price,
            discount: req.body.discount,
            description: req.body.description,
            category: req.body.category,
            subcategory: req.body.subcategory,
            foodType: req.body.foodType,
            mealTime: req.body.mealTime,
            cuisine: req.body.cuisine,
            foodModel: req.body.foodModel,
            PhotographyPackage: req.body.PhotographyPackage,
            image: req.file.filename,
        });

        await newItem.save();
        const itemResponse = {
            ...newItem.toObject(),
            mealTime: newItem.mealTime || null,
        };

        res.json({
            success: true,
            message: "Item Added Successfully",
            item: newItem,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET ITEMS
export const getVendorItems = async (req, res) => {
    try {
        const { vendorId } = req.query;

        const filter = {};

        if (vendorId) {
            filter.vendorId = vendorId; // Filter only logged-in vendor's items
        }

        const items = await VendorItem.find(filter).sort({ createdAt: -1 });

        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};



// UPDATE ITEM (With old image delete)
export const updateVendorItem = async (req, res) => {
    try {
        const itemId = req.params.id;

        const item = await VendorItem.findById(itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        // Prepare update data
        const updateData = {
            name: req.body.name,
            price: req.body.price,
            discount: req.body.discount,
            description: req.body.description,
            category: req.body.category,
            subcategory: req.body.subcategory,
            foodType: req.body.foodType,
            foodModel: req.body.foodModel,
            mealTime: req.body.mealTime,
            PhotographyPackage: req.body.PhotographyPackage,
            cuisine: req.body.cuisine,
        };

        // If new image uploaded → delete old one
        if (req.file) {
            deleteImage(item.image);
            updateData.image = req.file.filename;
        }

        const updatedItem = await VendorItem.findByIdAndUpdate(
            itemId,
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            message: "Item updated successfully",
            item: updatedItem,
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE ITEM (Delete image also)
export const deleteVendorItem = async (req, res) => {
    try {
        const itemId = req.params.id;

        const item = await VendorItem.findById(itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        // Delete image file
        deleteImage(item.image);

        // Delete from DB
        await VendorItem.findByIdAndDelete(itemId);

        res.json({
            success: true,
            message: "Item deleted successfully",
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
