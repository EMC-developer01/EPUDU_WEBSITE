import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
    const navigate = useNavigate();
    const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/login");
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUsersDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to navigate and close dropdown
    const go = (path) => {
        setUsersDropdownOpen(false);
        navigate(path);
    };


    return (
        <header className="bg-gray-900 text-white flex justify-between items-center px-6 py-3 shadow-md">
            <h1
                onClick={() => navigate("/dashboard")}
                className="text-xl font-semibold cursor-pointer hover:text-yellow-400 transition"
            >
                Admin Panel
            </h1>

            <nav className="flex items-center gap-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="hover:text-yellow-400 transition"
                >
                    Dashboard
                </button>
                {/* Users Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setUsersDropdownOpen(!usersDropdownOpen)}
                        className="hover:text-yellow-400 transition"
                    >
                        Users
                    </button>

                    {usersDropdownOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 mt-2 w-44 bg-white text-gray-900 rounded-md shadow-lg z-10 py-2"
                        >
                            <div
                                onClick={() => go("/client-users")}
                                className="px-4 py-2 cursor-pointer hover:bg-yellow-100 hover:text-gray-800 transition"
                            >
                                Client Users
                            </div>

                            <div
                                onClick={() => go("/vendor-users")}
                                className="px-4 py-2 cursor-pointer hover:bg-yellow-100 hover:text-gray-800 transition"
                            >
                                Vendor Users
                            </div>
                        </div>
                    )}

                </div>
                <button
                    onClick={() => navigate("/events")}
                    className="hover:text-yellow-400 transition"
                >
                    Events
                </button>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-medium transition"
                >
                    Logout
                </button>
            </nav>
        </header>
    );
}