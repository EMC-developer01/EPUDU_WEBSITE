import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";

const ClientPaymentStatus = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [payments, setPayments] = useState([])

    useEffect(() => {
        fetch("http://localhost:4000/api/payment/all")
            .then(res => res.json())
            .then(setPayments);
    }, []);

    const filteredPayments = payments.filter(p => {
        const q = search.toLowerCase();

        return (
            (p.clientName || "").toLowerCase().includes(q) ||
            (p.eventType || "").toLowerCase().includes(q) ||
            (p.eventId || "").toLowerCase().includes(q) ||
            (p.paymentId || "").toLowerCase().includes(q) ||
            String(p.amount || "").includes(q) ||
            (p.eventStatus || "").toLowerCase().includes(q) ||
            (p.status || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Right side */}
            <div className="flex flex-col flex-1 h-full ">
                <Header title="Client Payment Status" />

                <main className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-6">
                    <div className="w-full min-w-0 space-y-6">
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                            <div className="flex items-center gap-2 p-4">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search client, event, payment, amount, status..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-96 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                                />
                            </div>

                            <table className="w-full min-w-[900px] border border-gray-200 border-collapse">
                                <thead className="bg-gray-100 text-gray-700 text-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-left border">#</th>
                                        <th className="px-4 py-3 text-left border">Client Name</th>
                                        <th className="px-4 py-3 text-left border">Event Type</th>
                                        <th className="px-4 py-3 text-left border">Date</th>
                                        <th className="px-4 py-3 text-left border">Event ID</th>
                                        <th className="px-4 py-3 text-left border">Payment ID</th>
                                        <th className="px-4 py-3 text-left border">Amount paied (₹)</th>
                                        <th className="px-4 py-3 text-left border">Booking Status</th>
                                        <th className="px-4 py-3 text-left border">Payment Status</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm">
                                    {filteredPayments.map((row, i) => (
                                        <tr key={row._id || i} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-2 border">{i + 1}</td>

                                            <td className="px-4 py-2 border">
                                                {row.clientName || "-"}
                                            </td>

                                            <td className="px-4 py-2 border">
                                                {row.eventType || "-"}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {row.date || "-"}
                                            </td>

                                            <td className="px-4 py-2 border truncate max-w-[160px]">
                                                {row.eventId || "-"}
                                            </td>

                                            <td className="px-4 py-2 border truncate max-w-[160px]">
                                                {row.paymentId || "-"}
                                            </td>

                                            <td className="px-4 py-2 border font-medium">
                                                ₹{Number(row.amount || 0).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-2 border">
                                                {row.bookingStatus || "Pending"}
                                            </td>

                                            <td className="px-4 py-2 border">
                                                <span
                                                    className={
                                                        row.status === "success"
                                                            ? "text-green-600 font-semibold"
                                                            : "text-yellow-600 font-semibold"
                                                    }
                                                >
                                                    {row.status === "success" ? "Paid" : "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}; 

export default ClientPaymentStatus;
