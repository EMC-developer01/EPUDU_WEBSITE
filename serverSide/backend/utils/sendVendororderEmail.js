import nodemailer from "nodemailer";

export const sendVendororderEmail = async (to, subject, message) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,     // your Gmail
        pass: process.env.EMAIL_PASS,     // App password
      },
    });

    // Email content
    const mailOptions = {
      from: `"Your Event Team" <${process.env.EMAIL}>`,
      to,
      subject,
      text: message,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("📩 Vendor Email Sent To:", to);
    return true;
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    return false;
  }
};
