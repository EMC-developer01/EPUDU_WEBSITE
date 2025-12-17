import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((err, success) => {
    console.log("VERIFY RESULT:", err || success);
});

transporter.sendMail({
    from: process.env.EMAIL,
    to: "geethasree1919@gmail.com",
    subject: "Test Mail",
    text: "Mailer is working",
}, (err, info) => {
    console.log("MAIL RESULT:", err || info);
});
