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

const Photography = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        photography: {
            photoTeam: "",
            packageType: [],
            instantPhoto: "",
        },
        clientId: "",
        totalAmount: 0,
        paymentStatus: "Pending",
    });

    const [photographyItems, setPhotographyItems] = useState([]);

    /* 🔐 CLIENT ID */
    useEffect(() => {
        const clientId = localStorage.getItem("userId");
        if (clientId) setFormData((p) => ({ ...p, clientId }));
    }, []);

    /* 📸 FETCH PHOTOGRAPHY ITEMS */
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:4000/api/vendor/items/getitems"
                );
                setPhotographyItems(
                    res.data.items.filter((i) => i.category === "Photography")
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

        if (name.startsWith("photography.")) {
            const key = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                photography: { ...prev.photography, [key]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    /* 💰 UPDATE COST */
    const updateCost = (price, add) => {
        setFormData((prev) => ({
            ...prev,
            totalAmount: add
                ? prev.totalAmount + price
                : Math.max(prev.totalAmount - price, 0),
        }));
    };

    /* ☑️ SELECT / UNSELECT */
    const handleCheckboxChange = (key, field, item, price, isOther = false) => {
        setFormData((prev) => {
            const selected = prev[key][field] || [];
            const exists = isOther
                ? selected.includes("Other")
                : selected.some((i) => i._id === item._id);

            let updated;

            if (isOther) {
                updated = exists
                    ? selected.filter((i) => i !== "Other")
                    : [...selected, "Other"];
            } else {
                updated = exists
                    ? selected.filter((i) => i._id !== item._id)
                    : [...selected, item];
            }

            updateCost(price, !exists);

            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    [field]: updated,
                },
            };
        });
    };

    /* 💳 PAYMENT */
    const startPayment = async () => {
        if (!formData.totalAmount) {
            toast.error("Please select photography options");
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
                name: "EPUDU Photography",
                description: "Photography Booking",
                order_id: orderData.order.id,

                handler: async (response) => {
                    const verifyRes = await fetch(
                        "http://localhost:4000/api/payment/verify",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...response,
                                eventType: "Photography",
                                clientName: formData.name,
                                amount: formData.totalAmount,
                            }),
                        }
                    );

                    const verifyData = await verifyRes.json();
                    if (!verifyData.success) return toast.error("Payment failed");

                    paymentCompleted = true;

                    await fetch("http://localhost:4000/api/client/photography/add", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...formData, paymentStatus: "Paid" }),
                    });

                    toast.success("Photography booked 📸");
                    window.location.href = "/custom-services-History";
                },

                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },

                theme: { color: "#16a34a" },
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
            <Banner title="Photography & Videography" />

            <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* LEFT */}
                    <div>
                        <h2 className="text-3xl font-bold mb-2">📸 Photography Services</h2>
                        <p className="text-gray-600">
                            Choose photography & videography packages for your event.
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input name="name" placeholder="Name" onChange={handleChange} className="input border" />
                            <input name="email" placeholder="Email" onChange={handleChange} className="input border" />
                            <input name="phone" placeholder="Phone" onChange={handleChange} className="input border" />
                        </div>

                        {/* 📸 PHOTOGRAPHY BLOCK */}
                        <div className="my-2 p-6 border-2 border-green-300 rounded-2xl bg-gradient-to-r from-green-50 to-yellow-50 shadow-lg w-full">

                            <h3 className="text-2xl font-bold text-green-600 text-center mb-6">
                                📸 Photography & Videography
                            </h3>

                            {/* TEAM */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-2">👥 Team Requirement</h4>
                                <div className="flex gap-6">
                                    {["Required", "Client's Own Team"].map((option) => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={formData.photography.photoTeam === option}
                                                onChange={() =>
                                                    setFormData((p) => ({
                                                        ...p,
                                                        photography: { ...p.photography, photoTeam: option },
                                                    }))
                                                }
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* PACKAGES */}
                            {formData.photography.photoTeam === "Required" && (
                                <Swiper modules={[A11y]} slidesPerView={3} spaceBetween={10}>
                                    {photographyItems.map((item) => {
                                        const selected =
                                            formData.photography.packageType?.some(
                                                (i) => i._id === item._id
                                            );
                                        const price = item.price * 1.5;

                                        return (
                                            <SwiperSlide key={item._id}>
                                                <div
                                                    onClick={() =>
                                                        handleCheckboxChange(
                                                            "photography",
                                                            "packageType",
                                                            item,
                                                            price
                                                        )
                                                    }
                                                    className={`cursor-pointer ${selected
                                                            ? "ring-4 ring-green-500 rounded-xl"
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
                            )}
                        </div>

                        <div className="text-right font-semibold text-lg">
                            Total: ₹ {formData.totalAmount}
                        </div>

                        <button
                            onClick={startPayment}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                        >
                            💳 Pay & Book Photography
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Photography;
