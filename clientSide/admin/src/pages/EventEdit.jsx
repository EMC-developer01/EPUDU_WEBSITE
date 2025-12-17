// src/pages/EventEdit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

export default function EventEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        celebrantName: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        eventDate: "",
        themePreference: "",
        eventType: "Birthday",
        venue: { name: "", address: "", city: "" },
        timings: { time: "", date: "", capacity: "" },
        decoration: {
            themeScheme: "",
            stageDesign: [],
            entranceDecor: [],
            photoBoothDesign: [],
            tableDecor: [],
            cakeSetup: [],
            lighting: [],
        },
        foodArrangements: {
            mealType: "",
            mealTime: "",
            cuisine: "",
            welcomeDrinks: [],
            starters: [],
            desserts: [],
            snacks: [],
            beverages: [],
            fruits: [],
            mainCourse: [],
            welcomeDrinksOther: "",
            startersOther: "",
            dessertsOther: "",
            snacksOther: "",
            beveragesOther: "",
            fruitsOther: "",
            mainCourseOther: "",
            seating: [],
            seatingOther: "",
            cutleryTeam: "",
            cutleryTeamOther: "",
        },
        entertainment: {
            emceeRequired: "",
            emceeDetails: "",
            activities: [],
            activitiesOther: "",
            music: [],
            musicOther: "",
            shows: [],
            showsOther: "",
        },
        photography: {
            photoTeam: "",
            photoTeamDetails: "",
            packageType: [],       // now an array for multiple selections
            packageTypeOther: "",
            instantPhoto: "",
            instantPhotoOther: "",
        },
        returnGifts: {
            quantity: "",
            budget: "",
            giftType: "",
            giftTypeOther: "",
            notes: "",
        },
        eventStaff: {
            foodServers: "",
            welcomeStaff: "",
            maintenanceTeam: "",
            otherRoles: "",
            staffNotes: "",
        },

        budget: {
            totalBudget: "",
            advancePayment: "",
            balancePayment: "",
            aidAmount: "",
        },

        paymentStatus: "Pending", // "Pending", "Advance Paid", or "Full Paid"
        bookingStatus: "Pending", // "Pending" or "Booked"
        balanceAmount: "",         // Auto-calculated balance

        notes: "",

    });

    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [originalTotal, setOriginalTotal] = useState(0);
    // const [updatedTotal, setUpdatedTotal] = useState(0);

    const [initialVenues] = useState([
        { id: 1, name: "Grand Indoor Hall", type: "Indoor", location: "Hyderabad", fee: 20000, lat: 17.387, lng: 78.486 },
        { id: 2, name: "City Party Hall", type: "Party Hall", location: "Hyderabad", fee: 30000, lat: 17.389, lng: 78.482 },
        { id: 3, name: "Green Park Lawn", type: "Outdoor", location: "Hyderabad", fee: 25000, lat: 17.383, lng: 78.488 },
    ]);

    const BASE_URL = "http://localhost:4000/api/client";

    // ----- fetch event by id on mount -----
    useEffect(() => {
        (async function fetchEvent() {
            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}/birthday/order/${id}`);
                let data = res.data;
                console.log("Fetched data:", data);

                // ✅ Sanitize all null values before merging
                data = sanitizeNulls(data);

                const normalized = { ...formData, ...data };
                normalized.budget = normalized.budget || formData.budget;
                normalized.foodArrangements = { ...formData.foodArrangements, ...normalized.foodArrangements };
                normalized.decoration = { ...formData.decoration, ...normalized.decoration };
                normalized.entertainment = { ...formData.entertainment, ...normalized.entertainment };
                normalized.returnGifts = { ...formData.returnGifts, ...normalized.returnGifts };
                normalized.eventStaff = { ...formData.eventStaff, ...normalized.eventStaff };

                setFormData(normalized);

                const orig = parseFloat(normalized.budget?.totalBudget) || calculateTotal(normalized);
                setOriginalTotal(Number.isFinite(orig) ? orig : 0);
            } catch (err) {
                console.error("Error loading event:", err);
                alert("Failed to load event. Check console.");
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    // Utility: Replace all null values (deeply) with empty strings
    const sanitizeNulls = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(sanitizeNulls);
        } else if (obj && typeof obj === "object") {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, sanitizeNulls(value)])
            );
        } else {
            return obj === null ? "" : obj;
        }
    };


    const handleChange = (path) => (e) => {
        const value = e?.target ? e.target.value : e;
        const keys = path.split(".");
        setFormData((prev) => {
            const copy = JSON.parse(JSON.stringify(prev));
            let ptr = copy;
            for (let i = 0; i < keys.length - 1; i++) {
                if (ptr[keys[i]] === undefined) ptr[keys[i]] = {};
                ptr = ptr[keys[i]];
            }
            ptr[keys[keys.length - 1]] = value;
            return copy;
        });
    };

    const handleCustomChange = (field, value) => {
        // Ensure value is always defined and not null
        const safeValue = value === null || value === undefined ? "" : value;

        setFormData((prev) => ({
            ...prev,
            [field]: safeValue,
        }));
    };




    const calculateTotal = (f = formData) => {
        // 🏠 Venue Fee
        const venueFee = initialVenues.find((v) => v.name === f?.venue?.name)?.fee || 0;

        // 👥 Capacity & Meal Type
        const capacity = Number(f?.timings?.capacity) || 0;
        const perHeadRates = { Veg: 200, "Non-Veg": 300, Mixed: 275 };
        const mealRate = perHeadRates[f?.foodArrangements?.mealType] || 0;
        const cateringCost = capacity * mealRate;

        // 🎉 Decoration Cost
        const dec = f?.decoration || {};
        const decoCount =
            (dec.stageDesign?.length || 0) +
            (dec.entranceDecor?.length || 0) +
            (dec.photoBoothDesign?.length || 0) +
            (dec.tableDecor?.length || 0) +
            (dec.cakeSetup?.length || 0) +
            (dec.lighting?.length || 0);
        const decorationCost = decoCount * 1500;

        // 📸 Photography Packages
        const photoPackages = f?.photography?.packageType?.length || 0;
        const photographyCost = photoPackages * 4000;

        // 🧑‍🤝‍🧑 Event Staff
        const staffCount =
            (f?.eventStaff?.foodServers ? 1 : 0) +
            (f?.eventStaff?.welcomeStaff ? 1 : 0) +
            (f?.eventStaff?.maintenanceTeam ? 1 : 0);
        const staffFee = staffCount * 1500;

        // 🎁 Return Gifts
        const returnGiftBudget = Number(f?.returnGifts?.budget) || 0;

        // 💰 Final Total
        const total =
            venueFee +
            cateringCost +
            decorationCost +
            photographyCost +
            staffFee +
            returnGiftBudget;

        return Math.round(total * 100) / 100;
    };

    const [updatedTotal, setUpdatedTotal] = useState(0);

    // setUpdatedTotal(useMemo(() => calculateTotal(formData), [formData]));
    const difference = Math.round((updatedTotal - (originalTotal || 0)) * 100) / 100;

    const handleSave = async () => {
        try {
            // 🧮 Ensure total is always recalculated before saving
            const total = calculateTotal(formData);
            const advance = Number(formData.budget?.advancePayment) || 0;
            const balance = Math.max(0, total - advance);

            const payload = {
                ...formData,
                birthdayId: id,
                budget: {
                    ...formData.budget,
                    totalBudget: String(total),
                    balancePayment: String(balance),
                },
                balanceAmount: String(balance), // keep consistency between fields
            };
            try {
                await axios.put(`${BASE_URL}/birthday/update/admin/${id}`, payload);
            } catch (e) {
                console.log(e)
            }


            alert("✅ Event updated successfully");
            setOriginalTotal(total);
            setFormData(payload);
            navigate("/events");
        } catch (err) {
            console.error("Error saving event:", err);
            alert("❌ Failed to update event. Check console.");
        }
    };

    useEffect(() => {
        setUpdatedTotal(calculateTotal(formData));
    }, [formData]);

    if (loading) return <div>Loading...</div>;
    const handleCheckboxChange = (parent, field, item) => {
        setFormData((prev) => {
            const currentArray = prev[parent][field] || [];
            const updatedArray = currentArray.includes(item)
                ? currentArray.filter((i) => i !== item) // uncheck → remove
                : [...currentArray, item];               // check → add

            return {
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [field]: updatedArray,
                },
            };
        });
    };
    // ---------- helper: getMainCourseItems ----------
    const getMainCourseItems = (mealType, mealTime, cuisine) => {
        if (!mealType || !mealTime || !cuisine) return {};

        const menus = {
            "South Indian": {
                Tiffin: { "Tiffin Dishes": ["Idli", "Vada", "Dosa", "Pongal", "Upma"] },
                Lunch: {
                    "Rice Items": ["Sambar Rice", "Curd Rice", "Veg Biryani", "Tomato Rice"],
                    "Curries": ["Aloo Fry", "Bendakaya Curry", "Dal", "Sambar"],
                    "Flour Items": ["Chapati", "Parota", "Puri"],
                },
                Dinner: {
                    "Rice Items": ["Lemon Rice", "Jeera Rice", "Biryani"],
                    "Curries": ["Kurma", "Tomato Curry", "Paneer Masala"],
                    "Flour Items": ["Chapati", "Naan", "Roti"],
                },
            },

            "North Indian": {
                Tiffin: { "Snacks": ["Paratha", "Poha", "Aloo Tikki", "Chole Bhature"] },
                Lunch: {
                    "Curries": ["Dal Makhani", "Paneer Butter Masala", "Aloo Gobi"],
                    "Rice Items": ["Jeera Rice", "Veg Pulao", "Biryani"],
                    "Flour Items": ["Naan", "Roti", "Paratha"],
                },
                Dinner: {
                    "Main Course": ["Rajma Chawal", "Butter Chicken", "Kadai Paneer"],
                    "Flour Items": ["Tandoori Roti", "Butter Naan", "Missi Roti"],
                },
            },

            Italian: {
                Lunch: {
                    Pasta: ["Penne Alfredo", "Spaghetti Arrabiata"],
                    Pizza: ["Margherita", "Veg Supreme"],
                },
                Dinner: {
                    Pasta: ["Lasagna", "Fettuccine"],
                    Pizza: ["Pepperoni", "Cheese Burst"],
                },
            },

            Chinese: {
                Lunch: {
                    "Rice & Noodles": ["Fried Rice", "Hakka Noodles"],
                    "Sides": ["Manchurian", "Chilli Paneer", "Spring Rolls"],
                },
                Dinner: {
                    "Rice & Noodles": ["Schezwan Rice", "Garlic Noodles"],
                    "Sides": ["Momos", "Crispy Corn", "Honey Chilli Potato"],
                },
            },

            Japanese: {
                Lunch: {
                    Sushi: ["California Roll", "Nigiri"],
                    Soups: ["Miso Soup"],
                },
                Dinner: { Dishes: ["Ramen", "Tempura", "Teriyaki Chicken"] },
            },

            French: {
                Lunch: {
                    Specials: ["Quiche", "Ratatouille"],
                    Desserts: ["Crème Brûlée"],
                },
                Dinner: { "Main Course": ["Coq au Vin", "Boeuf Bourguignon"] },
            },
        };

        return menus[cuisine]?.[mealTime] || {};
    };

    // ---------- helper: getFoodItems ----------
    const getFoodItems = (category, mealType, mealTime) => {
        const foodOptions = {
            "Welcome Drinks": {
                default: ["Lassi", "Juice", "Mocktail", "Soft Drinks", "Cold Coffee"],
                Veg: ["Fresh Juice", "Lemon Soda", "Butter Milk", "Rose Milk"],
                "Non-Veg": ["Fruit Punch", "Cold Coffee", "Soft Drinks"],
                Mixed: ["Fruit Punch", "Lemon Soda", "Mocktail"],
            },
            Starters: {
                default: ["Paneer Tikka", "Chicken Wings", "Spring Rolls", "Veg Manchurian", "Fish Fingers"],
                Veg: ["Paneer Tikka", "Veg Manchurian", "Spring Rolls"],
                "Non-Veg": ["Chicken Wings", "Fish Fingers", "Chicken 65"],
                Mixed: ["Paneer Tikka", "Chicken Wings", "Spring Rolls"],
            },
            Snacks: ["Samosa", "Cutlet", "Sandwich", "Pakora", "Popcorn"],
            Desserts: ["Gulab Jamun", "Ice Cream", "Rasmalai", "Cake", "Payasam"],
            "Beverages & Hot Drinks": ["Tea", "Coffee", "Green Tea", "Hot Chocolate"],
            Fruits: ["Apple", "Banana", "Watermelon", "Mango", "Pineapple"],
        };

        const entry = foodOptions[category];
        if (!entry) return [];
        if (Array.isArray(entry)) return entry;
        return entry[mealType] || entry.default || [];
    };

    // ---------- Food Section list ----------
    const foodSections = [
        { title: "🥤 Welcome Drinks", field: "welcomeDrinks", category: "Welcome Drinks" },
        { title: "🍢 Starters", field: "starters", category: "Starters" },
        { title: "🍰 Desserts & Sweets", field: "desserts", category: "Desserts" },
        { title: "🍪 Snacks", field: "snacks", category: "Snacks" },
        { title: "☕ Beverages & Hot Drinks", field: "beverages", category: "Beverages & Hot Drinks" },
        { title: "🍎 Fruits", field: "fruits", category: "Fruits" },
    ];



    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header title="Edit Event" />
                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">

                        {/* Basic Info */}
                        <h2 className="text-xl font-semibold text-gray-700">🎉 Basic Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input value={formData.celebrantName ?? ""} onChange={handleChange("celebrantName")} placeholder="Celebrant Name" className="p-3 border rounded-lg" />
                            <input value={formData.age ?? ""} onChange={handleChange("age")} placeholder="Age" className="p-3 border rounded-lg" />
                            <select value={formData.gender ?? ""} onChange={handleChange("gender")} className="p-3 border rounded-lg">
                                <option value="">Select Gender</option>
                                <option value="Girl">Girl</option>
                                <option value="Boy">Boy</option>
                                <option value="Other">Other</option>
                            </select>
                            <input value={formData.phone ?? ""} onChange={handleChange("phone")} placeholder="Phone" className="p-3 border rounded-lg" />
                            <input value={formData.email ?? ""} onChange={handleChange("email")} placeholder="Email" className="p-3 border rounded-lg" />
                            <input type="date" value={formData.eventDate ?? ""} onChange={handleChange("eventDate")} className="p-3 border rounded-lg" />
                            <input value={formData.themePreference ?? ""} onChange={handleChange("themePreference")} placeholder="Theme Preference" className="p-3 border rounded-lg" />
                        </div>

                        {/* Venue */}
                        <h2 className="text-xl font-semibold text-gray-700">🏛 Venue</h2>
                        <input
                            value={formData.venue?.name ?? ""}
                            onChange={(e) => handleCustomChange("venue", { ...formData.venue, name: e.target.value })}
                            placeholder="Venue Name"
                            className="w-full p-3 border rounded-lg"
                        />
                        <input
                            value={formData.venue?.address ?? ""}
                            onChange={(e) => handleCustomChange("venue", { ...formData.venue, address: e.target.value })}
                            placeholder="Venue Address"
                            className="w-full p-3 border rounded-lg mt-2"
                        />
                        <input
                            value={formData.venue?.city ?? ""}
                            onChange={(e) => handleCustomChange("venue", { ...formData.venue, city: e.target.value })}
                            placeholder="Venue City"
                            className="w-full p-3 border rounded-lg mt-2"
                        />

                        {/* Timings & Capacity */}
                        <h2 className="text-xl font-semibold text-gray-700">⏱ Timings & Capacity</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <input value={formData.timings?.time ?? ""} onChange={handleChange("timings.time")} placeholder="Time" className="p-3 border rounded-lg" />
                            <input value={formData.timings?.date ?? ""} onChange={handleChange("timings.date")} placeholder="Date" className="p-3 border rounded-lg" />
                            <input value={formData.timings?.capacity ?? ""} onChange={handleChange("timings.capacity")} placeholder="Capacity" type="number" className="p-3 border rounded-lg" />
                        </div>



                        {/* Decoration */}
                        <h2 className="text-xl font-semibold text-gray-700">🎨 Decoration</h2>
                        <input
                            value={formData.decoration?.themeScheme ?? ""}
                            onChange={handleChange("decoration.themeScheme")}
                            placeholder="Theme Scheme"
                            className="p-3 border rounded-lg mb-4"
                        />

                        {[
                            {
                                key: "stageDesign",
                                title: "Stage Design",
                                items: ["Backdrop", "Name Board", "Balloon Arch", "Props & Cutouts", "LED Screen", "Flower Arrangement"],
                            },
                            {
                                key: "entranceDecor",
                                title: "Entrance Decoration",
                                items: ["Floral Arch", "Balloon Arch", "Welcome Board", "LED Lights", "Carpet Path", "Flower Garlands"],
                            },
                            {
                                key: "photoBoothDesign",
                                title: "Photo Booth / Selfie Corner",
                                items: ["Neon Frame", "Floral Frame", "LED Mirror", "Balloon Backdrop", "Theme Props"],
                            },
                            {
                                key: "tableDecor",
                                title: "Table / Ceiling / Seating Decor",
                                items: [
                                    "Flower Centerpieces",
                                    "Balloon Ceiling",
                                    "Chair Ribbons",
                                    "Table Covers",
                                    "Hanging Lights",
                                    "Table Props",
                                    "Chairs",
                                    "Tables",
                                ],
                            },
                            {
                                key: "cakeSetup",
                                title: "Cake Table Setup",
                                items: ["Cake Stand", "Theme Backdrop", "Candles & Lights", "Mini Balloons", "Cutlery & Props", "Flowers", "Table Skirting"],
                            },
                            {
                                key: "lighting",
                                title: "Lighting Requirements",
                                items: ["Fairy Lights", "LED Lights", "Spotlights", "Stage Lights", "Color Wash", "Chandeliers"],
                            },
                        ].map(({ key, title, items }) => (
                            <div key={key} className="mb-4 border p-3 rounded-lg bg-white">
                                <label className="font-semibold text-gray-700">{title}</label>

                                {/* Render checkboxes dynamically */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {items.map((option) => {
                                        const isChecked = formData.decoration[key]?.includes(option);
                                        return (
                                            <label key={option} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!isChecked}
                                                    onChange={(e) => {
                                                        const updatedArray = e.target.checked
                                                            ? [...(formData.decoration[key] || []), option]
                                                            : (formData.decoration[key] || []).filter((item) => item !== option);

                                                        handleCustomChange("decoration", {
                                                            ...formData.decoration,
                                                            [key]: updatedArray,
                                                        });
                                                    }}
                                                />
                                                <span>{option}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* "Other" custom field */}
                                <input
                                    value={formData.decoration?.[`${key}Other`] || ""}
                                    onChange={(e) =>
                                        handleCustomChange("decoration", {
                                            ...formData.decoration,
                                            [`${key}Other`]: e.target.value,
                                        })
                                    }
                                    placeholder={`Other ${title}`}
                                    className="p-2 border rounded-lg mt-3 w-full"
                                />
                            </div>
                        ))}

                        {/* ----------- Food Arrangements Dynamic Edit Section ----------- */}
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">🍽 Food Arrangements</h2>

                        {/* Basic Inputs */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Meal Type */}
                            <select
                                value={formData.foodArrangements?.mealType || ""}
                                onChange={(e) =>
                                    handleCustomChange("foodArrangements", {
                                        ...formData.foodArrangements,
                                        mealType: e.target.value,
                                    })
                                }
                                className="p-3 border rounded-lg bg-white"
                            >
                                <option value="">Select Meal Type</option>
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Mixed">Mixed</option>
                            </select>

                            {/* Meal Time */}
                            <select
                                value={formData.foodArrangements?.mealTime || ""}
                                onChange={(e) =>
                                    handleCustomChange("foodArrangements", {
                                        ...formData.foodArrangements,
                                        mealTime: e.target.value,
                                    })
                                }
                                className="p-3 border rounded-lg bg-white"
                            >
                                <option value="">Select Meal Time</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                            </select>

                            {/* Cuisine */}
                            <select
                                value={formData.foodArrangements?.cuisine || ""}
                                onChange={(e) =>
                                    handleCustomChange("foodArrangements", {
                                        ...formData.foodArrangements,
                                        cuisine: e.target.value,
                                    })
                                }
                                className="p-3 border rounded-lg bg-white"
                            >
                                <option value="">Select Cuisine</option>
                                <option value="South Indian">South Indian</option>
                                <option value="North Indian">North Indian</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Continental">Continental</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        </div>

                        {/* Conditional food sections */}
                        {formData.foodArrangements?.mealType &&
                            formData.foodArrangements?.mealTime && (
                                <div className="mt-6 space-y-6">
                                    {foodSections.map((section) => {
                                        const items = getFoodItems(
                                            section.category,
                                            formData.foodArrangements.mealType,
                                            formData.foodArrangements.mealTime
                                        );
                                        return (
                                            <div key={section.field}>
                                                <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
                                                <div className="grid md:grid-cols-3 gap-2">
                                                    {[...items, "Other"].map((item) => (
                                                        <label key={item} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    Array.isArray(formData.foodArrangements[section.field]) &&
                                                                    formData.foodArrangements[section.field].includes(item)
                                                                }
                                                                onChange={() =>
                                                                    handleCheckboxChange("foodArrangements", section.field, item)
                                                                }
                                                            />
                                                            {item}
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Other input */}
                                                {Array.isArray(formData.foodArrangements[section.field]) &&
                                                    formData.foodArrangements[section.field].includes("Other") && (
                                                        <input
                                                            type="text"
                                                            className="border p-2 rounded w-full mt-2"
                                                            placeholder={`Other ${section.title}`}
                                                            value={formData.foodArrangements[`${section.field}Other`] || ""}
                                                            onChange={(e) =>
                                                                handleCustomChange("foodArrangements", {
                                                                    ...formData.foodArrangements,
                                                                    [`${section.field}Other`]: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    )}
                                            </div>
                                        );
                                    })}

                                    {/* ---------- Main Course Section ---------- */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mt-4">🍛 Main Course</h4>
                                        {Object.entries(
                                            getMainCourseItems(
                                                formData.foodArrangements.mealType,
                                                formData.foodArrangements.mealTime,
                                                formData.foodArrangements.cuisine
                                            )
                                        ).map(([group, groupItems]) => (
                                            <div key={group} className="mt-2">
                                                <p className="font-medium">{group}</p>
                                                <div className="grid md:grid-cols-3 gap-2 mt-1">
                                                    {[...groupItems, "Other"].map((item) => (
                                                        <label key={item} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    Array.isArray(formData.foodArrangements.mainCourse) &&
                                                                    formData.foodArrangements.mainCourse.includes(`${group}_${item}`)
                                                                }
                                                                onChange={() =>
                                                                    handleCheckboxChange(
                                                                        "foodArrangements",
                                                                        "mainCourse",
                                                                        `${group}_${item}`
                                                                    )
                                                                }
                                                            />
                                                            {item}
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Other input for this group */}
                                                {Array.isArray(formData.foodArrangements.mainCourse) &&
                                                    formData.foodArrangements.mainCourse.includes(`${group}_Other`) && (
                                                        <input
                                                            type="text"
                                                            className="border p-2 rounded w-full mt-2"
                                                            placeholder={`Specify your ${group}`}
                                                            value={formData.foodArrangements[`mainCourseOther_${group}`] || ""}
                                                            onChange={(e) =>
                                                                handleCustomChange("foodArrangements", {
                                                                    ...formData.foodArrangements,
                                                                    [`mainCourseOther_${group}`]: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* ---------- Seating & Cutlery Section ---------- */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">🪑 Seating & Cutlery</h3>

                                        {/* Seating */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-2">Seating</label>
                                            <div className="flex gap-3 flex-wrap">
                                                {["Chairs", "Tables", "Stage Setup", "Other"].map((s) => (
                                                    <label key={s} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                Array.isArray(formData.foodArrangements.seating) &&
                                                                formData.foodArrangements.seating.includes(s)
                                                            }
                                                            onChange={() =>
                                                                handleCheckboxChange("foodArrangements", "seating", s)
                                                            }
                                                        />
                                                        {s}
                                                    </label>
                                                ))}
                                            </div>
                                            {Array.isArray(formData.foodArrangements.seating) &&
                                                formData.foodArrangements.seating.includes("Other") && (
                                                    <input
                                                        type="text"
                                                        placeholder="Specify seating"
                                                        value={formData.foodArrangements.seatingOther || ""}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                foodArrangements: {
                                                                    ...prev.foodArrangements,
                                                                    seatingOther: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="border p-2 rounded w-full mt-2"
                                                    />
                                                )}
                                        </div>

                                        {/* Cutlery Team */}
                                        <div>
                                            <label className="block font-semibold mb-2">Cutlery Team</label>
                                            <select
                                                value={formData.foodArrangements.cutleryTeam || ""}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        foodArrangements: { ...prev.foodArrangements, cutleryTeam: e.target.value },
                                                    }))
                                                }
                                                className="border p-2 rounded w-full"
                                            >
                                                <option value="">Select</option>
                                                <option value="Provided by Venue">Provided by Venue</option>
                                                <option value="Provided by Event Team">Provided by Event Team</option>
                                                <option value="Other">Other</option>
                                            </select>

                                            {formData.foodArrangements.cutleryTeam === "Other" && (
                                                <input
                                                    type="text"
                                                    placeholder="Specify cutlery team"
                                                    value={formData.foodArrangements.cutleryTeamOther || ""}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            foodArrangements: {
                                                                ...prev.foodArrangements,
                                                                cutleryTeamOther: e.target.value,
                                                            },
                                                        }))
                                                    }
                                                    className="border p-2 rounded w-full mt-2"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* 🎉 Entertainment & Activities */}
                        {/* ----------- Entertainment / Activities Dynamic Edit Section ----------- */}
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">🎉 Entertainment & Activities</h2>

                        {/* Basic Input: Emcee Required */}
                        <div className="grid grid-cols-2 gap-3">

                            {/* Emcee Required */}
                            <select
                                value={formData.entertainment?.emceeRequired || ""}
                                onChange={(e) =>
                                    handleCustomChange("entertainment", {
                                        ...formData.entertainment,
                                        emceeRequired: e.target.value,
                                        emceeDetails: "",
                                    })
                                }
                                className="p-3 border rounded-lg bg-white"
                            >
                                <option value="">Emcee / Anchor Required?</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {/* If emcee is required – show details input */}
                        {formData.entertainment?.emceeRequired === "Yes" && (
                            <input
                                type="text"
                                placeholder="Specify emcee preferences"
                                className="border p-2 rounded w-full mt-3"
                                value={formData.entertainment?.emceeDetails || ""}
                                onChange={(e) =>
                                    handleCustomChange("entertainment", {
                                        ...formData.entertainment,
                                        emceeDetails: e.target.value,
                                    })
                                }
                            />
                        )}

                        {/* Conditional Sections */}
                        <div className="mt-6 space-y-6">

                            {/* 🎯 Games / Activities */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">🎯 Games / Activities</h4>

                                <div className="grid md:grid-cols-3 gap-2">
                                    {["Kids", "Adults", "Both", "Other"].map((item) => (
                                        <label key={item} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(formData.entertainment?.activities) &&
                                                    formData.entertainment.activities.includes(item)}
                                                onChange={() =>
                                                    handleCheckboxChange("entertainment", "activities", item)
                                                }
                                            />
                                            {item}
                                        </label>
                                    ))}
                                </div>

                                {/* Other Input */}
                                {Array.isArray(formData.entertainment?.activities) &&
                                    formData.entertainment.activities.includes("Other") && (
                                        <input
                                            type="text"
                                            className="border p-2 rounded w-full mt-2"
                                            placeholder="Other Activity"
                                            value={formData.entertainment?.activitiesOther || ""}
                                            onChange={(e) =>
                                                handleCustomChange("entertainment", {
                                                    ...formData.entertainment,
                                                    activitiesOther: e.target.value,
                                                })
                                            }
                                        />
                                    )}
                            </div>

                            {/* 🎵 Music / DJ / Sound System */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">🎵 Music / DJ / Sound</h4>

                                <div className="grid md:grid-cols-3 gap-2">
                                    {["DJ", "Live Music", "Playlist by Venue", "Other"].map((item) => (
                                        <label key={item} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(formData.entertainment?.music) &&
                                                    formData.entertainment.music.includes(item)}
                                                onChange={() =>
                                                    handleCheckboxChange("entertainment", "music", item)
                                                }
                                            />
                                            {item}
                                        </label>
                                    ))}
                                </div>

                                {/* Other Input */}
                                {Array.isArray(formData.entertainment?.music) &&
                                    formData.entertainment.music.includes("Other") && (
                                        <input
                                            type="text"
                                            className="border p-2 rounded w-full mt-2"
                                            placeholder="Other Music Option"
                                            value={formData.entertainment?.musicOther || ""}
                                            onChange={(e) =>
                                                handleCustomChange("entertainment", {
                                                    ...formData.entertainment,
                                                    musicOther: e.target.value,
                                                })
                                            }
                                        />
                                    )}
                            </div>

                            {/* 🎭 Shows / Performances */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">🎭 Shows / Performances</h4>

                                <div className="grid md:grid-cols-3 gap-2">
                                    {[
                                        "Dance Show",
                                        "Magic Show",
                                        "Puppet Show",
                                        "Cartoon Character",
                                        "Singers/Band",
                                        "Other",
                                    ].map((item) => (
                                        <label key={item} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Array.isArray(formData.entertainment?.shows) &&
                                                    formData.entertainment.shows.includes(item)}
                                                onChange={() =>
                                                    handleCheckboxChange("entertainment", "shows", item)
                                                }
                                            />
                                            {item}
                                        </label>
                                    ))}
                                </div>

                                {/* Other Input */}
                                {Array.isArray(formData.entertainment?.shows) &&
                                    formData.entertainment.shows.includes("Other") && (
                                        <input
                                            type="text"
                                            className="border p-2 rounded w-full mt-2"
                                            placeholder="Other Performance"
                                            value={formData.entertainment?.showsOther || ""}
                                            onChange={(e) =>
                                                handleCustomChange("entertainment", {
                                                    ...formData.entertainment,
                                                    showsOther: e.target.value,
                                                })
                                            }
                                        />
                                    )}
                            </div>
                        </div>

                        {/* 📸 Photography & Videography */}
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">📸 Photography & Videography</h2>

                        {/* Team Required */}
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={formData.photography?.photoTeam || ""}
                                onChange={(e) =>
                                    handleCustomChange("photography", {
                                        ...formData.photography,
                                        photoTeam: e.target.value,
                                        photoTeamDetails: "",
                                    })
                                }
                                className="p-3 border rounded-lg bg-white"
                            >
                                <option value="">Photography Team Required?</option>
                                <option value="Required">Required</option>
                                <option value="Client's Own Team">Client's Own Team</option>
                            </select>
                        </div>

                        {/* If team required → details input */}
                        {formData.photography?.photoTeam === "Required" && (
                            <input
                                type="text"
                                placeholder="Specify any team preferences"
                                className="border p-2 rounded w-full mt-3"
                                value={formData.photography?.photoTeamDetails || ""}
                                onChange={(e) =>
                                    handleCustomChange("photography", {
                                        ...formData.photography,
                                        photoTeamDetails: e.target.value,
                                    })
                                }
                            />
                        )}

                        {/* Conditional Sections */}
                        <div className="mt-6 space-y-6">

                            {/* 🎥 Package Types */}
                            {formData.photography?.photoTeam === "Required" && (
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">🎥 Package Type</h4>

                                    <div className="grid md:grid-cols-3 gap-2">
                                        {["Basic", "Cinematic", "Drone", "Highlights", "Other"].map((item) => (
                                            <label key={item} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(formData.photography?.packageType) &&
                                                        formData.photography.packageType.includes(item)}
                                                    onChange={() =>
                                                        handleCheckboxChange("photography", "packageType", item)
                                                    }
                                                />
                                                {item}
                                            </label>
                                        ))}
                                    </div>

                                    {/* Other Input */}
                                    {Array.isArray(formData.photography?.packageType) &&
                                        formData.photography.packageType.includes("Other") && (
                                            <input
                                                type="text"
                                                className="border p-2 rounded w-full mt-2"
                                                placeholder="Other Package Type"
                                                value={formData.photography?.packageTypeOther || ""}
                                                onChange={(e) =>
                                                    handleCustomChange("photography", {
                                                        ...formData.photography,
                                                        packageTypeOther: e.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                </div>
                            )}

                            {/* 📷 Instant Photo Options */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">📷 Instant Photos</h4>

                                <div className="grid md:grid-cols-3 gap-2">
                                    {["Yes", "No", "Other"].map((option) => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="instantPhoto"
                                                value={option}
                                                checked={formData.photography?.instantPhoto === option}
                                                onChange={(e) =>
                                                    handleCustomChange("photography", {
                                                        ...formData.photography,
                                                        instantPhoto: e.target.value,
                                                    })
                                                }
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>

                                {/* Other input */}
                                {formData.photography?.instantPhoto === "Other" && (
                                    <input
                                        type="text"
                                        className="border p-2 rounded w-full mt-2"
                                        placeholder="Other instant photo option"
                                        value={formData.photography?.instantPhotoOther || ""}
                                        onChange={(e) =>
                                            handleCustomChange("photography", {
                                                ...formData.photography,
                                                instantPhotoOther: e.target.value,
                                            })
                                        }
                                    />
                                )}
                            </div>

                        </div>

                        {/* Return Gifts */}
                        {/* ---------------- Return Gifts Section ---------------- */}
                        {/* ---------------- Return Gifts Section ---------------- */}
                        <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-4">
                            🎁 Return Gifts
                        </h2>

                        <div className="space-y-6">

                            {/* Gift Options */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                    🎁 Gift Options
                                </h4>

                                <div className="grid md:grid-cols-3 gap-2">
                                    {[
                                        "Toys",
                                        "Chocolate Box",
                                        "Personalized Gifts",
                                        "Stationery Set",
                                        "Goodie Bag",
                                        "Customized",
                                        "Gift Hampers",
                                        "Sweets",
                                        "Other",
                                    ].map((item) => (
                                        <label key={item} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="returnGiftType"        // radio group name must be same
                                                checked={formData.returnGifts?.giftType === item}
                                                onChange={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        returnGifts: {
                                                            ...prev.returnGifts,
                                                            giftType: item,       // store selected radio
                                                        },
                                                    }))
                                                }
                                                className="w-4 h-4"
                                            />
                                            {item}
                                        </label>
                                    ))}
                                </div>

                                {/* Show "Other" input */}
                                {Array.isArray(formData.returnGifts?.options) &&
                                    formData.returnGifts.options.includes("Other") && (
                                        <input
                                            type="text"
                                            className="border p-2 rounded w-full mt-2"
                                            placeholder="Specify Other Gift"
                                            value={formData.returnGifts?.optionsOther || ""}
                                            onChange={(e) =>
                                                handleCustomChange("returnGifts", {
                                                    ...formData.returnGifts,
                                                    optionsOther: e.target.value,
                                                })
                                            }
                                        />
                                    )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                    📦 Quantity
                                </h4>
                                <input
                                    type="number"
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter quantity required"
                                    value={formData.returnGifts?.quantity || ""}
                                    onChange={(e) =>
                                        handleCustomChange("returnGifts", {
                                            ...formData.returnGifts,
                                            quantity: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Budget */}
                            
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                    💰 Budget Per Gift
                                </h4>
                                <input
                                    type="number"
                                    className="border p-2 rounded w-full"
                                    placeholder="₹ Budget per item"
                                    value={formData.returnGifts?.budget || ""}
                                    onChange={(e) =>
                                        handleCustomChange("returnGifts", {
                                            ...formData.returnGifts,
                                            budget: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                    📝 Special Notes
                                </h4>
                                <textarea
                                    rows={3}
                                    className="border p-2 rounded w-full"
                                    placeholder="Any special notes or instructions"
                                    value={formData.returnGifts?.notes || ""}
                                    onChange={(e) =>
                                        handleCustomChange("returnGifts", {
                                            ...formData.returnGifts,
                                            notes: e.target.value,
                                        })
                                    }
                                />
                            </div>

                        </div>


                        {/* 👥 Event Staff / Management Team */}
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">👥 Event Staff / Management Team</h2>

                        {/* 🍽 Food & Reception Team */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Number of Food Servers</label>
                                <input
                                    type="number"
                                    value={formData.eventStaff?.foodServers || ""}
                                    onChange={(e) =>
                                        handleCustomChange("eventStaff", {
                                            ...formData.eventStaff,
                                            foodServers: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter number of servers"
                                    min={0}
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Number of Welcome / Reception Staff</label>
                                <input
                                    type="number"
                                    value={formData.eventStaff?.welcomeStaff || ""}
                                    onChange={(e) =>
                                        handleCustomChange("eventStaff", {
                                            ...formData.eventStaff,
                                            welcomeStaff: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter number of welcome staff"
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* 🛠 Maintenance & Handling Team */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Maintenance Team Members</label>
                                <input
                                    type="number"
                                    value={formData.eventStaff?.maintenanceTeam || ""}
                                    onChange={(e) =>
                                        handleCustomChange("eventStaff", {
                                            ...formData.eventStaff,
                                            maintenanceTeam: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter number of maintenance staff"
                                    min={0}
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-gray-700">Other Roles (if any)</label>
                                <input
                                    type="text"
                                    value={formData.eventStaff?.otherRoles || ""}
                                    onChange={(e) =>
                                        handleCustomChange("eventStaff", {
                                            ...formData.eventStaff,
                                            otherRoles: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Specify other roles (e.g., cleaning, helpers)"
                                />
                            </div>
                        </div>

                        {/* 📝 Special Notes / Instructions */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-700">📝 Special Notes / Instructions</label>
                            <textarea
                                value={formData.eventStaff?.staffNotes || ""}
                                onChange={(e) =>
                                    handleCustomChange("eventStaff", {
                                        ...formData.eventStaff,
                                        staffNotes: e.target.value,
                                    })
                                }
                                className="border p-2 rounded w-full"
                                placeholder="Mention additional instructions or preferences"
                                rows={3}
                            />
                        </div>

                        {/* Payment & Booking */}
                        {/* 💰 Budget & Payment Details */}
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">💰 Budget & Payment Details</h2>

                        {/* Total Budget / Package Preference */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2 text-gray-700">Total Budget / Package Preference</label>
                            <input
                                type="number"
                                value={formData.budget?.totalBudget || ""}
                                readOnly
                                className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                            />
                        </div>

                        {/* Advance & Balance Payment */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block font-semibold mb-2 text-gray-700">Advance Payment</label>
                                <input
                                    type="number"
                                    value={formData.budget?.advancePayment || ""}
                                    readOnly
                                    className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-gray-700">Balance Payment</label>
                                <input
                                    type="number"
                                    value={formData.budget?.balancePayment || ""}
                                    readOnly
                                    className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Booking & Payment Status */}
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block font-semibold mb-2 text-gray-700">Booking Status</label>
                                <select
                                    value={formData?.bookingStatus || ""}
                                    onChange={(e) =>
                                        handleCustomChange("budget", {
                                            ...formData,
                                            bookingStatus: e.target.value,
                                        })
                                    }
                                    className="p-3 border rounded w-full bg-white"
                                >
                                    <option value="">Select Booking Status</option>
                                    <option value="Booked">Booked</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-gray-700">Payment Status</label>
                                <select
                                    value={formData?.paymentStatus || ""}
                                    onChange={(e) =>
                                        handleCustomChange("budget", {
                                            ...formData,
                                            paymentStatus: e.target.value,
                                        })
                                    }
                                    className="p-3 border rounded w-full bg-white"
                                >
                                    <option value="">Select Payment Status</option>
                                    <option value="Advance Paid">Advance Paid</option>
                                    <option value="Full Paid">Full Paid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-gray-700">Aid / Advance Amount</label>
                                <input
                                    type="number"
                                    value={formData.budget?.aidAmount || ""}
                                    onChange={(e) =>
                                        handleCustomChange("budget", {
                                            ...formData.budget,
                                            aidAmount: e.target.value,
                                        })
                                    }
                                    className="border p-2 rounded w-full"
                                    placeholder="Enter aid / advance amount"
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Balance Amount */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2 text-gray-700">Balance Amount</label>
                            <input
                                type="number"
                                value={formData.budget?.balanceAmount || ""}
                                onChange={(e) =>
                                    handleCustomChange("budget", {
                                        ...formData.budget,
                                        balanceAmount: e.target.value,
                                    })
                                }
                                className="border p-2 rounded w-full"
                                placeholder="Enter balance amount"
                                min={0}
                            />
                        </div>

                        {/* Optional Notes */}
                        <div>
                            <label className="block font-semibold mb-2 text-gray-700">📝 Notes / Instructions</label>
                            <textarea
                                value={formData.budget?.notes || ""}
                                onChange={(e) =>
                                    handleCustomChange("budget", {
                                        ...formData.budget,
                                        notes: e.target.value,
                                    })
                                }
                                className="border p-2 rounded w-full"
                                placeholder="Additional instructions or preferences"
                                rows={3}
                            />
                        </div>


                        {/* Notes */}
                        <h2 className="text-xl font-semibold text-gray-700 mt-4">📝 Notes</h2>
                        <textarea
                            value={formData.notes ?? ""}
                            onChange={handleChange("notes")}
                            rows="3"
                            className="w-full border rounded-lg p-3"
                        />

                        {/* 💵 Budget Summary Comparison */}
                        <h2 className="text-xl font-semibold text-gray-700 mt-6">💵 Budget Summary</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">

                            <div>
                                <label className="block text-sm text-gray-600">Old Total Budget</label>
                                <p className="text-lg font-medium text-gray-800">
                                    ₹{Number(originalTotal || 0).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600">New Total Budget</label>
                                <p className="text-lg font-medium text-blue-600">
                                    ₹{Number(updatedTotal || calculateTotal(formData) || 0).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600">Difference</label>
                                <p
                                    className={`text-lg font-medium ${updatedTotal - originalTotal >= 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    ₹{(updatedTotal - originalTotal).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600">Advance Paid</label>
                                <p className="text-lg font-medium text-gray-800">
                                    ₹{Number(formData.budget?.advancePayment || 0).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600">Old Balance</label>
                                <p className="text-lg font-medium text-gray-800">
                                    ₹{Math.max(0, (originalTotal || 0) - (Number(formData.budget?.advancePayment) || 0)).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600">New Balance</label>
                                <p className="text-lg font-medium text-blue-600">
                                    ₹{Math.max(0, (updatedTotal || calculateTotal(formData)) - (Number(formData.budget?.advancePayment) || 0)).toLocaleString()}
                                </p>
                            </div>
                        </div>



                        {/* Save / Cancel */}
                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
                            <Button onClick={() => navigate("/events")} variant="outline">Cancel</Button>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
}
