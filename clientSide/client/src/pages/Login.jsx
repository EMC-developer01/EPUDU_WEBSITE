import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onClose }) => {
  API_URL = import.meta.env.VITE_API_URL;
  const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
  let [step, setStep] = useState("mobile"); // mobile | otp | name
  let [mobile, setMobile] = useState("");
  let [otp, setOtp] = useState("");
  let [generatedOtp, setGeneratedOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  let [name, setName] = useState("");
  let navigate = useNavigate();

  API_URL = `${API_URL}/api`;

  // Step 1️⃣ — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    // const fullMobile = `+91${mobile}`;
    // const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    // setGeneratedOtp(otpCode);
    // setStep("otp");

    try {
      const res = await fetch(`${API_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();

      if (data.success) {
        setSessionId(data.sessionId);
        alert(`Your OTP is: ${data.otp}`);
        setStep("otp");
        alert("OTP sent successfully");
      } else {
        alert("Failed to send OTP");
      }

    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    }
  };

  // Step 2️⃣ — Verify OTP
  // const handleVerifyOtp = async (e) => {
  //   e.preventDefault();

  //   if (otp !== generatedOtp) {
  //     alert("Invalid OTP! Please try again.");
  //     return;
  //   }

  //   const fullMobile = `+91${mobile}`;

  //   try {
  //     const res = await fetch(`${API_URL}/client/users/${encodeURIComponent(fullMobile)}`);
  //     const data = await res.json();

  //     if (res.ok && data.user) {
  //       // ✅ User exists — login directly
  //       localStorage.setItem("user", JSON.stringify(data.user));
  //       localStorage.setItem("userId", JSON.stringify(data.user._id));
  //       localStorage.setItem("isLoggedIn", true);
  //       alert(`Welcome back, ${data.user.name}!`);
  //       onClose();
  //       navigate("/");
  //     } else {
  //       // ❌ User not found — ask name first instead of creating Guest
  //       setStep("name");
  //     }
  //   } catch (err) {
  //     console.error("❌ Error verifying user:", err);
  //     alert("Server error while verifying user.");
  //   }
  // };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, mobile }),
      });

      const data = await res.json();

      if (!data.verified) {
        alert("Invalid OTP");
        return;
      }

      // OTP verified → now check user
      const fullMobile = `+91${mobile}`;
      const userRes = await fetch(
        `${API_URL}/client/users/${encodeURIComponent(fullMobile)}`
      );
      const userData = await userRes.json();

      if (userRes.ok && userData.user) {
        localStorage.setItem("user", JSON.stringify(userData.user));
        localStorage.setItem("userId", userData.user._id);
        localStorage.setItem("isLoggedIn", true);
        alert(`Welcome back, ${userData.user.name}`);
        onClose();
        navigate("/");
      } else {
        setStep("name");
      }
    } catch (err) {
      alert("OTP verification failed");
    }
  };


  // Step 3️⃣ — Save new user
  const handleSaveName = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    const fullMobile = `+91${mobile}`;

    try {
      const response = await fetch(`${API_URL}/client/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile: fullMobile }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // ✅ Save and auto login
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", JSON.stringify(data.user._id));
        localStorage.setItem("isLoggedIn", true);

        alert(`Welcome, ${data.user.name}!`);
        onClose();
        navigate("/");
      } else {
        alert(data.message || "Failed to save user");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error saving user. Please try again.");
    }
  };


  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      localStorage.setItem("userId", savedUser._id); // ✅ Correct variable
      navigate("/"); // redirect to home if already logged in
    }
  }, []);

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
          Login with OTP
        </h2>

        {step === "mobile" && (
          <form onSubmit={handleSendOtp}>
            <input
              type="tel"
              placeholder="Enter Mobile Number"
              className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-center text-gray-600 mb-3">
              OTP sent to +91{mobile}
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full mb-4 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleSaveName}>
            <p className="text-center text-gray-600 mb-3">
              Welcome! Please enter your name to complete login.
            </p>
            <input
              type="text"
              placeholder="Enter Your Name"
              className="w-full mb-4 p-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;