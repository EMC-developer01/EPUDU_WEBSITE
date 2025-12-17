// models/vendor/vendor-orderListModel.js
import mongoose from "mongoose";

const vendorOrderItemSchema = new mongoose.Schema(
    {
        // Core references
        clientId: { type: String, required: true },    // store as string to avoid ObjectId/string mismatch
        birthdayId: { type: String, required: true },  // store as string for consistency

        // client & event info
        celebrantName: { type: String, default: "" },
        eventType: { type: String, default: "" },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        eventDate: { type: String, default: "" },
        eventTime: { type: String, default: "" },
        guestCount: { type: String, default: "" },

        // venue
        venueName: { type: String, default: "" },
        venueAddress: { type: String, default: "" },
        venueCity: { type: String, default: "" },

        // categorization
        category: { type: String, default: "" },    // e.g. decoration
        subcategory: { type: String, default: "" }, // e.g. stageDesign

        // item details
        itemId: { type: String, default: "" },    // original item id (string)
        vendorId: { type: String, default: "" },  // vendor id (string)
        itemName: { type: String, default: "" },
        price: { type: Number, default: 0 },

        // statuses
        status: {
            type: String,
            enum: ["Pending", "Completed", "CancelledByVendor", "CancelledByClient"],
            default: "Pending",
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Completed", "Cancelled", "Advance Paid", "Full Paid"],
            default: "Pending",
        },

        // optional helper
        sourceHash: { type: String, default: "" },
    },
    { timestamps: true }
);

/**
 * Create composite unique index matching sync's upsert filter.
 * Important: we index on string fields (we store birthdayId/itemId/vendorId as strings above).
 */
vendorOrderItemSchema.index(
    { birthdayId: 1, itemId: 1, vendorId: 1, category: 1, subcategory: 1 },
    { unique: true, background: true }
);

const VendorOrderList = mongoose.model("VendorOrderList", vendorOrderItemSchema);
export default VendorOrderList;
