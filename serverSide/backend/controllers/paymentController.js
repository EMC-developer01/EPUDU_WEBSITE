import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";

export const createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;
        console.log("Amount received:", amount);

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        console.log("✅ Razorpay Key:", process.env.RAZORPAY_KEY_ID);
        console.log(amount)
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        console.log("Order created:", order);

        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("❌ Order creation failed:");
        console.error("Error message:", err.message);
        if (err.response) {
            console.error("Error status:", err.response.status);
            console.error("Error data:", err.response.data);
        }
        res.status(500).json({ message: err.message || "Server error" });
    }

};

// export const verifyPayment = async (req, res) => {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//         if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//             return res.status(400).json({ success: false, message: "Missing payment details" });
//         }

//         const sign = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_SECRET)
//             .update(sign.toString())
//             .digest("hex");

//         console.log("Expected Signature:", expectedSignature);
//         console.log("Received Signature:", razorpay_signature);

//         if (expectedSignature === razorpay_signature) {
//             console.log("✅ Signature verified successfully!");
//             await Payment.create({
//                 orderId: razorpay_order_id,
//                 paymentId: razorpay_payment_id,
//                 signature: razorpay_signature,
//                 amount: amount / 100, // Convert paise → INR
//             });

//             // res.status(200).json({ success: true, message: "Payment verified & saved" });

//             return res.status(200).json({ success: true, message: "Payment verified successfully" });
//         } else {
//             console.log("❌ Signature mismatch!");
//             return res.status(400).json({ success: false, message: "Invalid signature" });
//         }
//     } catch (error) {
//         console.error("❌ Verification error:", error);
//         res.status(500).json({ success: false, message: "Server error during verification" });
//     }
// };

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment details",
            });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid signature",
            });
        } 

        console.log("✅ Signature verified successfully!");

        // Save payment to DB
        await Payment.create({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            amount: amount ? Number(amount) : 0, // INR value
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified & saved",
        });

    } catch (error) {
        console.error("❌ Verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during verification",
        });
    }
};

export const allPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ date: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: "Error fetching payments" });
    }
};
