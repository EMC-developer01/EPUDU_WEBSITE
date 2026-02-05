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

const Decoration = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        decoration: {},
        clientId: "",
        totalAmount: 0,
        paymentStatus: "Pending",
    });

    const [items, setItems] = useState([]);

    /* 🔐 CLIENT ID */
    useEffect(() => {
        const clientId = localStorage.getItem("userId");
        if (clientId) setFormData(prev => ({ ...prev, clientId }));
    }, []);

    /* 🎀 FETCH DECORATION ITEMS */
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:4000/api/vendor/items/getitems"
                );
                setItems(res.data.items.filter(i => i.category === "Decoration"));
            } catch (err) {
                console.error(err);
            }
        };
        fetchItems();
    }, []);

    /* 🧾 INPUT HANDLER */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("decoration.")) {
            const key = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                decoration: { ...prev.decoration, [key]: value },
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
            const selected = prev.decoration[key] || [];
            const exists = selected.some(i => i._id === item._id);

            const updated = exists
                ? selected.filter(i => i._id !== item._id)
                : [...selected, item];

            updateCost(price, !exists);

            return {
                ...prev,
                decoration: {
                    ...prev.decoration,
                    [key]: updated,
                },
            };
        });
    };

    /* 💳 PAYMENT */
    const startPayment = async () => {
        if (!formData.totalAmount) {
            toast.error("Please select decoration items");
            return;
        }

        try {
            const orderRes = await fetch(
                "http://localhost:4000/api/payment/create-order",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: formData.totalAmount }),
                }
            );

            const orderData = await orderRes.json();
            let paymentCompleted = false;

            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "EPUDU Decorations",
                description: "Decoration Booking",
                order_id: orderData.order.id,

                handler: async (response) => {
                    const verifyRes = await fetch(
                        "http://localhost:4000/api/payment/verify",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...response,
                                eventType: "Decoration",
                                clientName: formData.name,
                                amount: formData.totalAmount,
                            }),
                        }
                    );

                    const verifyData = await verifyRes.json();
                    if (!verifyData.success) return toast.error("Payment failed");

                    paymentCompleted = true;

                    await fetch(
                        "http://localhost:4000/api/client/decoration/add",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...formData, paymentStatus: "Paid" }),
                        }
                    );

                    toast.success("Decoration booked 🎀");
                    window.location.href = "/decoration-history";
                },

                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },

                theme: { color: "#ec4899" },
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

    /* GROUP BY SUBCATEGORY */
    const groupedItems = items.reduce((acc, item) => {
        const sub = item.subcategory || "Other";
        acc[sub] = acc[sub] || [];
        acc[sub].push(item);
        return acc;
    }, {});

    return (
        <>
            <Header />
            <Banner title="Decoration & Themes" />

            <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* LEFT */}
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold">🎀 Decoration & Theme Preferences</h2>
                        <p className="text-gray-600">
                            Choose stage, entrance, lighting & themed decorations.
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input name="name" placeholder="Name" onChange={handleChange} className="input border" />
                            <input name="email" placeholder="Email" onChange={handleChange} className="input border" />
                            <input name="phone" placeholder="Phone" onChange={handleChange} className="input border" />

                            <input
                                name="decoration.themeScheme"
                                placeholder="Theme / Color Scheme"
                                onChange={handleChange}
                                className="input border sm:col-span-2"
                            />
                        </div>

                        {Object.entries(groupedItems).map(([sub, subItems]) => {
                            const key = sub.replace(/\s+/g, "");
                            const selected = formData.decoration[key] || [];

                            return (
                                <div key={key}>
                                    <h4 className="font-semibold text-pink-600 mb-3">
                                        🎯 {sub}
                                    </h4>

                                    <Swiper modules={[A11y]} slidesPerView={3} spaceBetween={10}>
                                        {subItems.map(item => {
                                            const price = item.price * 1.5;
                                            const active = selected.some(i => i._id === item._id);

                                            return (
                                                <SwiperSlide key={item._id}>
                                                    <div
                                                        onClick={() =>
                                                            handleCheckboxChange(key, item, price)
                                                        }
                                                        className={`cursor-pointer ${active
                                                                ? "ring-4 ring-pink-500 rounded-xl"
                                                                : ""
                                                            }`}
                                                    >
                                                        <ItemCard
                                                            image={item.image}
                                                            name={item.name}
                                                            price={item.price}
                                                        />
                                                    </div>
                                                </SwiperSlide>
                                            );
                                        })}
                                    </Swiper>
                                </div>
                            );
                        })}

                        <div className="text-right font-semibold text-lg">
                            Total: ₹ {formData.totalAmount}
                        </div>

                        <button
                            onClick={startPayment}
                            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700"
                        >
                            💳 Pay & Book Decoration
                        </button>

                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Decoration;
