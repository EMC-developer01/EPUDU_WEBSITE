"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Header from "./common/Header";
import Banner from "./common/Banner";
import Footer from "./common/Footer";

const PartyPlaces = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        venue: {
            name: "",
            location: "",
            cost: 0,
        },
        clientId: "",
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



    const initialVenues = [
        { id: 1, name: "Grand Indoor Hall", type: "Indoor", lat: 17.3870, lng: 78.4867, stars: 3, image: "/placeholder.jpg", location: "Hyderabad", cost: 20000 },
        { id: 2, name: "City Party Hall", type: "Party Hall", lat: 17.3890, lng: 78.4820, stars: 4, image: "/placeholder.jpg", location: "Hyderabad", cost: 30000 },
        { id: 3, name: "Green Park Lawn", type: "Outdoor", lat: 17.3830, lng: 78.4880, stars: 5, image: "/placeholder.jpg", location: "Hyderabad", cost: 25000 },
    ];
    const [venues, setVenues] = useState(initialVenues);
    const [selectedVenue, setSelectedVenue] = useState(venues);

    /* 🔁 INPUT HANDLER */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /* 🏢 SELECT VENUE */
    const selectVenue = (v) => {
        setSelectedVenue(v);
        setFormData((prev) => ({
            ...prev,
            venue: {
                name: v.name,
                location: v.location,
                cost: v.cost,
            },
        }));
    };

    /* 💳 PAYMENT */
    const startPayment = async () => {
        try {
            const amount = Number(formData.venue.cost);
            if (!amount) {
                alert("Please select a venue");
                return;
            }

            const orderRes = await fetch(
                `${API_URL}/api/payment/create-order`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount }),
                }
            );

            const orderData = await orderRes.json();
            if (!orderData?.order?.id) throw new Error("Order failed");

            let paymentCompleted = false;

            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "EPUDU Party Places",
                description: "Venue Booking",
                order_id: orderData.order.id,

                handler: async (response) => {
                    try {
                        const verifyRes = await fetch(
                           `${API_URL}/api/payment/verify`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    ...response,
                                    eventType: "Party Place",
                                    clientName: formData.name,
                                    amount,
                                }),
                            }
                        );

                        const verifyData = await verifyRes.json();
                        if (!verifyData.success) {
                            toast.error("Payment failed");
                            return;
                        }

                        paymentCompleted = true;
                        toast.success("Venue Booked 🎉");

                        await fetch(
                            `${API_URL}/api/client/party-places/add`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    ...formData,
                                    paymentStatus: "Paid",
                                }),
                            }
                        );

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

                theme: { color: "#7c3aed" },

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
            <Banner title="Party Places" />

            <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* LEFT INFO */}
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold">🎉 Book Party Venues</h2>
                        <p className="text-gray-600">
                            Choose a venue, confirm details, and pay securely.
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-5">

                        {/* USER DETAILS */}
                        <input
                            name="name"
                            placeholder="Your Name"
                            onChange={handleChange}
                            className="input border border-black"
                        />
                        <input
                            name="email"
                            placeholder="Your Email"
                            onChange={handleChange}
                            className="input border border-black"
                        />
                        <input
                            name="phone"
                            placeholder="Phone Number"
                            onChange={handleChange}
                            className="input border border-black"
                        />

                        {/* VENUE LIST */}
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {venues.map((v) => (
                                <div
                                    key={v.id}
                                    onClick={() => selectVenue(v)}
                                    className={`p-4 border rounded-lg cursor-pointer
                    ${selectedVenue?.id === v.id
                                            ? "border-violet-500 bg-violet-50"
                                            : "hover:bg-gray-50"
                                        }`}
                                >
                                    <h4 className="font-semibold">{v.name}</h4>
                                    <p className="text-sm text-gray-600">{v.location}</p>
                                    <p className="font-bold">₹ {v.cost}</p>
                                </div>
                            ))}
                        </div>

                        {/* TOTAL */}
                        <div className="text-right font-semibold text-lg">
                            Total: ₹ {formData.venue.cost}
                        </div>

                        {/* PAY */}
                        <button
                            onClick={startPayment}
                            className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700"
                        >
                            💳 Pay & Book Venue
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default PartyPlaces;
