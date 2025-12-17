import VendorUser from "../../models/vendor/vendor-userModel.js";

// ✅ Get vendor by mobile, create if not exists
export const getVendorByMobile = async (req, res) => {
    try {
        const { mobile } = req.params;
        const vendor = await vendorUsers.findOne({ mobile });

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({ vendor });
    } catch (err) {
        console.error("❌ Error fetching vendor:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// ✅ Add new vendor
export const addVendor = async (req, res) => {
    try {
        const { name, mobile,mail, shopName, vendorType, } = req.body;
        console.log("📩 Incoming data:", mobile);

        if (!mobile) return res.status(400).json({ message: "Mobile is required" });

        let vendor = await vendorUsers.findOne({ mobile });
        if (vendor) return res.status(200).json({ vendor, message: "Vendor already exists" });

        vendor = new VendorUser({
            name: name || "Vendor",
            mobile,
            mail: mail || "geethasree1919@gmail.com",
            shopName,
            vendorType,
        });

        await vendor.save();
        res.status(201).json({ vendor, message: "Vendor created successfully" });
    } catch (err) {
        console.error("Error creating vendor:", err);
        res.status(500).json({ message: "Server error while creating vendor" });
    }
};

// ✅ Get all vendors
export const getAllVendors = async (req, res) => {
    try {
        const vendors = await vendorUsers.find().sort({ createdAt: -1 });
        res.status(200).json(vendors);
    } catch (err) {
        console.error("Error fetching vendors:", err);
        res.status(500).json({ message: "Server error fetching vendors" });
    }
};

// ✅ Update vendor
export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedVendor = await vendorUsers.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedVendor) return res.status(404).json({ message: "Vendor not found" });
        res.status(200).json({ message: "Vendor updated successfully", vendor: updatedVendor });
    } catch (err) {
        console.error("Error updating vendor:", err);
        res.status(500).json({ message: "Server error while updating vendor" });
    }
};

// ✅ Delete vendor
export const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVendor = await vendorUsers.findByIdAndDelete(id);

        if (!deletedVendor) return res.status(404).json({ message: "Vendor not found" });
        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (err) {
        console.error("Error deleting vendor:", err);
        res.status(500).json({ message: "Server error while deleting vendor" });
    }
};
