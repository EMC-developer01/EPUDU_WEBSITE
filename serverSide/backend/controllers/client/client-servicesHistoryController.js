import ServiceHistory from "../../models/client/client-servicehistory.js";

/* ADD SERVICE HISTORY */
export const addServiceHistory = async (req, res) => {
    try {
        const cleanClientId = String(req.body.clientId).replace(/^"+|"+$/g, "");

        const history = await ServiceHistory.create({
            ...req.body,
            clientId: cleanClientId,
        });

        res.status(201).json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/* GET ALL SERVICES BY CLIENT */
export const getClientServiceHistory = async (req, res) => {
    try {
        let { clientId } = req.params;
        clientId = String(clientId).replace(/^"+|"+$/g, "");

        const history = await ServiceHistory.find({
            clientId: { $regex: clientId }
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/* UPDATE PAYMENT STATUS */
export const updateServicePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await ServiceHistory.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json({ success: true, updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* DELETE SERVICE HISTORY */
export const deleteServiceHistory = async (req, res) => {
    try {
        const { id } = req.params;

        await ServiceHistory.findByIdAndDelete(id);
        res.json({ success: true, message: "Service deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
