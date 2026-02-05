import ServiceHistory from "../../models/client/client-servicehistory.js";

export const addCustomGift = async (req, res) => {
  try {
    const data = req.body;

    await ServiceHistory.create({
      serviceType: "Custom Gifts",
      name: data.name,
      email: data.email,
      phone: data.phone,
      clientId: data.clientId,
      details: data.returnGifts,
      amount: data.returnGifts.total,
      paymentStatus: data.paymentStatus,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
