"use client";

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

const API = "http://localhost:4000/api/admin/client-banner";
const IMAGE_BASE = "http://localhost:4000/uploads/banners";

export default function ClientBanner() {
    const [banners, setBanners] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [preview, setPreview] = useState(null);

    const [form, setForm] = useState({
        image: null,
        title: "",
        subtitle: "",
        isActive: true,
    });

    /* ---------------- FETCH ---------------- */
    const fetchBanners = async () => {
        const res = await axios.get(`${API}/all`);
        setBanners(res.data);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    /* ---------------- HANDLERS ---------------- */
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
        Object.keys(form).forEach((key) =>
            formData.append(key, form[key])
        );

        editingId
            ? await axios.put(`${API}/update/${editingId}`, formData)
            : await axios.post(`${API}/add`, formData);

        resetForm();
        fetchBanners();
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            image: null,
            title: item.title,
            subtitle: item.subtitle,
            isActive: item.isActive,
        });
        setPreview(`${IMAGE_BASE}/${item.image}`);
    };

    const toggleStatus = async (id, status) => {
        await axios.patch(`${API}/status/${id}`, {
            isActive: !status,
        });
        fetchBanners();
    };

    const resetForm = () => {
        setForm({
            image: null,
            title: "",
            subtitle: "",
            isActive: true,
        });
        setEditingId(null);
        setPreview(null);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Client Banners" />

                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* FORM */}
                        <div className="bg-white rounded-xl shadow-md border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon size={18} />
                                {editingId ? "Edit Banner" : "Add Banner"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="border rounded-lg p-2 w-full"
                                    required={!editingId}
                                />

                                {preview && (
                                    <img
                                        src={preview}
                                        className="w-full h-40 object-cover rounded-lg border"
                                    />
                                )}

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Banner Title"
                                    className="border rounded-lg p-2 w-full"
                                    required
                                />

                                <input
                                    name="subtitle"
                                    value={form.subtitle}
                                    onChange={handleChange}
                                    placeholder="Banner Subtitle"
                                    className="border rounded-lg p-2 w-full"
                                />

                                <select
                                    name="isActive"
                                    value={form.isActive}
                                    onChange={(e) =>
                                        setForm({ ...form, isActive: e.target.value === "true" })
                                    }
                                    className="border rounded-lg p-2 w-full"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>

                                <Button className="w-full">
                                    {editingId ? "Update Banner" : "Add Banner"}
                                </Button>
                            </form>
                        </div>

                        {/* TABLE */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border overflow-x-auto">
                            <Table>
                                <TableCaption>Homepage Banners</TableCaption>

                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Preview</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {banners.length ? (
                                        banners.map((item, i) => (
                                            <TableRow key={item._id}>
                                                <TableCell>{i + 1}</TableCell>

                                                <TableCell>
                                                    <img
                                                        src={`${IMAGE_BASE}/${item.image}`}
                                                        className="w-20 h-12 rounded object-cover"
                                                    />
                                                </TableCell>

                                                <TableCell>{item.title}</TableCell>

                                                <TableCell>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs ${item.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {item.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit size={14} />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant={item.isActive ? "destructive" : "default"}
                                                            onClick={() =>
                                                                toggleStatus(item._id, item.isActive)
                                                            }
                                                        >
                                                            <Power size={14} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6">
                                                No banners found
                                            </TableCell>
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
