import PDFDocument from "pdfkit";
import fs from "fs";

export const generateClientBillPDF = ({ client, eventName, advanceAmount, totalAmount }) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filePath = `uploads/client_bill_${client._id}.pdf`;

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(20).text("EPUDU EVENTS - Client Bill", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text(`Client Name: ${client.name}`);
        doc.text(`Event: ${eventName}`);
        doc.text(`Advance Paid: ₹${advanceAmount}`);
        doc.text(`Total Amount: ₹${totalAmount}`);
        doc.text(`Remaining Amount: ₹${totalAmount - advanceAmount}`);

        doc.end();

        stream.on("finish", () => resolve(filePath));
        stream.on("error", reject);
    });
};
