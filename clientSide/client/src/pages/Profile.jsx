import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./common/Header";

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleChangePassword = () => {
    // You can replace this with a proper change password flow
    alert("Redirecting to change password page...");
    navigate("/change-password"); // Make sure you have this route
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

        <main className="flex-grow flex items-center justify-center bg-gray-100 p-4 w-full">
            <div className="bg-white rounded-none shadow-xl p-8 w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Profile Details
                </h2>

                <div className="space-y-4 mb-6">
                <div>
                    <label className="text-gray-600 font-medium">Full Name:</label>
                    <p className="text-gray-800 mt-1">{user.name || "Not Available"}</p>
                </div>

                <div>
                    <label className="text-gray-600 font-medium">Email:</label>
                    <p className="text-gray-800 mt-1">{user.email || "Not Available"}</p>
                </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                {/* <Link
                    onClick={handleChangePassword}
                    className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                >
                    Change Password
                </Link> */}
                <Link
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                    Logout
                </Link>
                </div>
            </div>
        </main>

    </div>
  );
};

export default Profile;
