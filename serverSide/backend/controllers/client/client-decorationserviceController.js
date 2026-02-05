import ServiceHistory from "../../models/client/client-servicehistory.js";

/* 🎀 ADD DECORATION BOOKING */
export const addDecorationBooking = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            clientId,
            decoration,
            totalAmount,
            paymentStatus,
            paymentId,
            orderId,
        } = req.body;

        const booking = await ServiceHistory.create({
            serviceType: "Decoration",
            name,
            email,
            phone,
            clientId,
            details: decoration,
            amount: totalAmount,
            paymentStatus,
            paymentId,
            orderId,
        });

        res.status(201).json({
            success: true,
            message: "Decoration booking saved",
            data: booking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to save decoration booking",
            error: error.message,
        });
    }
};

/* 📜 GET DECORATION HISTORY BY CLIENT */
export const getDecorationHistory = async (req, res) => {
    try {
        const { clientId } = req.params;

        const history = await ServiceHistory.find({
            clientId,
            serviceType: "Decoration",
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch decoration history",
            error: error.message,
        });
    }
};
