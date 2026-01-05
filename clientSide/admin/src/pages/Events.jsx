import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Save, X, Search } from "lucide-react";

export default function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filters, setFilters] = useState({
        name: "",
        phone: "",
        eventType: "",
        bookingStatus: "",
        eventStatus: "",
        eventDate: "",
        eventTime: "",
    });

    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const BASE_URL = "http://localhost:4000/api/client";

    // Fetch events
    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/birthday/all`);
            setEvents(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error("❌ Error fetching events:", err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filtering Logic
    useEffect(() => {
        let data = events;

        if (filters.name)
            data = data.filter((e) =>
                e.celebrantName?.toLowerCase().includes(filters.name.toLowerCase())
            );

        if (filters.phone)
            data = data.filter((e) =>
                e.phone?.toLowerCase().includes(filters.phone.toLowerCase())
            );

        if (filters.eventType)
            data = data.filter((e) =>
                e.eventType?.toLowerCase().includes(filters.eventType.toLowerCase())
            );

        if (filters.bookingStatus)
            data = data.filter((e) =>
                e.bookingStatus
                    ?.toLowerCase()
                    .includes(filters.bookingStatus.toLowerCase())
            );

        if (filters.eventStatus)
            data = data.filter((e) =>
                e.eventStatus
                    ?.toLowerCase()
                    .includes(filters.eventStatus.toLowerCase())
            );

        if (filters.eventDate) {
            data = data.filter((e) =>
                String(e.eventDate).startsWith(filters.eventDate)
            );
        }

        if (filters.eventTime)
            data = data.filter((e) =>
                e.eventTime
                    ?.toLowerCase()
                    .includes(filters.eventTime.toLowerCase())
            );

        setFiltered(data);
    }, [filters, events]);

    const handleEdit = (event) => navigate(`/events/eventedits/${event._id}`);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!editingEvent) return;
        try {
            await axios.put(
                `${BASE_URL}/birthday/update/${editingEvent._id}`,
                formData
            );
            setEditingEvent(null);
            setFormData({});
            fetchEvents();
        } catch (err) {
            console.error("❌ Error saving event:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await axios.delete(`${BASE_URL}/delete/${id}`);
            fetchEvents();
        } catch (err) {
            console.error("❌ Error deleting event:", err);
        }
    };

    const handleCancel = () => {
        setEditingEvent(null);
        setFormData({});
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header title="Events Management" />

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md border p-4 sm:p-6 flex flex-wrap gap-4 items-center">

                        {/* Name */}
                        <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={filters.name}
                                onChange={(e) =>
                                    setFilters({ ...filters, name: e.target.value })
                                }
                                className="border rounded-lg pl-10 pr-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Phone */}
                        <input
                            type="text"
                            placeholder="Phone..."
                            value={filters.phone}
                            onChange={(e) =>
                                setFilters({ ...filters, phone: e.target.value })
                            }
                            className="border rounded-lg px-3 py-2 w-full sm:w-auto min-w-[200px] outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {/* Event Date */}
                        <input
                            type="text"
                            value={filters.eventDate}
                            onChange={(e) =>
                                setFilters({ ...filters, eventDate: e.target.value })
                            }
                            className="border rounded-lg px-3 py-2 w-full sm:w-auto min-w-[200px] outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        {/* EventTime */}
                        <input
                            type="text"
                            value={filters.eventTime}
                            onChange={(e) =>
                                setFilters({ ...filters, eventTime: e.target.value })
                            }
                            className="border rounded-lg px-3 py-2 w-full sm:w-auto min-w-[200px] outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        {/* Event Type */}
                        <select
                            value={filters.eventType}
                            onChange={(e) =>
                                setFilters({ ...filters, eventType: e.target.value })
                            }
                            className="border rounded-lg px-3 py-2 w-full sm:w-auto min-w-[200px] outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">All Types</option>
                            <option value="birthday">Birthday</option>
                            <option value="wedding">Wedding</option>
                            <option value="function">Function</option>
                        </select>

                        {/* Booking Status */}
                        <select
                            value={filters.bookingStatus}
                            onChange={(e) =>
                                setFilters({ ...filters, bookingStatus: e.target.value })
                            }
                            className="border rounded-lg px-3 py-2 w-full sm:w-auto min-w-[200px] outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">All Booking Status</option>
                            <option value="Booked">Booked</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancel">Cancelled</option>
                        </select>

                        {/* Event Status - NEW */}
                        <select
                            value={filters.eventStatus}
                            onChange={(e) =>
                                setFilters({ ...filters, eventStatus: e.target.value })
                            }
                            className="border rounded-lg px-3 py-2 w-full sm:w-auto min-w-[200px] outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">All Event Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
                        <Table className="min-w-full text-sm md:text-base">
                            <TableCaption className="text-gray-500 text-sm py-4">
                                List of all registered events.
                            </TableCaption>

                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Event Type</TableHead>
                                    <TableHead>Event Date</TableHead>
                                    <TableHead>Event Time</TableHead>
                                    <TableHead>Venue</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Booking Status</TableHead>
                                    <TableHead>Event Status</TableHead>
                                    <TableHead className="text-center w-48">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filtered.length > 0 ? (
                                    filtered.map((ev, index) => (
                                        <TableRow key={ev._id} className="hover:bg-gray-50">
                                            <TableCell className="text-center">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell>{ev.celebrantName || "-"}</TableCell>
                                            <TableCell>{ev.phone || "-"}</TableCell>
                                            <TableCell>{ev.eventType || "-"}</TableCell>
                                            <TableCell>{ev.eventDate || "-"}</TableCell>
                                            <TableCell>{ev.eventTime || "-"}</TableCell>
                                            <TableCell>{ev.venue?.name || "-"}</TableCell>

                                            <TableCell
                                                className={`font-medium ${ev.paymentStatus === "Full Paid"
                                                    ? "text-green-600"
                                                    : ev.paymentStatus === "Advance Paid"
                                                        ? "text-orange-500"
                                                        : "text-red-500"
                                                    }`}
                                            >
                                                {ev.paymentStatus || "-"}
                                            </TableCell>

                                            <TableCell
                                                className={`font-medium ${ev.bookingStatus === "Confirmed"
                                                    ? "text-green-600"
                                                    : ev.bookingStatus === "Pending"
                                                        ? "text-orange-500"
                                                        : "text-red-500"
                                                    }`}
                                            >
                                                {ev.bookingStatus || "-"}
                                            </TableCell>

                                            {/* ⭐ NEW EVENT STATUS COLUMN */}
                                            <TableCell
                                                className={`font-medium ${ev.eventStatus === "Completed"
                                                    ? "text-green-600"
                                                    : ev.eventStatus === "Ongoing"
                                                        ? "text-blue-600"
                                                        : "text-orange-500"
                                                    }`}
                                            >
                                                {ev.eventStatus || "Pending"}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-center gap-2 flex-wrap">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleEdit(ev)}
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleDelete(ev._id)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan="10"
                                            className="text-center py-6 text-gray-500"
                                        >
                                            No events found 😕
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </div>
        </div>
    );
}
