"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://localhost:4000/api/admin/users/login", credentials);
            if (response.data.token) {
                localStorage.setItem("adminToken", response.data.token);
                navigate("/dashboard");
            } else {
                setError("Login failed: no token received");
            }
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] max-w-md mx-auto border border-white/20">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6">
                    Admin Login
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-gray-200 text-sm sm:text-base font-medium mb-2">
                            Username
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter email"
                            className="w-full p-3 sm:p-4 rounded-xl border border-white/40 bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-200 text-sm sm:text-base font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter password"
                            className="w-full p-3 sm:p-4 rounded-xl border border-white/40 bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-center text-sm sm:text-base -mt-3">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg sm:text-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/40"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
