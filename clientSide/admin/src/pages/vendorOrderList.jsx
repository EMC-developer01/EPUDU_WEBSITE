import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import { Search, Edit } from "lucide-react";

export default function VendorOrderList() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        birthdayId: "",
        category: "",
        subcategory: "",
        itemName: "",
        vendorId: "",
        clientId: "",
        status: "",
        itemId: "",
        paymentStatus: "",
        search: "",
    });

    // Pagination states
    const [page, setPage] = useState(1);
    const limit = 50; // items per page

    const [loading, setLoading] = useState(false);

    // Edit modal state
    const [editOrder, setEditOrder] = useState(null);
    const BASE_URL = "http://localhost:4000/api/vendor/orders";

    // Fetch orders (server may ignore some params if not implemented — we still send them)
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(BASE_URL, {
                params: {
                    ...filters,
                    search: filters.search || undefined,
                    // if your backend supports page & limit, you can pass them here:
                    // page, limit
                },
            });

            const data = res.data?.data ?? [];
            setOrders(data);
            setTotal(res.data?.total ?? data.length);
        } catch (error) {
            console.error("❌ Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when filters change
    useEffect(() => {
        fetchOrders();
        // reset page on new filters
        setPage(1);
    }, [
        filters.search,
        filters.status,
        filters.paymentStatus,
        filters.category,
        filters.subcategory,
        filters.itemName,
        filters.itemId,
        filters.vendorId,
        filters.clientId,
        filters.birthdayId,
    ]);

    // update handlers (use existing endpoints)
    const handlePaymentUpdate = async (orderId, newStatus) => {
        try {
            await axios.patch(`${BASE_URL}/${orderId}/payment`, {
                paymentStatus: newStatus,
                itemId: "", // optional: send itemId if your API supports item-level payment
            });
            await fetchOrders();
        } catch (err) {
            console.error("Payment update failed:", err);
        }
    };

    const handleOrderUpdate = async (orderId, newStatus) => {
        try {
            await axios.patch(`${BASE_URL}/${orderId}/status`, { status: newStatus });
            await fetchOrders();
        } catch (err) {
            console.error("Order update failed:", err);
        }
    };

    // modal save (updates both status & payment using existing endpoints)
    const handleModalSave = async () => {
        if (!editOrder) return;
        try {
            const { _id, status, paymentStatus } = editOrder;
            // update status then payment (order of operations doesn't matter much)
            await handleOrderUpdate(_id, status);
            await handlePaymentUpdate(_id, paymentStatus);
            setEditOrder(null);
        } catch (err) {
            console.error("Modal save failed:", err);
        }
    };

    // client-side pagination (slice)
    const indexOfFirstItem = (page - 1) * limit;
    const indexOfLastItem = indexOfFirstItem + limit;
    const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.max(1, Math.ceil((total || orders.length) / limit));

    return (
        <div className="flex w-screen h-screen bg-gray-50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header title="Vendor Orders" />

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-3 items-center">
                        <div className="flex items-center border rounded px-2 py-1 bg-gray-100">
                            <Search size={18} className="text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search (item, celebrant, phone, email)..."
                                className="bg-transparent outline-none px-2"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="Client ID"
                            className="px-3 py-2 border rounded"
                            value={filters.clientId}
                            onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Vendor ID"
                            className="px-3 py-2 border rounded"
                            value={filters.vendorId}
                            onChange={(e) => setFilters({ ...filters, vendorId: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Birthday ID"
                            className="px-3 py-2 border rounded"
                            value={filters.birthdayId}
                            onChange={(e) => setFilters({ ...filters, birthdayId: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Item ID"
                            className="px-3 py-2 border rounded"
                            value={filters.itemId}
                            onChange={(e) => setFilters({ ...filters, itemId: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Item Name"
                            className="px-3 py-2 border rounded"
                            value={filters.itemName}
                            onChange={(e) => setFilters({ ...filters, itemName: e.target.value })}
                        />

                        <select
                            className="px-3 py-2 border rounded"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="">All Categories</option>
                            <option value="decoration">Decoration</option>
                            <option value="foodArrangements">Food Arrangements</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="photography">Photography</option>
                            <option value="returnGifts">Return Gifts</option>
                            <option value="eventStaff">Event Staff</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Subcategory"
                            className="px-3 py-2 border rounded"
                            value={filters.subcategory}
                            onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                        />

                        <select
                            className="px-3 py-2 border rounded"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="CancelledByVendor">CancelledByVendor</option>
                            <option value="CancelledByClient">CancelledByClient</option>
                        </select>

                        <select
                            className="px-3 py-2 border rounded"
                            value={filters.paymentStatus}
                            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                        >
                            <option value="">All Payment</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Advance Paid">Advance Paid</option>
                            <option value="Full Paid">Full Paid</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        <Button
                            onClick={() => {
                                // clear filters
                                setFilters({
                                    birthdayId: "",
                                    clientId: "",
                                    vendorId: "",
                                    itemId: "",
                                    category: "",
                                    subcategory: "",
                                    itemName: "",
                                    status: "",
                                    paymentStatus: "",
                                    price: "",
                                    search: "",
                                });
                            }}
                        >
                            Clear
                        </Button>
                    </div>

                    {/* Info + Loading */}
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Showing {orders.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                            {Math.min(indexOfLastItem, orders.length)} of {total || orders.length}
                        </div>
                        <div className="text-sm text-gray-600">{loading ? "Loading..." : ""}</div>
                    </div>

                    {/* Table */}
                    <div className="bg-white shadow rounded-lg overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>S.No</TableHead>
                                    <TableHead>CelebrantName</TableHead>
                                    <TableHead>Client ID</TableHead>
                                    <TableHead>Vendor ID</TableHead>
                                    <TableHead>Birthday ID</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Subcategory</TableHead>
                                    <TableHead>Item ID</TableHead>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {currentItems.map((o, index) => (
                                    <TableRow key={o._id || `${o.birthdayId}-${o.itemId}-${index}`}>
                                        <TableCell>{indexOfFirstItem + index + 1}</TableCell>

                                        <TableCell>{o.celebrantName || "-"}</TableCell>
                                        <TableCell>{o.clientId || "-"}</TableCell>
                                        <TableCell>{o.vendorId || "-"}</TableCell>
                                        <TableCell>{o.birthdayId || "-"}</TableCell>

                                        <TableCell>{o.category || "-"}</TableCell>
                                        <TableCell>{o.subcategory || "-"}</TableCell>

                                        <TableCell>{o.itemId || "-"}</TableCell>
                                        <TableCell>{o.itemName || "-"}</TableCell>

                                        <TableCell>₹{o.price ?? 0}</TableCell>

                                        <TableCell>{o.status}</TableCell>

                                        <TableCell>{o.paymentStatus}</TableCell>

                                        <TableCell>
                                            <Button
                                                className="bg-blue-600 text-white"
                                                onClick={() => setEditOrder({ ...o })}
                                            >
                                                <Edit size={14} className="inline-block mr-1" />
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {currentItems.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center py-8">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-2">
                            <Button
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-2 bg-gray-200"
                            >
                                Previous
                            </Button>

                            <Button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-2 bg-gray-200"
                            >
                                Next
                            </Button>
                        </div>

                        <div>
                            Page {page} of {totalPages}
                        </div>
                    </div>

                    {/* Edit Modal (Status + Payment editable) */}
                    {editOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Edit Order</h3>
                                    <button
                                        className="text-gray-600"
                                        onClick={() => setEditOrder(null)}
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm text-gray-600">Client ID</label>
                                        <div className="p-2 border rounded">{editOrder.clientId || "-"}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Vendor ID</label>
                                        <div className="p-2 border rounded">{editOrder.vendorId || "-"}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Birthday ID</label>
                                        <div className="p-2 border rounded">{editOrder.birthdayId || "-"}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Item ID</label>
                                        <div className="p-2 border rounded">{editOrder.itemId || "-"}</div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="text-sm text-gray-600">Item Name</label>
                                        <div className="p-2 border rounded">{editOrder.itemName || "-"}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Category</label>
                                        <div className="p-2 border rounded">{editOrder.category || "-"}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Subcategory</label>
                                        <div className="p-2 border rounded">{editOrder.subcategory || "-"}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Price</label>
                                        <div className="p-2 border rounded">₹{editOrder.price ?? 0}</div>
                                    </div>

                                    {/* Editable fields */}
                                    <div>
                                        <label className="text-sm text-gray-600">Status</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={editOrder.status}
                                            onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                            <option value="CancelledByVendor">CancelledByVendor</option>
                                            <option value="CancelledByClient">CancelledByClient</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-600">Payment Status</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={editOrder.paymentStatus}
                                            onChange={(e) =>
                                                setEditOrder({ ...editOrder, paymentStatus: e.target.value })
                                            }
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Advance Paid">Advance Paid</option>
                                            <option value="Full Paid">Full Paid</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3">
                                    <Button onClick={() => setEditOrder(null)}>Cancel</Button>
                                    <Button className="bg-blue-600 text-white" onClick={handleModalSave}>
                                        Save changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
