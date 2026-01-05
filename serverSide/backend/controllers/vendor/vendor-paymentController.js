import VendorPayment from "../../models/vendor/vendor-payments.js";
import Order from "../models/Order.js";
import Vendor from "../models/Vendor.js";

export const createVendorPayment = async (req, res) => {
    const { orderId, vendorId } = req.body;

    const order = await Order.findById(orderId);
    const vendor = await Vendor.findById(vendorId);

    const totalDiscount = order.guestCount * vendor.discountPerGuest;
    const payableAmount = order.totalAmount - totalDiscount;

    const payment = await VendorPayment.create({
        vendor: vendorId,
        order: orderId,
        totalAmount: order.totalAmount,
        guestCount: order.guestCount,
        discountPerGuest: vendor.discountPerGuest,
        totalDiscount,
        payableAmount
    });

    res.json(payment);
};

export const getAllVendorPayments = async (req, res) => {
    const payments = await VendorPayment.find()
        .populate("vendor")
        .populate("order")
        .sort({ createdAt: -1 });

    res.json(payments);
};

export const markAsPaid = async (req, res) => {
    const payment = await VendorPayment.findByIdAndUpdate(
        req.params.id,
        { status: "PAID" },
        { new: true }
    );
    res.json(payment);
};
