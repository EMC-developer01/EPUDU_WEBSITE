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
import { Edit, Trash, Package } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

const API = `${API_URL}/api/vendor/items`;
const IMAGE_BASE = `${MEDIA_URL}/uploads/vendorItems`;

function VendorItems() {
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [preview, setPreview] = useState(null);
    const vendor = JSON.parse(localStorage.getItem("vendor"));

    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        image: null,
        name: "",
        price: "",
        discount: "",
        description: "",
        category: "",
        subcategory: "",
    });

    /* FETCH ITEMS */
    const fetchItems = async () => {
        const res = await axios.get(`${API}/getitems?vendorId=${vendor?._id}`);
        setItems(res.data.items);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    /* HANDLE INPUT */
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            setForm({ ...form, image: files[0] });
            setPreview(URL.createObjectURL(files[0]));
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    /* ADD / UPDATE ITEM */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        Object.keys(form).forEach((key) => {
            formData.append(key, form[key]);
        });

        formData.append("vendorId", vendor?._id);

        if (editingId) {
            await axios.put(`${API}/update/${editingId}`, formData);
        } else {
            await axios.post(`${API}/additem`, formData);
        }

        resetForm();
        fetchItems();
    };

    /* EDIT */
    const handleEdit = (item) => {
        setEditingId(item._id);

        setForm({
            image: null,
            name: item.name,
            price: item.price,
            discount: item.discount,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory,
        });

        setPreview(`${IMAGE_BASE}/${item.image}`);
    };

    /* DELETE */
    const handleDelete = async (id) => {
        if (!confirm("Delete this item?")) return;

        await axios.delete(`${API}/delete/${id}`);
        fetchItems();
    };

    /* RESET */
    const resetForm = () => {
        setForm({
            image: null,
            name: "",
            price: "",
            discount: "",
            description: "",
            category: "",
            subcategory: "",
        });

        setEditingId(null);
        setPreview(null);
    };

    /* SEARCH FILTER */
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Vendor Items" />

                <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* FORM */}
                        <div className="bg-white rounded-xl shadow-md border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package size={18} />
                                {editingId ? "Edit Item" : "Add Item"}
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
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Item Name"
                                    className="border rounded-lg p-2 w-full"
                                    required
                                />

                                <input
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    placeholder="Price"
                                    type="number"
                                    className="border rounded-lg p-2 w-full"
                                    required
                                />

                                <input
                                    name="discount"
                                    value={form.discount}
                                    onChange={handleChange}
                                    placeholder="Discount %"
                                    type="number"
                                    className="border rounded-lg p-2 w-full"
                                />

                                <input
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="Category"
                                    className="border rounded-lg p-2 w-full"
                                />

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Description"
                                    className="border rounded-lg p-2 w-full"
                                />

                                <Button className="w-full bg-indigo-600 text-white">
                                    {editingId ? "Update Item" : "Add Item"}
                                </Button>

                            </form>
                        </div>

                        {/* TABLE */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border overflow-x-auto">

                            <div className="p-4 border-b flex justify-between">
                                <h2 className="text-lg font-semibold">Vendor Items</h2>

                                <input
                                    placeholder="Search item..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border rounded-lg px-3 py-2"
                                />
                            </div>

                            <Table>
                                <TableCaption>Vendor Item List</TableCaption>

                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>

                                    {filteredItems.length ? (
                                        filteredItems.map((item, i) => (
                                            <TableRow key={item._id}>

                                                <TableCell>{i + 1}</TableCell>

                                                <TableCell>
                                                    <img
                                                        src={`${IMAGE_BASE}/${item.image}`}
                                                        className="w-14 h-10 object-cover rounded"
                                                    />
                                                </TableCell>

                                                <TableCell>{item.name}</TableCell>

                                                <TableCell>₹{item.price}</TableCell>

                                                <TableCell>{item.discount || 0}%</TableCell>

                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">

                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleEdit(item)}
                                                            className="bg-indigo-600 text-white"
                                                        >
                                                            <Edit size={14} />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(item._id)}
                                                        >
                                                            <Trash size={14} />
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
                                                No items found
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

export default VendorItems;