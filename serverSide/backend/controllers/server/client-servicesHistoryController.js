import ServiceHistory from "../../models/client/client-servicehistory.js";

/* ADD SERVICE HISTORY */
export const addServiceHistory = async (req, res) => {
    try {
        const history = await ServiceHistory.create(req.body);
        res.status(201).json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* GET ALL SERVICES BY CLIENT */
export const getClientServiceHistory = async (req, res) => {
    try {
        const { clientId } = req.params;

        const history = await ServiceHistory.find({ clientId })
            .sort({ createdAt: -1 });

        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
