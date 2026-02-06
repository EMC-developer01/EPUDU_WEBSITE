"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./common/Header";
import Footer from "./common/Footer";
import Banner from "./common/Banner";

export default function CustomServicesHistory() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchServiceHistory = async () => {
        try {
            const clientId = localStorage.getItem("userId")?.replace(/^"|"$/g, "");

            if (!clientId) {
                alert("User not logged in");
                navigate("/login");
                return;
            }

            const res = await axios.get(
                `http://localhost:4000/api/client/services/history/${clientId}`
            );

            setServices(res.data.history || []);
        } catch (err) {
            console.error("❌ Error fetching service history:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchServiceHistory();
    }, []);

    const handlePayment = async (service) => {
        try {
            const amount = Number(service.amount || 0);
            if (amount <= 0) return alert("Invalid amount");

            const orderRes = await axios.post(
                "http://localhost:4000/api/payment/create-order",
                { amount }
            );

            const { order, key } = orderRes.data;

            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: "Custom Service Payment",
                description: service.serviceType,
                order_id: order.id,

                handler: async (response) => {
                    const verifyRes = await axios.post(
                        "http://localhost:4000/api/payment/verify",
                        response
                    );

                    if (verifyRes.data.success) {
                        await axios.put(
                            `http://localhost:4000/api/client/services/update/${service._id}`,
                            {
                                paymentStatus: "Paid",
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                            }
                        );

                        fetchServiceHistory();
                        alert("🎉 Payment Successful");
                    }
                },

                prefill: {
                    name: service.name,
                    email: service.email,
                    contact: service.phone,
                },
                theme: { color: "#00bfa5" },
            };

            new window.Razorpay(options).open();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Payment failed");
        }
    };

    return (
        <>
            <Header />
            <Banner title="🛠️ Custom Services History" />

            <section className="min-h-screen bg-gradient-to-r from-teal-50 to-cyan-100 py-12 px-6">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">
                        Your Service Bookings
                    </h2>

                    {loading ? (
                        <p className="text-center">Loading service history...</p>
                    ) : services.length === 0 ? (
                        <p className="text-center text-gray-600">
                            No service history found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div
                                    key={service._id}
                                    className="border rounded-xl shadow-sm p-5 bg-white hover:shadow-md transition"
                                >
                                    <h3 className="text-xl font-semibold text-teal-700 mb-2">
                                        {service.serviceType}
                                    </h3>

                                    <p className="text-sm">👤 {service.name}</p>
                                    <p className="text-sm">📧 {service.email}</p>
                                    <p className="text-sm">📞 {service.phone}</p>

                                    <p className="text-sm mt-1">
                                        💰 <b>Amount:</b> ₹{service.amount}
                                    </p>

                                    <p
                                        className={`text-sm font-medium mt-1 ${service.paymentStatus === "Paid"
                                            ? "text-green-600"
                                            : "text-yellow-600"
                                            }`}
                                    >
                                        💳 {service.paymentStatus}
                                    </p>

                                    <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                                        <p className="font-semibold text-gray-700 mb-1">📦 Selected Items:</p>

                                        {Object.values(service.details || {})
                                            .flat()
                                            .filter(item => typeof item === "object" && item?.name)
                                            .map((item, idx) => (
                                                <div key={idx} className="flex justify-between border-b py-1">
                                                    <span>📝 {item.name}</span>
                                                    <span className="text-gray-600">🏷️ {item.category}</span>
                                                </div>
                                            ))}
                                    </div>


                                    {service.paymentStatus === "Pending" && (
                                        <button
                                            onClick={() => handlePayment(service)}
                                            className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                                        >
                                            💳 Pay Now
                                        </button>
                                    )}

                                    {service.paymentStatus === "Paid" && (
                                        <div className="mt-4 bg-green-100 text-green-700 py-2 rounded-lg text-center font-medium">
                                            ✅ Payment Completed
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
}
