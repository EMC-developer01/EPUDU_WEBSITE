"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./common/Header";
import Banner from "./common/Banner";
import Footer from "./common/Footer";

const CustomServicesHistory = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:4000/api/client/services/history"
                );
                setServices(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <>
            <Header />
            <Banner title="My Services History" />

            <section className="w-full px-4 sm:px-6 lg:px-12 py-14 bg-gray-50">
                <h2 className="text-4xl font-bold text-center mb-12 text-pink-600">
                    📜 Service History
                </h2>

                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : services.length === 0 ? (
                    <p className="text-center text-gray-600">
                        No services booked yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white shadow-lg rounded-xl p-6 hover:scale-[1.02] transition"
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {item.serviceType}
                                </h3>

                                <p className="text-sm text-gray-600 mb-1">
                                    <b>Name:</b> {item.name}
                                </p>

                                <p className="text-sm text-gray-600 mb-1">
                                    <b>Amount:</b> ₹{item.amount}
                                </p>

                                <p className="text-sm text-gray-600 mb-1">
                                    <b>Status:</b>{" "}
                                    <span className="text-green-600 font-semibold">
                                        {item.paymentStatus}
                                    </span>
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </>
    );
};

export default CustomServicesHistory;
