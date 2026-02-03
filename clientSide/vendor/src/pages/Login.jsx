import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onClose }) => {
    let [step, setStep] = useState("mobile"); // mobile | otp | vendorDetails
    let [mobile, setMobile] = useState("");
    let [otp, setOtp] = useState("");
    let [generatedOtp, setGeneratedOtp] = useState("");
    let [name, setName] = useState("");
    let [mail, setMail] = useState("");
    let [shopName, setShopName] = useState("");
    let [vendorType, setVendorType] = useState("");
    let navigate = useNavigate();

    const API_URL = "http://localhost:4000/api";

    // Step 1️⃣ — Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            alert("Please enter a valid 10-digit mobile number");
            return;
        }

        const fullMobile = `+91${mobile}`;
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(otpCode);
        setStep("otp");

        try {
            const res = await fetch(`${API_URL}/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile }),
            });
            const data = await res.json();
            if (data.success) {
                alert(`Vendor OTP: ${data.otp}`);
                setStep("otp");
            }
            else {
                alert("Failed to send OTP: " + (data.details || data.message));
            }
        } catch (err) {
            console.error(err);
            alert("Error sending OTP");
        }
    };

    // Step 2️⃣ — Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        const res = await fetch(`${API_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile, otp }),
        });
        const data = await res.json();

        if (!data.verified) {
            alert("Invalid OTP");
            return;
        }

        const fullMobile = `+91${mobile}`;

        try {
            const vendorres = await fetch(`${API_URL}/vendor/users/${encodeURIComponent(fullMobile)}`);
            const data = await vendorres.json();

            if (res.ok && data.vendor) {
                // ✅ Vendor exists — login directly
                localStorage.setItem("vendor", JSON.stringify(data.vendor));
                localStorage.setItem("vendorId", data.vendor._id);
                localStorage.setItem("isVendorLoggedIn", true);
                alert(`Welcome back, ${data.vendor.name}!`);
                onClose?.();
                navigate("/dashboard");
            } else {
                // ❌ Vendor not found — go to vendorDetails
                setStep("vendorDetails");
            }
        } catch (err) {
            console.error("❌ Error verifying vendor:", err);
            alert("Server error while verifying vendor.");
        }
    };


    // Step 3️⃣ — Save new vendor
    const handleSaveVendorDetails = async (e) => {
        e.preventDefault();

        if (!name || !shopName || !vendorType || !mail) {
            alert("All fields are required!");
            return;
        }

        const fullMobile = `+91${mobile}`;

        try {
            const res = await fetch(`${API_URL}/vendor/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, mobile: fullMobile, mail, shopName, vendorType }),
            });

            const data = await res.json();

            if (res.ok && data.vendor) {
                localStorage.setItem("vendor", JSON.stringify(data.vendor));
                localStorage.setItem("vendorId", JSON.stringify(data.vendor._id));
                localStorage.setItem("isVendorLoggedIn", true);

                alert(`Welcome, ${data.vendor.name}!`);
                if (!data.vendor.isRegistered) {
                    navigate("/registration");
                } else {
                    // ✅ Already registered → go to dashboard
                    navigate("/");
                }
            } else {
                alert(data.message || "Failed to save vendor");
            }
        } catch (err) {
            console.error("Error saving vendor:", err);
            alert("Error saving vendor. Please try again.");
        }
    };

    // Auto-login if already logged in
    useEffect(() => {
        const savedVendor = JSON.parse(localStorage.getItem("vendor"));
        if (savedVendor) {
            localStorage.setItem("vendorId", savedVendor._id);
            navigate("/");
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
                    Vendor Login with OTP
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
                        <p className="text-center text-gray-600 mb-3">OTP sent to +91{mobile}</p>
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

                {step === "vendorDetails" && (
                    <form onSubmit={handleSaveVendorDetails}>
                        <input
                            type="text"
                            placeholder="Enter Your Name"
                            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="enter your email "
                            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Shop Name"
                            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                        />
                        <select
                            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={vendorType}
                            onChange={(e) => setVendorType(e.target.value)}
                            required
                        >
                            <option value="">Select Vendor Type</option>
                            <option value="Catering">Catering</option>
                            <option value="Decoration">Decoration</option>
                            <option value="Live Band">Live Band</option>
                            <option value="DJ">DJ</option>
                            <option value="Photography">Photography</option>
                            <option value="Videography">Videography</option>
                            <option value="Makeup Artist">Makeup Artist</option>
                            <option value="Florist">Florist</option>
                            <option value="Cake Designer">Cake Designer</option>
                            <option value="Entertainment / Games">Entertainment / Games</option>
                            <option value="Sound & Lighting">Sound & Lighting</option>
                            <option value="Event Planner">Event Planner</option>
                        </select>


                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Save & Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
