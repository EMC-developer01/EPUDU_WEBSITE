import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "@/Components/Sidebar";
import Header from "@/Components/Header";

const VendorPaymentStatus = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("http://localhost:4000/api/payment/all")
            .then((res) => res.json())
            .then(setPayments)
            .catch(console.error);
    }, []);

    const filteredPayments = payments.filter((p) => {
        const q = search.toLowerCase();
        return (
            (p.vendorName || "").toLowerCase().includes(q) ||
            (p.serviceType || "").toLowerCase().includes(q) ||
            (p.vendorId || "").toLowerCase().includes(q) ||
            (p.paymentId || "").toLowerCase().includes(q) ||
            String(p.amount || "").includes(q) ||
            (p.status || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex h-screen w-screen bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex flex-col flex-1 h-full">
                <Header title="Vendor Payment Status" />

                <main className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                        <div className="flex items-center gap-2 p-4">
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search vendor, service, payment, amount, status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-96 px-3 py-2 border rounded-md focus:outline-none focus:ring"
                            />
                        </div>

                        <table className="w-full min-w-[900px] border border-gray-200 border-collapse">
                            <thead className="bg-gray-100 text-gray-700 text-sm">
                                <tr>
                                    <th className="px-4 py-3 text-left border">#</th>
                                    <th className="px-4 py-3 text-left border">Vendor Name</th>
                                    <th className="px-4 py-3 text-left border">Service Type</th>
                                    <th className="px-4 py-3 text-left border">Date</th>
                                    <th className="px-4 py-3 text-left border">Vendor ID</th>
                                    <th className="px-4 py-3 text-left border">Payment ID</th>
                                    <th className="px-4 py-3 text-left border">Amount Paid (₹)</th>
                                    <th className="px-4 py-3 text-left border">Payment Status</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm">
                                {filteredPayments.map((row, i) => (
                                    <tr
                                        key={row._id || i}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-2 border">{i + 1}</td>
                                        <td className="px-4 py-2 border">{row.vendorName || "-"}</td>
                                        <td className="px-4 py-2 border">{row.serviceType || "-"}</td>
                                        <td className="px-4 py-2 border">{row.date || "-"}</td>
                                        <td className="px-4 py-2 border truncate max-w-[160px]">
                                            {row.vendorId || "-"}
                                        </td>
                                        <td className="px-4 py-2 border truncate max-w-[160px]">
                                            {row.paymentId || "-"}
                                        </td>
                                        <td className="px-4 py-2 border font-medium">
                                            ₹{Number(row.amount || 0).toFixed(2)}
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
                </main>

            </div>
        </div>
    );
};

export default VendorPaymentStatus;
