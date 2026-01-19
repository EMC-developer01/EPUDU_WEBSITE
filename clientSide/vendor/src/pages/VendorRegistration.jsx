import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VendorRegistration() {
    const navigate = useNavigate();
    const vendor = JSON.parse(localStorage.getItem("vendor"));

    const [location, setLocation] = useState("");
    const [email, setEmail] = useState("");

    const [vendorSignature, setVendorSignature] = useState(null);
    const [vendorSignaturePreview, setVendorSignaturePreview] = useState(null);


    const API_URL = "http://localhost:4000/api";

    // Redirect if no vendor found
    useEffect(() => {
        if (!vendor) navigate("/login");
    }, [vendor, navigate]);

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();

        setEmail(vendor.mail);
        if (!location || !email || !vendorSignature) {
            alert("Please fill all fields and upload signature.");
            return;
        }
        const formData = new FormData();
        formData.append("vendorId", vendor?._id);
        formData.append("location", location);
        formData.append("email", email);
        formData.append("vendorSignature", vendorSignature);

        try {
            const res = await fetch(`${API_URL}/vendor/agreement/register`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                alert("Registration completed successfully!");
                localStorage.setItem("vendor", JSON.stringify(data.vendor));
                navigate("/");
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            alert("Server error during registration.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-8 px-4">
            <div
                className="
                    bg-white w-full 
                    max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px]
                    p-6 sm:p-10 
                    border-4 border-yellow-600 
                    rounded-xl 
                    relative shadow-xl
                "
            >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-gray-400">
                        EPUDU EVENTS
                    </h1>
                </div>

                <h1 className="text-center text-2xl sm:text-3xl font-bold mb-6 underline relative z-10">
                    EPUDU Vendor Agreement Bond
                </h1>

                <p className="mb-4 text-gray-700 leading-relaxed text-sm sm:text-base relative z-10">
                    This Vendor Agreement is executed between <b>EPUDU Event Management</b> and the listed vendor.
                    The vendor agrees to provide services for events, weddings, functions, birthdays, and related
                    activities as required by the EPUDU platform with 24/7 availability.
                </p>

                <form onSubmit={handleRegistrationSubmit} className="mt-6 space-y-6 relative z-10">

                    {/* Vendor Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Vendor Name" value={vendor?.name} readOnly />
                        <InputField label="Shop Name" value={vendor?.shopName} readOnly />
                        <InputField label="Vendor Type" value={vendor?.vendorType} readOnly />
                        <InputField label="Mobile Number" value={vendor?.mobile} readOnly />

                        <div>
                            <label className="block font-medium mb-1">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full border p-2 rounded"
                                placeholder="Enter location"
                                required
                            />
                        </div>

                        <div>
                            {/* <label className="block font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={vendor?.mail}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border p-2 rounded"
                                placeholder="Enter email address"
                                required
                            /> */}
                            <InputField label="Email" value={vendor?.mail} readOnly />

                        </div>
                    </div>

                    {/* Signature Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4">
                        <div>
                            <p className="mb-2 font-medium">Vendor Signature *</p>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setVendorSignature(file);
                                    if (file) {
                                        setVendorSignaturePreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="w-full"
                                required
                            />

                            {/* Preview Box */}
                            {vendorSignaturePreview && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                                    <img
                                        src={vendorSignaturePreview}
                                        alt="Vendor Signature Preview"
                                        className="w-40 h-auto border rounded-md shadow-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="font-medium">Admin Signature</p>
                            <img
                                src="/admin-signature.png"
                                className="w-28 sm:w-32 mx-auto mt-2 opacity-90"
                                alt="admin signature"
                            />
                            <p className="text-sm">EPUDU Admin</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        Date & Time of Agreement: <b>{new Date().toLocaleString()}</b>
                    </p>

                    <button
                        type="submit"
                        className="
                            w-full bg-blue-600 hover:bg-blue-700 
                            text-white py-2 rounded-lg text-lg 
                            font-medium transition
                        "
                    >
                        Complete Registration
                    </button>
                </form>
            </div>
        </div>
    );
}

function InputField({ label, value, readOnly }) {
    return (
        <div>
            <label className="block font-medium mb-1">{label}</label>
            <input
                readOnly={readOnly}
                value={value}
                className="w-full border p-2 rounded bg-gray-100"
            />
        </div>
    );
}
