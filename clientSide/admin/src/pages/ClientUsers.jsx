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
import { UserPlus, Edit, Trash2, Save, X } from "lucide-react";

export default function ClientUsers() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", mobile: "", mail: "" });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;


    const BASE_URL = `${API_URL}/api/client/users`;

    // ✅ Fetch users
    const fetchUsers = async () => {
        try {
            const res = await axios.get(BASE_URL);
            setUsers(res.data);
        } catch (err) {
            console.error("❌ Error fetching users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            if (editingUser) {
                await axios.put(`${BASE_URL}/${editingUser._id}`, formData);
            } else {
                await axios.post(BASE_URL, formData);
            }
            setFormData({ name: "", mobile: "" });
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error("❌ Error saving user:", err);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, mobile: user.mobile, mail: user.mail });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            fetchUsers();
        } catch (err) {
            console.error("❌ Error deleting user:", err);
        }
    };

    const handleCancel = () => {
        setEditingUser(null);
        setFormData({ name: "", mobile: "" });
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            {/* ===== Sidebar ===== */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* ===== Main Content ===== */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header
                    title="Users Management"
                    actionButton={
                        <Button
                            onClick={() => {
                                setEditingUser(null);
                                setFormData({ name: "", mobile: "" });
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <UserPlus size={18} /> Add User
                        </Button>
                    }
                />

                {/* ===== Page Content ===== */}
                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
                    {/* ===== Form Section ===== */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
                        <h2 className="font-semibold text-gray-700 text-base sm:text-lg mb-3">
                            {editingUser ? "Edit User" : "Add New User"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="text"
                                name="mobile"
                                placeholder="Enter Mobile Number"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <input
                                type="text"
                                name="mail"
                                placeholder="Enter email Id"
                                value={formData.mail}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <div className="flex items-center justify-start gap-2">
                                <Button
                                    onClick={handleSave}
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                >
                                    <Save size={16} /> {editingUser ? "Update" : "Save"}
                                </Button>
                                {editingUser && (
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        className="border-gray-300 flex items-center gap-2"
                                    >
                                        <X size={16} /> Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== Table Section ===== */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
                        <Table className="min-w-full text-sm md:text-base">
                            <TableCaption className="text-gray-500 text-sm py-4">
                                A list of all users currently registered.
                            </TableCaption>
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    <TableHead className="w-12 text-center">Id</TableHead>
                                    <TableHead className="min-w-[150px]">Name</TableHead>
                                    <TableHead className="min-w-[150px]">Mobile</TableHead>
                                    <TableHead className="min-w-[150px]">Mail</TableHead>
                                    <TableHead className="text-center w-48">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <TableRow key={user._id} className="hover:bg-gray-50">
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell className="text-center">{user._id}</TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.mobile}</TableCell>
                                            <TableCell>{user.mail}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2 flex-wrap">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-gray-700 flex items-center gap-1"
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="flex items-center gap-1"
                                                        onClick={() => handleDelete(user._id)}
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
                                            colSpan="4"
                                            className="text-center py-6 text-gray-500"
                                        >
                                            No users found 😕
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
