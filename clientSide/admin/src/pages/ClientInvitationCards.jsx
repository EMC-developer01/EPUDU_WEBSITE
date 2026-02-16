'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit, Power, Image as ImageIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;


const API = `${API_URL}/api/admin/client-invitation`;
const IMAGE_BASE = `${API_URL}`;

export default function ClientInvitationCards() {
    const [cards, setCards] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [preview, setPreview] = useState(null);

    const [statusFilter, setStatusFilter] = useState("all");
    const [eventFilter, setEventFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        image: null,
        cardName: "",
        eventName: "",
        description: "",
        isActive: true,
    });

    const fetchCards = async () => {
        const res = await axios.get(`${API}/all`);
        setCards(res.data);
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setForm({ ...form, image: files[0] });
            setPreview(URL.createObjectURL(files[0]));
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));

        if (editingId) {
            await axios.put(`${API}/update/${editingId}`, formData);
        } else {
            await axios.post(`${API}/add`, formData);
        }

        resetForm();
        fetchCards();
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            image: null,
            cardName: item.cardName,
            eventName: item.eventName,
            description: item.description,
            isActive: item.isActive,
        });
        setPreview(`${IMAGE_BASE}${item.image}`);
    };

    const toggleStatus = async (id, status) => {
        await axios.patch(`${API}/status/${id}`);
        fetchCards();
    };

    const resetForm = () => {
        setForm({ image: null, cardName: "", eventName: "", description: "", isActive: true });
        setEditingId(null);
        setPreview(null);
    };

    const filteredCards = cards
        .filter(c => statusFilter === "all" ? true : statusFilter === "active" ? c.isActive : !c.isActive)
        .filter(c => eventFilter === "all" ? true : c.eventName === eventFilter)
        .filter(c => c.cardName.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Client Invitation Cards" />

                <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT FORM */}
                        <div className="bg-white rounded-xl shadow-md border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon size={18} />
                                {editingId ? "Edit Card" : "Add Invitation Card"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input type="file" name="image" accept="image/*" onChange={handleChange} className="border rounded-lg p-2 w-full" required={!editingId} />
                                {preview && <img src={preview} className="w-full h-40 object-cover rounded-lg border" />}

                                <input name="cardName" value={form.cardName} onChange={handleChange} placeholder="Card Name" className="border rounded-lg p-2 w-full" required />
                                <select name="eventName" value={form.eventName} onChange={handleChange} className="border rounded-lg p-2 w-full" required>
                                    <option value="">Select Event</option>
                                    <option value="Birthday">Birthday</option>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Functions">Functions</option>
                                </select>
                                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="border rounded-lg p-2 w-full" />
                                <select name="isActive" value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === "true" })} className="border rounded-lg p-2 w-full">
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>

                                <Button className="w-full">{editingId ? "Update Card" : "Add Card"}</Button>
                            </form>
                        </div>

                        {/* RIGHT TABLE */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border overflow-x-auto">
                            <div className="p-4 border-b space-y-3">
                                <div className="flex flex-wrap gap-3 justify-between">
                                    <h2 className="text-lg font-semibold">Invitation Cards</h2>
                                    <div className="flex gap-2 flex-wrap">
                                        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded-lg px-3 py-2" />
                                        <select value={eventFilter} onChange={e => setEventFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                                            <option value="all">All Events</option>
                                            <option value="Birthday">Birthday</option>
                                            <option value="Wedding">Wedding</option>
                                            <option value="Functions">Functions</option>
                                        </select>
                                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <Table>
                                <TableCaption>Invitation Cards uploaded by client</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>S.No</TableHead>
                                        <TableHead>Preview</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredCards.length ? filteredCards.map((item, index) => (
                                        <TableRow key={item._id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell><img src={`${IMAGE_BASE}${item.image}`} className="w-16 h-16 rounded-lg object-cover" /></TableCell>
                                            <TableCell>{item.cardName}</TableCell>
                                            <TableCell>{item.eventName}</TableCell>
                                            <TableCell className="max-w-xs truncate">{item.description || "-"}</TableCell>
                                            <TableCell><span className={`px-3 py-1 rounded-full text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.isActive ? "Active" : "Inactive"}</span></TableCell>
                                            <TableCell className="text-center flex justify-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit size={14} /></Button>
                                                <Button size="sm" variant={item.isActive ? "destructive" : "default"} onClick={() => toggleStatus(item._id, item.isActive)}><Power size={14} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-6 text-gray-500">No cards found 😕</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
