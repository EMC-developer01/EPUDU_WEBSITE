import nodemailer from "nodemailer";

let transporter;

export const initMailer = () => {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });

    transporter.verify((err) => {
        if (err) {
            console.error("❌ Email transporter failed:", err.message);
        } else {
            console.log("✅ Email transporter ready");
        }
    });
};

export const sendMail = async (options) => {
    if (!transporter) return;
    try {
        await transporter.sendMail(options);
    } catch (err) {
        console.error("❌ Mail send error:", err.message);
    }
};
