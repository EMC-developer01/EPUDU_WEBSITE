import nodemailer from "nodemailer";
import Jimp from "jimp"; // <-- ADD THIS
import Vendor from "../../models/vendor/vendor-userModel.js";
import VendorAgreement from "../../models/vendor/vendor-registrationModel.js";
import { generateVendorAgreementPDF } from "../../utils/generateVendorAgreementPDF.js";

// 🔄 Convert ANY image to PNG (jpg, jpeg, webp, etc.)
async function convertToPng(filePath) {
    const image = await Jimp.read(filePath);
    const newPath = filePath + ".png";
    await image.writeAsync(newPath);
    return newPath;
}

export const registerVendorAgreement = async (req, res) => {
    try {
        const { vendorId, location, email } = req.body;

        if (!vendorId || !location || !email) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check signature upload
        let signaturePath = req.file?.path;
        if (!signaturePath) {
            return res.status(400).json({ message: "Vendor signature is required." });
        }

        // 🔄 Convert signature to PNG before saving
        signaturePath = await convertToPng(signaturePath);

        // Save agreement
        const agreement = await VendorAgreement.create({
            vendorId,
            location,
            email,
            vendorSignatureUrl: signaturePath,
        });

        // Update vendor status
        const vendor = await Vendor.findByIdAndUpdate(
            vendorId,
            { isRegistered: true },
            { new: true }
        );

        // Generate PDF
        const pdfPath = await generateVendorAgreementPDF(vendor, agreement, signaturePath);

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

        // Send Email
        await transporter.sendMail({
            from: `"EPUDU EVENTS" <${process.env.EMAIL}>`,
            to: email,
            subject: "Vendor Agreement Registration - EPUDU",
            text: "Dear Vendor, your registration is successful. Attached is your agreement form.",
            attachments: [
                {
                    filename: `EPUDU_Agreement_${vendor.name}.pdf`,
                    path: pdfPath,
                },
            ],
        });

        return res.json({
            message: "Vendor Registration Completed & Email Sent",
            vendor,
            agreement,
        });

    } catch (err) {
        console.error("Vendor Registration Error:", err);
        res.status(500).json({
            message: "Registration error",
            error: err.message,
        });
    }
};
