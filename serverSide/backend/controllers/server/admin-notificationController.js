import AdminNotification from "../../models/server/admin-notificationModel.js";
import nodemailer from "nodemailer";

export const sendAdminNotification = async (req, res) => {
  try {
    const { birthdayId, eventType, clientName } = req.body;

    if (!birthdayId ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 1️⃣ Save Notification in DB
    const notification = await AdminNotification.create({
      birthdayId,
      eventType,
      clientName,
    });

    // 2️⃣ Send Email to Admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL, // send mail to admin itself
      subject: `New Event Notification - ${eventType}`,
      html: `
        <h3>New Event Notification</h3>
        <p><strong>Client Name:</strong> ${clientName}</p>
        <p><strong>Event Type:</strong> ${eventType}</p>
        <p><strong>Birthday ID:</strong> ${birthdayId}</p>
        <br/>
        <p>Check Admin Panel for full details.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Notification sent to admin successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Admin Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// 3️⃣ Fetch All Notifications for Admin Panel
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Admin Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

// 4️⃣ Mark Notification as Read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await AdminNotification.findByIdAndUpdate(id, { isRead: true });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update",
    });
  }
};
