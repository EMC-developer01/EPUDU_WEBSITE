import twilio from "twilio";
import SMSLog from "../../models/notifications/sms-models.js";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendClientSMS = async (req, res) => {
  try {
    const { birthdayId, clientPhone } = req.body;

    if (!clientPhone) {
      return res.status(400).json({ success: false, message: "Client phone number missing" });
    }

    const messageText = `Your payment is successfully received. Your event booking (ID: ${birthdayId}) is now confirmed. Thank you!`;

    const sms = await client.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE, // Twilio number
      to: clientPhone,
    });

    await SMSLog.create({
      birthdayId,
      clientPhone,
      message: messageText,
      status: "sent",
    });

    return res.status(200).json({
      success: true,
      message: "SMS sent successfully to client",
      sid: sms.sid,
    });

  } catch (error) {
    console.error("SMS Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send SMS",
      error: error.message,
    });
  }
};
