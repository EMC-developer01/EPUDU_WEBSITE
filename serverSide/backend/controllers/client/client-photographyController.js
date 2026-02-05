import ServiceHistory from "../../models/client/client-servicehistory.js";

/* 📸 ADD PHOTOGRAPHY BOOKING */
export const addPhotographyBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      clientId,
      photography,
      totalAmount,
      paymentStatus,
      paymentId,
      orderId,
    } = req.body;

    const booking = await ServiceHistory.create({
      serviceType: "Photography",
      name,
      email,
      phone,
      clientId,
      details: photography,
      amount: totalAmount,
      paymentStatus,
      paymentId,
      orderId,
    });

    res.status(201).json({
      success: true,
      message: "Photography booking saved",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save photography booking",
      error: error.message,
    });
  }
};

/* 📜 GET PHOTOGRAPHY HISTORY BY CLIENT */
export const getPhotographyHistory = async (req, res) => {
  try {
    const { clientId } = req.params;

    const history = await ServiceHistory.find({
      clientId,
      serviceType: "Photography",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch photography history",
      error: error.message,
    });
  }
};
