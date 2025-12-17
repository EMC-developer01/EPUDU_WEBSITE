import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import fs from "fs";

export const generateVendorAgreementPDF = async (vendor, agreement) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // 🌟 LIGHT YELLOW BOND PAPER BACKGROUND
    page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(1, 0.98, 0.88), // light creamy-yellow
    });

    // 🌟 BORDER AROUND PAGE
    page.drawRectangle({
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        borderWidth: 2,
        color: rgb(1, 0.98, 0.88),
        borderColor: rgb(0.5, 0.4, 0.2), // dark brown
    });

    // 🌟 WATERMARK (Smaller & Elegant)
    page.drawText("EPUDU EVENTS", {
        x: 110,
        y: height / 2,
        size: 55,
        font: fontBold,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.08,
        rotate: degrees(30),
    });

    // Helper for text
    const drawText = (text, x, y, bold = false, size = 12) => {
        page.drawText(text, {
            x,
            y,
            size,
            font: bold ? fontBold : font,
            color: rgb(0.2, 0.2, 0.2),
        });
    };

    // 🌟 TITLE
    drawText("EPUDU Vendor Agreement Bond", 150, 780, true, 20);

    // 🌟 SECTION TITLE
    drawText("Vendor Details", 50, 740, true, 14);

    drawText(`Vendor Name: ${vendor.name}`, 50, 720);
    drawText(`Shop Name: ${vendor.shopName}`, 50, 700);
    drawText(`Vendor Type: ${vendor.vendorType}`, 50, 680);
    drawText(`Mobile: ${vendor.mobile}`, 50, 660);

    drawText(`Email: ${agreement.email}`, 50, 640);
    drawText(`Location: ${agreement.location}`, 50, 620);

    drawText(
        `Agreement Date & Time: ${new Date().toLocaleString()}`,
        50,
        600
    );

    // 🌟 Agreement Terms Section
    drawText("Agreement Terms", 50, 560, true, 14);

    drawText(
        "This Vendor Agreement certifies that the vendor agrees to provide services for events, weddings,",
        50,
        540
    );
    drawText(
        "functions, birthdays, and all EPUDU associated activities with timely response and 24/7 availability.",
        50,
        525
    );

    // 🌟 SIGNATURES
    drawText("Vendor Signature:", 50, 470, true);

    // Load Vendor signature image
    const vendorSignatureBytes = fs.readFileSync(agreement.vendorSignatureUrl);
    const signatureImage = await pdfDoc.embedPng(vendorSignatureBytes);

    page.drawImage(signatureImage, {
        x: 50,
        y: 400,
        width: 120,
        height: 60,
    });

    drawText("Admin Signature:", 380, 470, true);

    // Admin signature image
    if (fs.existsSync("uploads/admin-sign.png")) {
        const adminSig = fs.readFileSync("uploads/admin-sign.png");
        const adminSigImg = await pdfDoc.embedPng(adminSig);

        page.drawImage(adminSigImg, {
            x: 380,
            y: 400,
            width: 120,
            height: 60,
        });
    }

    // FOOTER
    drawText("EPUDU EVENT MANAGEMENT", 200, 50, true);
    drawText("ANY EVENT, JUST TELL US!", 230, 35);

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    const filePath = `uploads/vendor_agreement_${vendor._id}.pdf`;
    fs.writeFileSync(filePath, pdfBytes);

    return filePath;
};
