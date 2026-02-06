import ServiceHistory from "../../models/client/client-servicehistory.js";

export const addCateringService = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            clientId,
            foodArrangements,
            totalAmount,
            paymentStatus,
            paymentId,
            orderId,
        } = req.body;

        const service = await ServiceHistory.create({
            serviceType: "Catering",
            name,
            email,
            phone,
            clientId,
            details: foodArrangements,
            amount: totalAmount,
            paymentStatus,
            paymentId,
            orderId,
        });

        res.status(201).json({
            success: true,
            message: "Catering service saved",
            service,
        });
    } catch (error) {
        console.error("Catering Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save catering service",
        });
    }
};

/* 📜 GET CATERING HISTORY BY CLIENT */
export const getCateringHistory = async (req, res) => {
    try {
        const { clientId } = req.params;

        const history = await ServiceHistory.find({
            clientId,
            serviceType: "Catering",
        }).sort({ createdAt: -1 });

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: "Fetch failed" });
    }
};
