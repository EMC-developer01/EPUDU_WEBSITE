import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

const getRowClass = (eventDate) => {
    const today = new Date();
    const tomorrow = new Date();
    const dayAfterTomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const event = new Date(eventDate);

    if (isSameDay(event, today)) return "bg-red-300";
    if (isSameDay(event, tomorrow)) return "bg-orange-300";
    if (isSameDay(event, dayAfterTomorrow)) return "bg-yellow-300";

    return "";
};

const getPriority = (eventDate) => {
    const today = new Date();
    const tomorrow = new Date();
    const dayAfterTomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const event = new Date(eventDate);

    if (isSameDay(event, today)) return 1;
    if (isSameDay(event, tomorrow)) return 2;
    if (isSameDay(event, dayAfterTomorrow)) return 3;

    return 4; // other dates
};

const VendorOrdersList = () => {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [statusFilter, setStatusFilter] = useState("all");

    let vendorId = localStorage.getItem("vendorId");
    vendorId = vendorId.replace(/"/g, "");


    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Popup
    const [editOrder, setEditOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:4000/api/vendor/orders?vendorId=${vendorId}`
            );
            setOrders(res.data.data || []);
        } catch (err) {
            console.log("Error fetching vendor orders", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 20000);
        return () => clearInterval(interval);
    }, []);

    // Update Status API
    const updateStatus = async () => {
        if (!editOrder) return;

        try {
            await axios.patch(
                `http://localhost:4000/api/vendor/orders/${editOrder._id}/status`,
                { status: newStatus }
            );

            setEditOrder(null);
            loadOrders();
        } catch (err) {
            console.log("Error updating status", err);
        }
    };

    // Status Colors
    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "text-green-600 font-semibold";
            case "Pending":
                return "text-yellow-600 font-semibold";
            case "CancelledByVendor":
            case "CancelledByClient":
                return "text-red-600 font-semibold";
            default:
                return "text-gray-700";
        }
    };

    const filteredOrders = orders
        .filter(o => {
            const searchText = search.toLowerCase();
            const matchesSearch =
                o.itemName?.toLowerCase().includes(searchText) ||
                o.category?.toLowerCase().includes(searchText) ||
                o.venueCity?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "all" || o.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const p1 = getPriority(a.eventDate);
            const p2 = getPriority(b.eventDate);

            if (p1 !== p2) return p1 - p2;

            // fallback date sort
            return sortBy === "latest"
                ? new Date(b.eventDate) - new Date(a.eventDate)
                : new Date(a.eventDate) - new Date(b.eventDate);
        });

    return (
        <div className="min-h-screen w-screen bg-gray-50 m-0 p-0">

            {typeof Header === "function" && <Header />}

            <main className="w-full flex flex-col gap-6 sm:gap-8">

                <h1 className="text-3xl md:text-4xl font-extrabold px-6">Vendor Orders</h1>

                {/* SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6">
                    <div className="rounded-xl bg-white shadow p-5">
                        <p className="text-gray-500">Total Orders</p>
                        <p className="text-4xl font-bold">{orders.length}</p>
                    </div>

                    <div className="rounded-xl bg-white shadow p-5">
                        <p className="text-gray-500">Completed</p>
                        <p className="text-4xl font-bold">
                            {orders.filter(o => o.status === "Completed").length}
                        </p>
                    </div>

                    <div className="rounded-xl bg-white shadow p-5">
                        <p className="text-gray-500">Pending</p>
                        <p className="text-4xl font-bold">
                            {orders.filter(o => o.status === "Pending").length}
                        </p>
                    </div>
                </div>

                {/* TABLE */}
                <section className="rounded-xl bg-white shadow p-6 w-full px-6">
                    <h2 className="text-xl font-semibold mb-4">Latest Orders</h2>
                    <div className="flex flex-col md:flex-row gap-4 px-6">

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search by item, category, city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border px-4 py-2 rounded-lg w-full md:w-1/3"
                        />

                        {/* Sort by Date */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border px-4 py-2 rounded-lg"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>

                        {/* Filter by Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border px-4 py-2 rounded-lg"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="CancelledByVendor">Cancelled by Vendor</option>
                            <option value="CancelledByClient">Cancelled by Client</option>
                        </select>

                    </div>

                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[1300px]">
                            <thead>
                                <tr className="bg-gray-100 text-sm">
                                    <th className="p-3">S.No</th>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Venue</th>
                                    <th className="p-3">Extra</th>
                                    <th className="p-3">Payment</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.map((o, index) => (
                                    <tr key={o._id} className={`border-b ${getRowClass(o.eventDate)}`}>
                                        <td className="p-3">{index + 1}</td>

                                        <td className="p-3 font-medium">{o.itemName}</td>
                                        <td className="p-3 capitalize">{o.category}</td>
                                        <td className="p-3">₹{o.price}</td>

                                        <td className="p-3">
                                            {new Date(o.eventDate).toLocaleDateString()}
                                        </td>

                                        <td className="p-3">
                                            {o.venueAddress}, {o.venueCity}
                                        </td>

                                        <td className="p-3 text-sm text-gray-700">
                                            {o.category === "foodArrangements" && (
                                                <span>Guests: {o.guestCount}</span>
                                            )}

                                            {o.category === "returnGifts" && (
                                                <span>
                                                    Budget: ₹{o.giftBudget} <br />
                                                    Qty: {o.giftQuantity}
                                                </span>
                                            )}

                                            {!["foodArrangements", "returnGifts"].includes(o.category) && (
                                                <span>-</span>
                                            )}
                                        </td>

                                        <td className="p-3 text-blue-600 font-semibold">{o.paymentStatus}</td>

                                        <td className={`p-3 ${getStatusColor(o.status)}`}>{o.status}</td>

                                        <td className="p-3">
                                            {["Completed", "CancelledByVendor", "CancelledByClient"].includes(o.status) ? (
                                                <button
                                                    className="px-3 py-1 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                                                    disabled
                                                >
                                                    Done
                                                </button>
                                            ) : (
                                                <button
                                                    className="px-3 py-1 bg-black text-white rounded-lg"
                                                    onClick={() => {
                                                        setEditOrder(o);
                                                        setNewStatus(o.status);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>


                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE VIEW */}
                    <div className="md:hidden space-y-4">
                        {filteredOrders.map((o, index) => (
                            <div
                                key={o._id}
                                className={`border rounded-xl p-4 shadow-sm ${getRowClass(o.eventDate)}`}
                            >
                                <p className="text-gray-500 text-sm">S.No: {index + 1}</p>
                                <p className="font-bold text-lg">{o.itemName}</p>
                                <p className="text-gray-600">{o.category}</p>
                                <p className="text-sm"><strong>Price:</strong> ₹{o.price}</p>
                                <p className="text-sm">
                                    <strong>Date:</strong> {new Date(o.eventDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm"><strong>Venue:</strong> {o.venueAddress}</p>

                                {o.category === "foodArrangements" && (
                                    <p className="text-sm"><strong>Guests:</strong> {o.guestCount}</p>
                                )}

                                {o.category === "returnGifts" && (
                                    <>
                                        <p className="text-sm"><strong>Budget:</strong> ₹{o.giftBudget}</p>
                                        <p className="text-sm"><strong>Qty:</strong> {o.giftQuantity}</p>
                                    </>
                                )}

                                <p className="text-sm"><strong>Payment:</strong> {o.paymentStatus}</p>
                                <p className={`text-sm ${getStatusColor(o.status)}`}><strong>Status:</strong> {o.status}</p>

                                {["Completed", "CancelledByVendor", "CancelledByClient"].includes(o.status) ? (
                                    <button
                                        className="mt-2 px-3 py-1 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                                        disabled
                                    >
                                        Done
                                    </button>
                                ) : (
                                    <button
                                        className="mt-2 px-3 py-1 bg-black text-white rounded-lg"
                                        onClick={() => {
                                            setEditOrder(o);
                                            setNewStatus(o.status);
                                        }}
                                    >
                                        Edit
                                    </button>
                                )}


                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* POPUP */}
            {editOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-80">
                        <h3 className="text-lg font-bold mb-4">Update Status</h3>

                        <select
                            className="w-full border p-2 rounded"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="CancelledByVendor">Cancelled by Vendor</option>
                            <option value="CancelledByClient">Cancelled by Client</option>
                        </select>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-3 py-1 bg-gray-300 rounded"
                                onClick={() => setEditOrder(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="px-3 py-1 bg-blue-600 text-white rounded"
                                onClick={updateStatus}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrdersList;
