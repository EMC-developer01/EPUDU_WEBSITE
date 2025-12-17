import mongoose from "mongoose";

const ClientBillSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    eventName: String,
    advanceAmount: Number,
    totalAmount: Number,
    billPdfUrl: String,
    paymentDate: { type: Date, default: Date.now }
});

export default mongoose.model("ClientBill", ClientBillSchema);
