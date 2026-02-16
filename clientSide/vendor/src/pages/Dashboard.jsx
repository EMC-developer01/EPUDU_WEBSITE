import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";

export default function VendorDashboard() {
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔑 vendorId should come from auth / localStorage
    const vendorId = localStorage.getItem("vendorId");

    useEffect(() => {
        fetchVendorOrders();
    }, []);

    const fetchVendorOrders = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/api/vendor/orders`,
                { params: { vendorId } }
            );
            setOrders(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch vendor orders", err);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status) => {
        if (status === "Pending") return "text-yellow-600";
        if (status === "Completed") return "text-green-600";
        if (status.includes("Cancelled")) return "text-red-600";
        return "text-gray-600";
    };

    return (
        <div className="min-h-screen w-screen bg-gray-50 overflow-x-hidden">

            <Header />

            <main className="w-full flex flex-col gap-6 sm:gap-8 px-3 sm:px-4 md:px-6">

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                    Vendor Dashboard
                </h1>

                {/* SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SummaryCard title="Total Orders" value={orders.length} />
                    <SummaryCard
                        title="Pending Orders"
                        value={orders.filter(o => o.status === "Pending").length}
                    />
                    <SummaryCard
                        title="Completed Orders"
                        value={orders.filter(o => o.status === "Completed").length}
                    />
                </div>

                {/* ORDERS */}
                <section className="bg-white rounded-xl shadow p-4">

                    <h2 className="text-xl font-semibold mb-4">Latest Orders</h2>

                    {loading && <p className="text-gray-500">Loading...</p>}

                    {!loading && orders.length === 0 && (
                        <p className="text-gray-500">No orders found</p>
                    )}

                    {/* DESKTOP */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-gray-100 text-sm">
                                    <th className="p-3">Client</th>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Event</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} className="border-b">
                                        <td className="p-3">{order.celebrantName}</td>
                                        <td className="p-3">{order.itemName}</td>
                                        <td className="p-3">{order.eventType}</td>
                                        <td className="p-3">{order.eventDate}</td>
                                        <td className={`p-3 font-semibold ${statusColor(order.status)}`}>
                                            {order.status}
                                        </td>
                                        <td className="p-3">{order.paymentStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE */}
                    <div className="md:hidden space-y-3">
                        {orders.map(order => (
                            <div key={order._id} className="border rounded-xl p-4 shadow-sm">
                                <p className="font-semibold">{order.itemName}</p>
                                <p className="text-sm text-gray-600">{order.celebrantName}</p>
                                <p className="text-sm">{order.eventDate}</p>

                                <div className="flex justify-between mt-2">
                                    <span className={`font-semibold ${statusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <span className="text-sm">
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                </section>
            </main>
        </div>
    );
}

const SummaryCard = ({ title, value }) => (
    <div className="rounded-xl bg-white shadow p-4">
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
);
