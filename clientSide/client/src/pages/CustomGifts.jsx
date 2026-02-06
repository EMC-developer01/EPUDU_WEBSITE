"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "./common/Header";
import Banner from "./common/Banner";
import Footer from "./common/Footer";

const CustomGifts = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        clientId: "",
        returnGifts: {
            quantity: 0,
            budget: 0,
            total: 0,
            giftType: "",
            giftTypeOther: "",
            notes: "",
        },
        paymentStatus: "Pending",
    });
    useEffect(() => {
        const clientId = localStorage.getItem("userId"); // or from auth
        if (clientId) {
            setFormData(prev => ({
                ...prev,
                clientId,
            }));
        }
    }, []);

    /* 🔁 HANDLER */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("returnGifts.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                returnGifts: { ...prev.returnGifts, [key]: value },
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    /* 💳 RAZORPAY */
    const startPayment = async () => {
        try {
            const amount = Number(formData.returnGifts.total);
            if (!amount || amount <= 0) {
                alert("Enter valid quantity & cost");
                return;
            }

            const orderRes = await fetch("http://localhost:4000/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            });

            const orderData = await orderRes.json();
            if (!orderData?.order?.id) throw new Error("Order failed");

            let paymentCompleted = false;

            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "EPUDU Custom Gifts",
                description: "Custom Gift Order",
                order_id: orderData.order.id,

                handler: async (response) => {
                    try {
                        const verifyRes = await fetch("http://localhost:4000/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...response,
                                eventType: "Custom Gifts",
                                clientName: formData.name,
                                amount,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (!verifyData.success) {
                            toast.error("Payment failed");
                            return;
                        }

                        paymentCompleted = true;
                        toast.success("Payment Successful 🎉");

                        await fetch("http://localhost:4000/api/client/custom-gifts/add", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...formData,
                                paymentStatus: "Paid",
                            }),
                        });

                        window.location.href = "/custom-services-History";
                    } catch {
                        toast.error("Verification failed");
                    }
                },

                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },

                theme: { color: "#db2777" },

                modal: {
                    ondismiss: () => {
                        if (!paymentCompleted) toast("Payment cancelled");
                    },
                },
            };

            new window.Razorpay(options).open();
        } catch {
            alert("Error starting payment");
        }
    };

    return (
        <>
            <Header />
            <Banner title="Custom Gifts" />

            <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* LEFT CONTENT */}
                    <div className="text-center lg:text-left space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            🎁 Custom Return Gifts
                        </h2>

                        <p className="text-gray-600 text-sm sm:text-base">
                            Choose your gift type, quantity, and budget.
                            Pay securely and let EPUDU handle the rest.
                        </p>

                        <div className="text-gray-700 space-y-2 text-sm sm:text-base">
                            <p><b>Delivery:</b> Across India</p>
                            <p><b>Customization:</b> Available</p>
                            <p><b>Support:</b> 24/7 Assistance</p>
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-center">

                            {/* USER INFO */}
                            <label className="pr-4">Enter Name</label>
                            <input
                                name="name"
                                placeholder="Your Name"
                                onChange={handleChange}
                                className="input border border-black pr-4 mr-5"
                            />
                            <label className="pr-4">Enter Email</label>
                            <input
                                name="email"
                                placeholder="Your Email"
                                onChange={handleChange}
                                className="input border border-black"
                            />
                            <label className="pr-4">Enter phoneNo </label>
                            <input
                                name="phone"
                                placeholder="Phone Number"
                                onChange={handleChange}
                                className="input border border-black"
                            />

                            {/* QUANTITY */}
                            <label className="pr-4">Gifts Quantity</label>
                            <input
                                type="number"
                                name="returnGifts.quantity"
                                placeholder="Number of Gifts"
                                onChange={(e) => {
                                    const qty = Number(e.target.value) || 0;
                                    const price = Number(formData.returnGifts.budget) || 0;
                                    setFormData((prev) => ({
                                        ...prev,
                                        returnGifts: {
                                            ...prev.returnGifts,
                                            quantity: qty,
                                            total: qty * price,
                                        },
                                    }));
                                }}
                                className="input border border-black"
                            />

                            {/* COST */}
                            <label className="pr-4"> Gift Cost</label>
                            <input
                                type="number"
                                name="returnGifts.budget"
                                placeholder="Cost Per Gift"
                                onChange={(e) => {
                                    const price = Number(e.target.value) || 0;
                                    const qty = Number(formData.returnGifts.quantity) || 0;
                                    setFormData((prev) => ({
                                        ...prev,
                                        returnGifts: {
                                            ...prev.returnGifts,
                                            budget: price,
                                            total: qty * price,
                                        },
                                    }));
                                }}
                                className="input border border-black"
                            />


                            {/* GIFT TYPE */}
                            <select
                                name="returnGifts.giftType"
                                onChange={handleChange}
                                className="input border border-black"
                            >
                                <option value="">Select Gift Type</option>
                                <option>Toys</option>
                                <option>Sweets</option>
                                <option>Customized Hampers</option>
                                <option>Other</option>
                            </select>

                            {formData.returnGifts.giftType === "Other" && (
                                <input
                                    name="returnGifts.giftTypeOther"
                                    placeholder="Specify Gift"
                                    onChange={handleChange}
                                    className="input border border-black"
                                />
                            )}

                            {/* NOTES */}
                            <textarea
                                name="returnGifts.notes"
                                placeholder="Notes / Instructions"
                                rows="3"
                                onChange={handleChange}
                                className="input border border-black"
                            />

                            {/* TOTAL */}
                            <div className="text-right font-semibold text-lg">
                                Total: ₹ {formData.returnGifts.total}
                            </div>

                            {/* PAY */}
                            <button
                                onClick={startPayment}
                                className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition"
                            >
                                💳 Pay with Razorpay
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default CustomGifts;
