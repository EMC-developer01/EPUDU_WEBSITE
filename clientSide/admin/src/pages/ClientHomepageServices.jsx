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
const API_URL = import.meta.env.VITE_API_URL;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;


const API = `${API_URL}/api/admin/client-homepage-services`;
const IMAGE_BASE =`${MEDIA_URL}/homepageServices`;

function ClientHomepageServices() {
    const [services, setServices] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [preview, setPreview] = useState(null);

    /* filters */
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        image: null,
        title: "",
        desc: "",
        link: "",
        btn: "",
        isActive: true,
    });

    /* fetch */
    const fetchServices = async () => {
        const res = await axios.get(`${API}/all`);
        setServices(res.data); // ADMIN must see ALL
    };

    useEffect(() => {
        fetchServices();
    }, []);



    /* handlers */
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
        Object.keys(form).forEach((k) => formData.append(k, form[k]));

        editingId
            ? await axios.put(`${API}/update/${editingId}`, formData)
            : await axios.post(`${API}/add`, formData);

        resetForm();
        fetchServices();
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            image: null,
            title: item.title,
            desc: item.desc,
            link: item.link,
            btn: item.btn,
            isActive: item.isActive,
        });
        setPreview(`${IMAGE_BASE}/${item.image}`);
    };

    const toggleStatus = async (id, status) => {
        await axios.patch(`${API}/status/${id}`, { isActive: !status });
        fetchServices();
    };

    const resetForm = () => {
        setForm({
            image: null,
            title: "",
            desc: "",
            link: "",
            btn: "",
            isActive: true,
        });
        setEditingId(null);
        setPreview(null);
    };

    /* apply filters */
    const filteredServices = services
        .filter((s) =>
            statusFilter === "all"
                ? true
                : statusFilter === "active"
                    ? s.isActive
                    : !s.isActive
        )
        .filter(
            (s) =>
                s.title.toLowerCase().includes(search.toLowerCase()) ||
                s.desc.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Client Homepage Services" />

                <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT FORM */}
                        <div className="bg-white rounded-xl shadow-md border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon size={18} />
                                {editingId ? "Edit Service" : "Add Service"}
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
                                    placeholder="Service Title"
                                    className="border rounded-lg p-2 w-full"
                                    required
                                />

                                <textarea
                                    name="desc"
                                    value={form.desc}
                                    onChange={handleChange}
                                    placeholder="Description"
                                    rows={3}
                                    className="border rounded-lg p-2 w-full"
                                    required
                                />

                                <input
                                    name="link"
                                    value={form.link}
                                    onChange={handleChange}
                                    placeholder="Redirect Link (/photography)"
                                    className="border rounded-lg p-2 w-full"
                                    required
                                />

                                <input
                                    name="btn"
                                    value={form.btn}
                                    onChange={handleChange}
                                    placeholder="Button Text"
                                    className="border rounded-lg p-2 w-full"
                                    required
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
                                    {editingId ? "Update Service" : "Add Service"}
                                </Button>
                            </form>
                        </div>

                        {/* RIGHT TABLE */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border overflow-x-auto">
                            <div className="p-4 border-b flex flex-wrap justify-between gap-3">
                                <h2 className="text-lg font-semibold">Homepage Services</h2>

                                <div className="flex gap-2">
                                    <input
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="border rounded-lg px-3 py-2"
                                    />

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border rounded-lg px-3 py-2"
                                    >
                                        <option value="all">All</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <Table>
                                <TableCaption>Client homepage services</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Preview</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Link</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredServices.length ? (
                                        filteredServices.map((item, i) => (
                                            <TableRow key={item._id}>
                                                <TableCell>{i + 1}</TableCell>

                                                <TableCell>
                                                    <img
                                                        src={`${IMAGE_BASE}/${item.image}`}
                                                        className="w-14 h-14 rounded-lg object-cover"
                                                    />
                                                </TableCell>

                                                <TableCell>{item.title}</TableCell>
                                                <TableCell>{item.link}</TableCell>

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
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-6 text-gray-500"
                                            >
                                                No services found 😕
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
export default ClientHomepageServices;
