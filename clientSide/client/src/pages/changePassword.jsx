import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  API_URL = import.meta.env.VITE_API_URL;
  const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  API_URL = `${API_URL}/api/users/change-password`;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.mobile) {
      alert("You must be logged in to change password!");
      navigate("/login");
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: user.mobile,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Password changed successfully!");
        navigate("/profile");
      } else {
        alert(`❌ Failed: ${data.message || "Unable to change password"}`);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Something went wrong, please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Change Password
        </h2>

        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Enter Old Password"
            className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter New Password"
            className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full mb-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>

        <p
          className="text-center text-blue-600 mt-4 cursor-pointer hover:underline"
          onClick={() => navigate("/profile")}
        >
          ← Back to Profile
        </p>
      </div>
    </div>
  );
}
