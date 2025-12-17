import mongoose from "mongoose";

const vendorItemSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: false, // If you want, make this true to link items to vendor
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            required: true,
        },
        subcategory: {
            type: String,
            required: true,
        },
        foodType: {
            type: String,
        },
        mealTime: {
            type: String,
        },
        cuisine: {
            type: String,
        },
        image: {
            type: String, // Stored file name
            required: true,
        },
        foodModel: {
            type: String,
        },
        gamesAges: {
            type: String,
        },
        PhotographyPackage: {
            type: String,
        }
    },
    { timestamps: true }
);

export default mongoose.model("VendorItem", vendorItemSchema);
