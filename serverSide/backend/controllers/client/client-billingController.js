import nodemailer from "nodemailer";
import ClientBill from "../../models/client/client-billModel.js";
import Client from "../../models/client/client-userModel.js";
import { generateClientBillPDF } from "../../utils/generateClientBillPDF.js";

export const sendClientBill = async (req, res) => {
    try {
        const { clientId, eventName, advanceAmount, totalAmount, email } = req.body;

        if (!clientId || !eventName || advanceAmount == null || totalAmount === null || !email) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // get client
        const client = await Client.findById(clientId);
        if (!client) return res.status(404).json({ message: "Client not found" });

        // Generate PDF Bill
        const pdfPath = await generateClientBillPDF({
            client,
            eventName,
            advanceAmount,
            totalAmount,
        });

        // Save bill in DB
        const bill = await ClientBill.create({
            clientId,
            eventName,
            advanceAmount,
            totalAmount,
            billPdfUrl: pdfPath,
        });

        // Email Setup
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send Email to Client
        await transporter.sendMail({
            from: `"EPUDU EVENTS" <${process.env.EMAIL}>`,
            to: email,
            subject: "Your Advance Payment Bill - EPUDU EVENTS",
            text: `Dear ${client.name}, thank you for your advance payment.`,
            attachments: [
                {
                    filename: `EPUDU_Bill_${client.name}.pdf`,
                    path: pdfPath,
                },
            ],
        });

        return res.json({
            message: "Client bill generated & sent successfully",
            bill,
        });

    } catch (err) {
        console.error("Client Billing Error:", err);
        res.status(500).json({
            message: "Billing error",
            error: err.message,
        });
    }
};
