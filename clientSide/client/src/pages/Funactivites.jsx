"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Header from "./common/Header";
import Banner from "./common/Banner";
import Footer from "./common/Footer";
import ItemCard from "./common/card";

import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";

const FunActivities = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        entertainment: {},
        clientId: "",
        totalAmount: 0,
        paymentStatus: "Pending",
    });

    const [entertainmentItems, setEntertainmentItems] = useState([]);

    /* 🔐 CLIENT ID */
    useEffect(() => {
        const clientId = localStorage.getItem("userId");
        if (clientId) {
            setFormData(prev => ({ ...prev, clientId }));
        }
    }, []);

    /* 🎭 FETCH ENTERTAINMENT ITEMS */
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/vendor/items/getitems`);
                setEntertainmentItems(
                    res.data.items.filter(i => i.category === "Entertainment")
                );
            } catch (err) {
                console.error(err);
            }
        };
        fetchItems();
    }, []);

    /* 🧾 INPUT HANDLER */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /* 💰 UPDATE COST */
    const updateCost = (price, add) => {
        setFormData(prev => ({
            ...prev,
            totalAmount: add
                ? prev.totalAmount + price
                : Math.max(prev.totalAmount - price, 0),
        }));
    };

    /* ☑️ SELECT / UNSELECT */
    const handleCheckboxChange = (key, item, price) => {
        setFormData(prev => {
            const selected = prev.entertainment[key] || [];
            const exists = selected.some(i => i._id === item._id);

            const updated = exists
                ? selected.filter(i => i._id !== item._id)
                : [...selected, item];

            updateCost(price, !exists);

            return {
                ...prev,
                entertainment: {
                    ...prev.entertainment,
                    [key]: updated,
                },
            };
        });
    };

    /* 💳 PAYMENT */
    const startPayment = async () => {
        if (!formData.totalAmount) {
            toast.error("Please select activities");
            return;
        }

        try {
            const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: formData.totalAmount }),
            });

            const orderData = await orderRes.json();
            let paymentCompleted = false;

            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "EPUDU Fun Activities",
                description: "Entertainment Booking",
                order_id: orderData.order.id,

                handler: async (response) => {
                    const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...response,
                            eventType: "Fun Activities",
                            clientName: formData.name,
                            amount: formData.totalAmount,
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (!verifyData.success) return toast.error("Payment failed");

                    paymentCompleted = true;

                    await fetch(`${API_URL}/api/client/fun-activities/add`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...formData, paymentStatus: "Paid" }),
                    });

                    toast.success("Activities booked 🎉");
                    window.location.href = "/custom-services-History";
                },

                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },

                theme: { color: "#7c3aed" },
                modal: {
                    ondismiss: () => {
                        if (!paymentCompleted) toast("Payment cancelled");
                    },
                },
            };

            new window.Razorpay(options).open();
        } catch {
            toast.error("Payment error");
        }
    };

    return (
        <>
            <Header />
            <Banner title="Fun Activities" />

            <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* LEFT CONTENT */}
                    <div className="text-center lg:text-left space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            🎉 Fun Activities & Entertainment
                        </h2>

                        <p className="text-gray-600 text-sm sm:text-base">
                            Choose entertainment, anchors, games & activities.
                            Pay securely and let EPUDU handle the fun.
                        </p>

                        <div className="text-gray-700 space-y-2 text-sm sm:text-base">
                            <p><b>Performers:</b> Verified professionals</p>
                            <p><b>Customization:</b> Available</p>
                            <p><b>Support:</b> 24/7 Assistance</p>
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-center">

                            <label>Name</label>
                            <input name="name" onChange={handleChange} className="input border border-black" />

                            <label>Email</label>
                            <input name="email" onChange={handleChange} className="input border border-black" />

                            <label>Phone</label>
                            <input name="phone" onChange={handleChange} className="input border border-black" />
                        </div>

                        {/* ENTERTAINMENT */}
                        <div className="p-5 border-2 border-purple-300 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50">

                            <h3 className="text-xl font-bold text-purple-600 mb-4 text-center">
                                🎭 Entertainment Selection
                            </h3>

                            {/* EMCEE */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-2">🎤 Emcee / Anchor Required?</h4>
                                <div className="flex gap-6">
                                    {["Yes", "No"].map(option => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={formData.entertainment?.emceeRequired === option}
                                                onChange={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        entertainment: { ...prev.entertainment, emceeRequired: option },
                                                    }));
                                                    updateCost(1500, option === "Yes");
                                                }}
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* SUBCATEGORIES */}
                            {Object.entries(
                                entertainmentItems.reduce((acc, item) => {
                                    const sub = item.subcategory || "Other";
                                    acc[sub] = acc[sub] || [];
                                    acc[sub].push(item);
                                    return acc;
                                }, {})
                            ).map(([sub, items]) => {
                                const key = sub.replace(/\s+/g, "");
                                const selected = formData.entertainment[key] || [];

                                return (
                                    <div key={key} className="mb-6">
                                        <h4 className="text-purple-600 font-semibold mb-3">🎯 {sub}</h4>

                                        <Swiper modules={[A11y]} slidesPerView={3} spaceBetween={10}>
                                            {items.map(item => {
                                                const price = item.price * 1.5;
                                                const active = selected.some(i => i._id === item._id);

                                                return (
                                                    <SwiperSlide key={item._id}>
                                                        <div
                                                            onClick={() => handleCheckboxChange(key, item, price)}
                                                            className={`cursor-pointer ${active ? "ring-4 ring-purple-500 rounded-xl" : ""}`}
                                                        >
                                                            <ItemCard image={item.image} name={item.name} price={item.price} />
                                                        </div>
                                                    </SwiperSlide>
                                                );
                                            })}
                                        </Swiper>
                                    </div>
                                );
                            })}
                        </div>

                        {/* TOTAL */}
                        <div className="text-right font-semibold text-lg">
                            Total: ₹ {formData.totalAmount}
                        </div>

                        {/* PAY */}
                        <button
                            onClick={startPayment}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                        >
                            💳 Pay with Razorpay
                        </button>

                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default FunActivities;
