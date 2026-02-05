import ServiceHistory from "../../models/client/client-servicehistory.js";

export const addPartyPlace = async (req, res) => {
    try {
        const data = req.body;

        await ServiceHistory.create({
            serviceType: "Party Places",

            name: data.name,
            email: data.email,
            phone: data.phone,
            clientId: data.clientId,

            details: data.venue,          // venue object
            amount: data.venue?.cost || 0,

            paymentStatus: data.paymentStatus || "Pending",

            paymentId: data.paymentId,
            orderId: data.orderId,
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};
