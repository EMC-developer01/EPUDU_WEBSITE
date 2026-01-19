import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const VendorPaymentStatus = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("http://localhost:4000/api/vendor/orders/")
            .then(res => res.json())
            .then(res => setOrders(res.data || []))
            .catch(console.error);
    }, []);

    const filteredOrders = orders.filter(o => {
        const q = search.toLowerCase();

        return (
            (o.itemName || "").toLowerCase().includes(q) ||
            (o.vendorId || "").toLowerCase().includes(q) ||
            (o.celebrantName || "").toLowerCase().includes(q) ||
            (o.category || "").toLowerCase().includes(q) ||
            (o.subcategory || "").toLowerCase().includes(q) ||
            (o.paymentStatus || "").toLowerCase().includes(q) ||
            (o.status || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex flex-col flex-1 h-full">
                <Header title="Vendor Payment Status" />

                <main className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">

                        {/* 🔍 Search */}
                        <div className="flex items-center gap-2 p-4">
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search vendor, item, category, status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-96 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                            />
                        </div>

                        {/* 📊 Table */}
                        <table className="w-full min-w-[1100px] border border-gray-200 border-collapse">
                            <thead className="bg-gray-100 text-gray-700 text-sm">
                                <tr>
                                    <th className="px-4 py-3 border">#</th>
                                    <th className="px-4 py-3 border">Vendor ID</th>
                                    <th className="px-4 py-3 border">Item</th>
                                    <th className="px-4 py-3 border">Category</th>
                                    <th className="px-4 py-3 border">Celebrant</th>
                                    <th className="px-4 py-3 border">Event Date</th>
                                    <th className="px-4 py-3 border">Price (₹)</th>
                                    <th className="px-4 py-3 border">Order Status</th>
                                    <th className="px-4 py-3 border">Payment Status</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm">
                                {filteredOrders.map((row, i) => (
                                    <tr key={row._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{i + 1}</td>

                                        <td className="px-4 py-2 border">
                                            {row.vendorId || "-"}
                                        </td>

                                        <td className="px-4 py-2 border">
                                            {row.itemName || "-"}
                                        </td>

                                        <td className="px-4 py-2 border">
                                            {row.category} / {row.subcategory}
                                        </td>

                                        <td className="px-4 py-2 border">
                                            {row.celebrantName || "-"}
                                        </td>

                                        <td className="px-4 py-2 border">
                                            {row.eventDate || "-"}
                                        </td>

                                        <td className="px-4 py-2 border font-medium">
                                            ₹{Number(row.price || 0).toFixed(2)}
                                        </td>

                                        <td className="px-4 py-2 border">
                                            {row.status}
                                        </td>

                                        <td className="px-4 py-2 border">
                                            <span
                                                className={
                                                    row.paymentStatus === "Completed" || row.paymentStatus === "Full Paid"
                                                        ? "text-green-600 font-semibold"
                                                        : row.paymentStatus === "Advance Paid"
                                                            ? "text-blue-600 font-semibold"
                                                            : row.paymentStatus === "Cancelled"
                                                                ? "text-red-600 font-semibold"
                                                                : "text-yellow-600 font-semibold"
                                                }
                                            >
                                                {row.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default VendorPaymentStatus;
