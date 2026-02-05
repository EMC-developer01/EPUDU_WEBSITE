import ServiceHistory from "../../models/client/client-servicehistory.js";

export const addFunActivities = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            clientId,
            entertainment,
            totalAmount,
            paymentStatus,
            paymentId,
            orderId,
        } = req.body;

        if (!clientId || !totalAmount) {
            return res.status(400).json({ success: false, message: "Missing data" });
        }

        const history = await ServiceHistory.create({
            serviceType: "Fun Activities",
            name,
            email,
            phone,
            clientId,
            details: entertainment,
            amount: totalAmount,
            paymentStatus,
            paymentId,
            orderId,
        });

        res.status(201).json({
            success: true,
            message: "Fun activities saved",
            data: history,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
