import React, { useState, useEffect } from "react";

const Signup = ({ onClose }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const tempMobile = localStorage.getItem("tempMobile");
    if (tempMobile) {
      setMobile(tempMobile);
    }
  }, []);

  const handleSignup = (e) => {
    e.preventDefault();

    const newUser = { name, mobile, history: [] };
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("isLoggedIn", true);

    alert("Account created successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="relative bg-white/90 rounded-xl shadow-2xl p-8 w-[90%] max-w-sm mx-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-700 hover:text-gray-900 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Complete Signup
        </h2>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            value={mobile}
            disabled
            className="w-full mb-4 p-2 border rounded bg-gray-100 text-gray-700"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
