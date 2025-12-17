import React from "react";
import { Link } from "react-router-dom";

const ForgetPassword = ({ onClose, onSwitchToLogin }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password reset link sent to your email!");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="relative bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-8 w-[90%] max-w-sm mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-700 hover:text-gray-900 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter your registered email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{" "}
          <Link
            onClick={onSwitchToLogin}
            className="text-blue-500 font-medium hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;
