import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, Calendar, Settings, LogOut, Menu, List, ListCheck, BookUpIcon, BookUp2Icon, Image } from "lucide-react";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    const menuItems = [
        { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
        { name: "Client Users", icon: <Users size={20} />, path: "/client-users" },
        { name: "Client Homepage-Img's", icon: <Image size={20} />, path: "/Client-homepage-Img" },
        { name: "Vendor Users", icon: <Users size={20} />, path: "/vendor-users" },
        { name: "Events", icon: <Calendar size={20} />, path: "/events" },
        { name: "Vendor Orders", icon: <ListCheck size={20} />, path: "/vendor-Orders" },
        { name: "Payment Status", icon: <BookUp2Icon size={20} />, path: "/Payment-Status" },
        { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/login");
    };

    return (
        <div
            className={`${isOpen ? "w-64" : "w-20"
                } h-screen bg-gray-900 text-white flex flex-col transition-all duration-300`}
        >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                <h2
                    className={`text-lg font-semibold transition-all duration-300 ${!isOpen && "hidden"
                        }`}
                >
                    Admin Panel
                </h2>
                <button onClick={() => setIsOpen(!isOpen)} className="p-1">
                    <Menu size={22} />
                </button>
            </div>

            {/* Menu Links */}
            <nav className="flex flex-col gap-1 mt-4">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className="flex items-center gap-3 px-5 py-2 hover:bg-gray-800 text-left transition-all"
                    >
                        {item.icon}
                        {isOpen && <span>{item.name}</span>}
                    </button>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-auto px-5 py-3 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 hover:text-red-400 transition"
                >
                    <LogOut size={20} />
                    {isOpen && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}
