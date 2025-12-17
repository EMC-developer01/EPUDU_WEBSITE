import nodemailer from "nodemailer";


// -------------------------------------------
// 🔥 SEND TO ADMIN
// -------------------------------------------
export const sendAdminNotification = async (req, res) => {
    try {
        const { birthdayId, eventType, clientName } = req.body;

        if (!birthdayId) {
            return res.status(400).json({ message: "birthdayId is required" });
        }

        const ADMIN_PHONE = process.env.ADMIN_PHONE || "9502554901";
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@epudu.com";

        const message = `
A new event has been booked!

Client Name: ${clientName || "N/A"}
Event Type: ${eventType || "Birthday"}
Booking ID: ${birthdayId}

Please check the admin panel for more details.
`;

        // SEND EMAIL
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: ADMIN_EMAIL,
            subject: "New Event Booked ✔",
            text: message,
        });

        console.log("📩 Email sent to Admin:", ADMIN_EMAIL);
        console.log("📲 SMS sent to Admin:", ADMIN_PHONE);

        return res.json({
            success: true,
            message: "Admin notified successfully",
        });

    } catch (err) {
        console.error("Admin Notification Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to send admin notification",
            error: err.message,
        });
    }
};



// -------------------------------------------
// 🔥 SEND TO VENDORS
// -------------------------------------------
export const sendVendorNotification = async (req, res) => {
    try {
        const { birthdayId } = req.body;
        let items

        if (!birthdayId || !items) {
            return res.status(400).json({
                success: false,
                message: "birthdayId and items are required"
            });
        }

        // Sending Email to VENDORS EXAMPLE
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
        });

        for (const item of items) {
            if (!item.vendorEmail) continue;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: item.vendorEmail,
                subject: "New Event Booking — Vendor Notification",
                text: `You have been selected for an event. Booking ID: ${birthdayId}`
            });
        }

        return res.json({
            success: true,
            message: "Vendor notifications sent successfully",
        });

    } catch (err) {
        console.error("Vendor Notification Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to send vendor notifications",
            error: err.message,
        });
    }
};



// -------------------------------------------
// 🔥 SEND TO CLIENT
// -------------------------------------------
export const sendClientNotification = async (req, res) => {
    try {
        const { phone, email, name } = req.body;

        if (!phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Client phone & email are required",
            });
        }

        // EMAIL TO CLIENT
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🎉 Booking Confirmed!",
            text: `Hi ${name}, your event booking has been confirmed!`,
        });

        console.log("📩 Email sent to Client:", email);
        console.log("📲 SMS sent to Client:", phone);

        res.json({
            success: true,
            message: "Client notified successfully",
        });

    } catch (err) {
        console.error("Client Notification Error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to send client notification",
            error: err.message,
        });
    }
};
