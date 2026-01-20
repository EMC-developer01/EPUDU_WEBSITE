import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("vendor"));

    const handleLogout = () => {
        localStorage.removeItem("vendor");
        localStorage.removeItem("vendorId");
        localStorage.removeItem("isVendorLoggedIn");

        navigate("/login");
    };


    return (
        <header className="w-full bg-blue-600 text-white shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

                {/* Logo */}
                <Link to="/" className="text-xl font-bold tracking-wide">
                    <img src={logo} alt="EPUDU" className="h-10 w-auto" />
                </Link>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white text-3xl"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ☰
                </button>

                {/* Desktop Menu */}
                <nav className="hidden md:flex gap-6 text-lg">
                    <Link to="/" className="hover:text-gray-200">Dashboard</Link>
                    <Link to="/orders" className="hover:text-gray-200">Orders</Link>
                    <Link to="/profile" className="hover:text-gray-200">Profile</Link>
                    <Link to="/additems" className="hover:text-gray-200">Add Items</Link>
                </nav>

                {/* Desktop Profile + Logout */}
                <div className="hidden md:flex items-center gap-3">
                    <span className="font-medium">{user?.username}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-white"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-blue-500 px-4 pb-4">
                    <Link to="/" className="block py-2 border-b border-blue-400">Dashboard</Link>
                    <Link to="/orders" className="block py-2 border-b border-blue-400">Orders</Link>
                    <Link to="/profile" className="block py-2 border-b border-blue-400">Profile</Link>
                    <Link to="/additems" className="block py-2 border-b border-blue-400">Add Items</Link>

                    {/* Mobile Logout */}
                    <button
                        onClick={handleLogout}
                        className="mt-3 w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-white text-left"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
}
