import { useEffect, useState } from "react";
import Header from "../components/Header";
// import Footer from "../common/Footer";

const VendorProfile = () => {
    const storedvendor = JSON.parse(localStorage.getItem("vendor"));
    const vendorMobile = storedvendor?.mobile;


    const [vendor, setVendor] = useState({});
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);

    // 🔹 Fetch vendor by mobile
    useEffect(() => {
        const fetchVendor = async () => {
            const res = await fetch(
                `http://localhost:4000/api/vendor/users/${vendorMobile}`
            );
            const data = await res.json();
            setVendor(data.vendor);
            setFormData(data.vendor);
            console.log(data)
        };
        fetchVendor();
    }, [vendorMobile]);
    console.log(vendor);
    // 🔹 Save changes
    const handleSave = async () => {
        await fetch(`http://localhost:4000/api/vendor/users/${vendor._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        setVendor(formData);
        setEditMode(false);
    };

    // 🔹 Logout
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/vendor-login";
    };

    return (
        <>
            <Header />

            <section className="min-h-screen w-screen bg-gray-100 flex justify-center items-center px-4 py-12">
                <div className="w-full max-w-xl lg:max-w-5xl bg-white shadow-lg rounded-2xl p-8">

                    <h2 className="text-3xl font-bold text-center mb-8">
                        Vendor Profile
                    </h2>

                    {/* PROFILE ICON */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                            {vendor?.name?.charAt(0) || "_"}
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

                        {/* NAME */}
                        <div>
                            <p className="text-sm text-gray-500">Vendor Name</p>
                            {editMode ? (
                                <input
                                    value={formData.name || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="border rounded p-2 w-full"
                                />
                            ) : (
                                <p className="text-lg font-medium">{vendor?.name || "_"}</p>
                            )}
                        </div>

                        {/* MOBILE */}
                        <div>
                            <p className="text-sm text-gray-500">Mobile</p>
                            <p className="text-lg font-medium">{vendor?.mobile || "_"}</p>
                        </div>

                        {/* SHOP NAME */}
                        <div>
                            <p className="text-sm text-gray-500">Shop Name</p>
                            {editMode ? (
                                <input
                                    value={formData.shopName || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, shopName: e.target.value })
                                    }
                                    className="border rounded p-2 w-full"
                                />
                            ) : (
                                <p className="text-lg font-medium">{vendor?.shopName || "_"}</p>
                            )}
                        </div>

                        {/* VENDOR TYPE */}
                        <div>
                            <p className="text-sm text-gray-500">Vendor Type</p>
                            {editMode ? (
                                <input
                                    value={formData.vendorType || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, vendorType: e.target.value })
                                    }
                                    className="border rounded p-2 w-full"
                                />
                            ) : (
                                <p className="text-lg font-medium">{vendor?.vendorType || "_"}</p>
                            )}
                        </div>

                        {/* REGISTRATION STATUS */}
                        <div>
                            <p className="text-sm text-gray-500">Registration Status</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                ${vendor.isRegistered ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                            >
                                {vendor.isRegistered ? "Registered" : "Not Registered"}
                            </span>
                        </div>

                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col gap-3">

                        {editMode ? (
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-green-500 text-white py-3 rounded-lg"
                                >
                                    Save
                                </button>

                                <button
                                    onClick={() => {
                                        setEditMode(false);
                                        setFormData(vendor);
                                    }}
                                    className="flex-1 bg-gray-400 text-white py-3 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="w-full bg-blue-500 text-white py-3 rounded-lg"
                            >
                                Edit Profile
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 text-white py-3 rounded-lg"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </section>

            {/* <Footer /> */}
        </>
    );
};

export default VendorProfile;
