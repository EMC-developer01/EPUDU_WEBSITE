import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import Swiper from "swiper";
// import { SwiperSlide } from "swiper/react";
import ItemCard from "@/components/ui/itencard";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/a11y";
const API_URL = import.meta.env.VITE_API_URL;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;


export default function EventEdits() {
    const navigate = useNavigate();
    const { id } = useParams();

    const BASE_URL = `${API_URL}/api/client`;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [oldBudget, setOldBudget] = useState(null);


    const [formData, setFormData] = useState({
        celebrantName: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        eventDate: "",

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
            welcomeDrinksOther: "",
            welcome_drinks: [],
            starters: [],
            startersOther: "",
            desserts: [],
            dessertsOther: "",
            snacks: [],
            snacksOther: "",
            beverages: [],
            beveragesOther: "",
            fruits: [],
            fruitsOther: "",
            mainCourse: [],
            mainCourseOther: "",
            main_course: [],
            seating: [],
            seatingOther: "",
            cutleryTeam: "",
            cutleryTeamOther: ""
        },
        entertainment: {
            CartoonCharacter: [],
            CartoonCharacterOther: "",
            Dance: [],
            DanceOther: "",
            LivePerformance: [],
            LivePerformanceOther: "",
            MagicShow: [],
            MagicShowOther: "",
            Music_DJ_SoundSystem: [],
            Music_DJ_SoundSystemOther: "",
            PuppetShow: [],
            PuppetShowOther: "",
            activities: [],
            activitiesSelected: [],
            activitiesOther: "",
            emceeRequired: "No",
            emceeDetails: "",
            music: [],        // optional, can be used for music category if needed
            musicOther: "",
            shows: [],        // optional, can be used for LivePerformance / MagicShow / PuppetShow if needed
            showsOther: ""
        },
        photography: {
            photoTeam: "",
            photoTeamDetails: "",
            packageType: [],       // now an array for multiple selections
            packageTypeOther: "",
            instantPhoto: "",
            instantPhotoOther: "",
        },

        bookingStatus: "",
        paymentStatus: "",

        budget: {
            totalBudget: 0,
            advancePayment: 0,
            balancePayment: 0,
        },
    });

    const initialVenues = [
        { id: 1, name: "Grand Indoor Hall", type: "Indoor", lat: 17.3870, lng: 78.4867, stars: 3, image: "/placeholder.jpg", location: "Hyderabad", cost: 20000 },
        { id: 2, name: "City Party Hall", type: "Party Hall", lat: 17.3890, lng: 78.4820, stars: 4, image: "/placeholder.jpg", location: "Hyderabad", cost: 30000 },
        { id: 3, name: "Green Park Lawn", type: "Outdoor", lat: 17.3830, lng: 78.4880, stars: 5, image: "/placeholder.jpg", location: "Hyderabad", cost: 25000 },
    ];

    const [venues, setVenues] = useState(initialVenues);
    const [photographyItems, setPhotographyItems] = useState([]);
    const [stageItems, setStageItems] = useState([]);
    const [entranceItems, setEntranceItems] = useState([]);
    const [photoBoothItems, setPhotoBoothItems] = useState([]);
    const [tableDecorItems, setTableDecorItems] = useState([]);
    const [cakeTableItems, setCakeTableItems] = useState([]);
    const [lightingItems, setLightingItems] = useState([]);
    const [foodSections, setFoodSections] = useState([]);
    const [seatingItems, setSeatingItems] = useState([]);
    const [searchFood, setSearchFood] = useState("");
    const [mealTypeFilter, setMealTypeFilter] = useState("All");
    const [foodTimeFilter, setFoodTimeFilter] = useState("All");
    const [cuisineFilter, setCuisineFilter] = useState("All");
    const [makeupItems, setMakeupItems] = useState([]);
    const [venueItems, setVenueItems] = useState([]);
    const [musicItems, setMusicItems] = useState([]);
    const [entertainmentItems, setEntertainmentItems] = useState([]);
    const fetchItems = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/vendor/items/getitems`);
            const allItems = res.data.items;
            // console.log(res.data.items);

            // Filter According to Categories
            const decorationItems = allItems.filter(i => i.category === "Decoration");

            const stageItem = decorationItems.filter(i => i.subcategory === "Stage");
            setStageItems(stageItem);
            const entranceItem = decorationItems.filter(i => i.subcategory === "Entrance");
            setEntranceItems(entranceItem);
            const photoBoothItem = decorationItems.filter(i => i.subcategory === "Photo Booth");
            setPhotoBoothItems(photoBoothItem);
            const tableDecorItem = decorationItems.filter(i => i.subcategory === "Table Decor");
            setTableDecorItems(tableDecorItem);
            const caketableItem = decorationItems.filter(i => i.subcategory === "Cake Setup");
            setCakeTableItems(caketableItem);
            const lightingItem = decorationItems.filter(i => i.subcategory === "Lighting");
            setLightingItems(lightingItem);
            const SeatingItem = decorationItems.filter(i => i.subcategory === "seating");
            setSeatingItems(SeatingItem);

            // const cateringItems = allItems.filter(i => i.category === "Catering");
            // STEP 1: Base Catering Items
            const cateringItems = allItems.filter(i => i.category === "Catering");
            const priorityOrder = ["Main Course", "Starter", "Breakfast", "Snacks", "Dessert", "Drinks"];

            cateringItems.sort((a, b) => {
                const aIdx = priorityOrder.indexOf(a.subcategory);
                const bIdx = priorityOrder.indexOf(b.subcategory);
                return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
            });

            const foodGroups = {};
            cateringItems.forEach(item => {
                if (!foodGroups[item.subcategory]) foodGroups[item.subcategory] = [];
                foodGroups[item.subcategory].push(item);
            });

            const backendFoodSections = Object.keys(foodGroups).map(sub => ({
                title: sub,
                category: "Catering",
                field: sub.toLowerCase().replace(/ /g, "_"),
                items: foodGroups[sub]
            }));

            setFoodSections(backendFoodSections);

            const photographyItems = allItems.filter(i => i.category === "Photography");
            const makeupItems = allItems.filter(i => i.category === "Makeup");
            const venueItems = allItems.filter(i => i.category === "Venue");
            const musicItems = allItems.filter(i => i.category === "Music");
            const entertainmentItems = allItems.filter(i => i.category === "Entertainment");

            // Set States
            // setDecorationItems(decorationItems);
            // setCateringItems(cateringItems);
            setPhotographyItems(photographyItems);
            // setMakeupItems(makeupItems);
            // setVenueItems(venueItems);
            // setMusicItems(musicItems);
            setEntertainmentItems(entertainmentItems);

            // 👉 PLACE YOUR LOG HERE
            console.log(
                "Decoration:", decorationItems,
                "Catering:", cateringItems,
                "Photography:", photographyItems,
                "Makeup:", makeupItems,
                "Venue:", venueItems,
                "Music:", musicItems,
                "Entertainment:", entertainmentItems
            );

        } catch (err) {
            console.error("Error fetching items:", err);
        }
    };
    useEffect(() => {
        fetchItems();
    }, []);


    const handleCustomChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                ...value,
            },
        }));
    };
    const filterItems = (items) => {
        return items.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchFood.toLowerCase());

            const matchesMealType =
                mealTypeFilter === "All" || item.mealType === mealTypeFilter;

            const matchesFoodTime =
                foodTimeFilter === "All" || item.foodTime === foodTimeFilter;

            const matchesCuisine =
                cuisineFilter === "All" || item.cuisine === cuisineFilter;

            return matchesSearch && matchesMealType && matchesFoodTime && matchesCuisine;
        });
    };



    /* ================= FETCH EVENT ================= */
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/birthday/order/${id}`);
                console.log(res.data)
                const data = res.data;

                // ✅ SAVE OLD BUDGET SNAPSHOT
                setOldBudget(data.budget);
                setFormData((prev) => ({
                    ...prev,
                    ...res.data,
                    venue: res.data.venue || prev.venue,
                    timings: res.data.timings || prev.timings,
                    decoration: {
                        ...prev.decoration,
                        ...res.data.decoration,
                    },
                    foodArrangements: res.data.foodArrangements || {},
                    entertainment: res.data.entertainment || {},
                    photography: res.data.photography || {},

                    budget: res.data.budget || prev.budget,
                }));
            } catch (err) {
                console.error("❌ Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    /* ================= HANDLE CHANGE (NESTED SAFE) ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (parent, field, item, price = 0, multiplyByGuests = false) => {

        const safeField = field.replace(/\s+/g, "");
        setFormData((prev) => {

            const existingList = prev[parent]?.[safeField] || [];

            // Check if item already exists
            const exists = existingList.some((i) => i._id === item._id);

            let updatedList;

            if (exists) {
                // REMOVE the item
                updatedList = existingList.filter((i) => i._id !== item._id);
            } else {
                // ADD the item with all required details
                updatedList = [
                    ...existingList,
                    {
                        _id: item._id,
                        vendorId: item.vendorId,
                        name: item.name,
                        price: multiplyByGuests ? price * (prev.guests || 1) : price,
                        image: item.image,
                    },
                ];
            }


            const updatedFormData = {
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [safeField]: updatedList,
                },
            };

            return updatedFormData;
        });

        // UPDATE PRICE FUNCTION
        updateCost(parent, field, price, !formData[parent]?.[field]?.some(i => i._id === item._id), multiplyByGuests);
    };
    const updateCost = (category, subCategory, price, isAdding, multiplyByGuests = false) => {
        const guestCount = Number(formData.timings.capacity) || 1;

        const finalPrice = multiplyByGuests ? price * guestCount : price;

        setCosts(prev => {
            const updatedSubCost = isAdding
                ? prev[category][subCategory] + finalPrice
                : prev[category][subCategory] - finalPrice;

            const updatedCategoryTotal =
                prev[category].total +
                (isAdding ? finalPrice : -finalPrice);

            return {
                ...prev,

                [category]: {
                    ...prev[category],
                    [subCategory]: updatedSubCost,
                    total: updatedCategoryTotal
                },

                total: prev.total + (isAdding ? finalPrice : -finalPrice),

            };
        });
    };
    const [costs, setCosts] = useState({
        venue: 0,

        decoration: {
            themeScheme: 0,
            stageDesign: 0,
            entranceDecor: 0,
            photoBoothDesign: 0,
            tableDecor: 0,
            cakeSetup: 0,
            lighting: 0,
            total: 0
        },

        foodArrangements: {
            welcomeDrinks: 0,
            starters: 0,
            desserts: 0,
            snacks: 0,
            beverages: 0,
            fruits: 0,
            mainCourse: 0,
            total: 0
        },

        entertainment: {
            CartoonCharacter: 0,
            Dance: 0,
            LivePerformance: 0,
            MagicShow: 0,
            Music_DJ_SoundSystem: 0,
            PuppetShow: 0,
            activities: 0,
            emceeRequired: 0,
            total: 0
        },

        photography: {
            packageType: 0,
            instantPhoto: 0,
            photoTeam: 0,
            total: 0
        },

        returnGifts: {
            giftType: 0,
            quantity: 0,
            budget: 0,
            total: 0,
        },
        eventStaff: {
            foodServers: 0,
            welcomeStaff: 0,
            maintenanceTeam: 0,
            otherRoles: 0,
            total: 0,
        },

        total: 0
    });
    useEffect(() => {
        if (!oldBudget) return;

        const oldOriginal = Number(oldBudget.originalCost || 0);
        const oldAdvance = Number(oldBudget.advancePayment || 0);
        const oldTotalPaid = Number(oldBudget.totalBudget || 0);

        // 🆕 ORIGINAL COST = OLD + DELTA
        const newOriginal = oldOriginal + Number(costs.total || 0);

        // GST & CGST
        const gst = newOriginal * 0.11;
        const cgst = newOriginal * 0.07;

        const newTotal = newOriginal + gst + cgst;

        let advance = 0;
        let balance = newTotal;

        // ✅ PAYMENT STATUS LOGIC
        if (formData.paymentStatus === "Advance Paid") {
            advance = oldAdvance;
            balance = newTotal - oldAdvance;
        }
        else if (formData.paymentStatus === "Completed" || formData.paymentStatus === "Fully Paid") {
            advance = oldTotalPaid;
            balance = newTotal - oldTotalPaid;
        }
        else {
            // Pending / Not Paid
            advance = 0;
            balance = newTotal;
        }

        setFormData(prev => ({
            ...prev,
            budget: {
                ...prev.budget,
                originalCost: newOriginal,
                gstAmount: gst,
                cgstAmount: cgst,
                totalBudget: newTotal,
                advancePayment: advance,
                balancePayment: balance,
            }
        }));

    }, [costs.total, formData.paymentStatus, oldBudget]);


    /* ================= UPDATE ================= */
    const handleUpdate = async () => {
        try {
            await axios.put(`${BASE_URL}/birthday/update/admin/${id}`, formData);
            alert("✅ Event updated successfully");
            navigate("/events");
        } catch (err) {
            console.error("❌ Update failed:", err);
        }
    };

    if (loading) return <p className="p-6">Loading...</p>;

    const DecorationSlider = ({ title, items, selected = [], onSelect }) => (
        <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4 text-pink-600">{title}</h3>

            <Swiper spaceBetween={8} slidesPerView={2} breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
            }}>
                {items.map(item => {
                    const isSelected = selected.some(i => i._id === item._id);
                    const price = item.price * 1.5;

                    return (
                        <SwiperSlide key={item._id}>
                            <div
                                onClick={() => onSelect(item, price)}
                                className={`cursor-pointer ${isSelected ? "ring-4 ring-pink-500 scale-105" : ""}`}
                            >
                                <ItemCard image={item.image} name={item.name} price={item.price} />
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                                        ✔
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );


    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-x-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header title="Edit Event" />

                {/* ✅ SCROLL ENABLED */}
                <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w">

                    {/* BASIC DETAILS */}
                    <h2 className="text-xl font-bold">Basic Details</h2>

                    <Input name="celebrantName" value={formData.celebrantName || ""} onChange={handleChange} placeholder="Celebrant Name" />
                    <Input name="themePreference" value={formData.themePreference || ""} onChange={handleChange} placeholder="Theme Preference" />
                    <Input name="age" value={formData.age || ""} onChange={handleChange} placeholder="Age" />
                    <Input name="phone" value={formData.phone || ""} onChange={handleChange} placeholder="Phone" />
                    <Input name="email" value={formData.email || ""} onChange={handleChange} placeholder="Email" />

                    <select name="gender" value={formData.gender || ""} onChange={handleChange} className="border p-2 rounded w-full">
                        <option value="">Gender</option>
                        <option value="Girl">Girl</option>
                        <option value="Boy">Boy</option>
                        <option value="Other">Other</option>
                    </select>

                    <Input type="date" name="eventDate" value={formData.eventDate || ""} onChange={handleChange} />

                    {/* VENUE */}
                    <h2 className="text-xl font-bold pt-4">Venue</h2>

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* LEFT: VENUE EDIT FORM */}
                        <div className="lg:w-1/2 space-y-4">
                            <Input
                                name="venue.name"
                                placeholder="Venue Name"
                                value={formData.venue?.name || ""}
                                onChange={handleChange}
                            />

                            <Input
                                name="venue.address"
                                placeholder="Address"
                                value={formData.venue?.address || ""}
                                onChange={handleChange}
                            />

                            <Input
                                name="venue.city"
                                placeholder="City"
                                value={formData.venue?.city || ""}
                                onChange={handleChange}
                            />

                            {/* Optional: Show selected cost */}
                            {formData.venue?.cost && (
                                <p className="font-semibold text-green-600">
                                    Selected Venue Cost: ₹{formData.venue.cost}
                                </p>
                            )}
                        </div>

                        {/* RIGHT: VENUE LIST */}
                        <div className="lg:w-1/2 space-y-4 overflow-y-auto max-h-[500px] border rounded-lg p-4">
                            {venues.map((v) => (
                                <div
                                    key={v.id}
                                    onClick={() => {
                                        setSelectedVenue(v);
                                        handleCustomChange("venue", {
                                            name: v.name,
                                            address: v.type || "",
                                            city: v.location || "",
                                            cost: v.cost || 0,
                                        });
                                    }}
                                    className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition
                    ${selectedVenue?.id === v.id
                                            ? "bg-pink-50 border-pink-400"
                                            : "hover:bg-gray-50"
                                        }`}
                                >
                                    <img
                                        src={v.image}
                                        alt={v.name}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />

                                    <div className="flex flex-col justify-between">
                                        <h4 className="font-semibold">{v.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {v.type} | {v.location}
                                        </p>
                                        <p className="text-yellow-500 text-sm">
                                            {"★".repeat(v.stars)}{"☆".repeat(5 - v.stars)}
                                        </p>
                                        <p className="font-bold mt-1">₹ {v.cost}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>


                    {/* TIMINGS */}
                    <h2 className="text-xl font-bold pt-4">Timings</h2>

                    <Input type="time" name="timings.time" value={formData.timings?.time || ""} onChange={handleChange} />
                    {/* <Input type="date" name="timings.date" value={formData.timings?.date || ""} onChange={handleChange} /> */}
                    <Input name="timings.capacity" value={formData.timings?.capacity || ""} onChange={handleChange} placeholder="Capacity" />

                    {/* decoration */}
                    <div className="p-6 border-2 border-pink-300 rounded-2xl bg-gradient-to-r from-pink-50 to-yellow-50 shadow-lg">
                        <h3 className="text-2xl font-bold text-pink-600 text-center mb-6">
                            🎀 Decoration & Theme Preferences 🎀
                        </h3>

                        {/* Theme */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-2">Theme / Color Scheme</label>
                            <input
                                type="text"
                                name="decoration.themeScheme"
                                value={formData.decoration?.themeScheme || ""}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>

                        {/* STAGE DESIGN */}
                        <DecorationSlider
                            title="Stage Design Options"
                            items={stageItems}
                            selected={formData.decoration.stageDesign}
                            onSelect={(item, price) =>
                                handleCheckboxChange("decoration", "stageDesign", item, price)
                            }
                        />

                        <DecorationSlider
                            title="Entrance Decoration Options"
                            items={entranceItems}
                            selected={formData.decoration.entranceDecor}
                            onSelect={(item, price) =>
                                handleCheckboxChange("decoration", "entranceDecor", item, price)
                            }
                        />

                        <DecorationSlider
                            title="Photo Booth / Selfie Corner"
                            items={photoBoothItems}
                            selected={formData.decoration.photoBoothDesign}
                            onSelect={(item, price) =>
                                handleCheckboxChange("decoration", "photoBoothDesign", item, price)
                            }
                        />

                        <DecorationSlider
                            title="Table / Ceiling / Seating Decor"
                            items={tableDecorItems}
                            selected={formData.decoration.tableDecor}
                            onSelect={(item, price) =>
                                handleCheckboxChange("decoration", "tableDecor", item, price)
                            }
                        />

                        <DecorationSlider
                            title="Cake Table Setup"
                            items={cakeTableItems}
                            selected={formData.decoration.cakeSetup}
                            onSelect={(item, price) =>
                                handleCheckboxChange("decoration", "cakeSetup", item, price)
                            }
                        />

                        <DecorationSlider
                            title="Lightings"
                            items={lightingItems}
                            selected={formData.decoration.lighting}
                            onSelect={(item, price) =>
                                handleCheckboxChange("decoration", "lighting", item, price)
                            }
                        />
                    </div>

                    {/* food arrangements */}
                    <div className="w-full space-y-10 pb-20 px-2 md:px-4">
                        {/* Step Title */}
                        <h3 className="text-2xl font-bold text-pink-600 text-center mb-6">
                            🍽️ Food Arrangements 🍽️
                        </h3>

                        {/* SEARCH + FILTERS */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Search food items..."
                                value={searchFood}
                                onChange={(e) => setSearchFood(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                            <select
                                className="border p-2 rounded w-full"
                                value={mealTypeFilter}
                                onChange={(e) => setMealTypeFilter(e.target.value)}
                            >
                                <option value="All">Meal Type (All)</option>
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                            <select
                                className="border p-2 rounded w-full"
                                value={foodTimeFilter}
                                onChange={(e) => setFoodTimeFilter(e.target.value)}
                            >
                                <option value="All">Food Time (All)</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Dinner">Dinner</option>
                            </select>
                            <select
                                className="border p-2 rounded w-full"
                                value={cuisineFilter}
                                onChange={(e) => setCuisineFilter(e.target.value)}
                            >
                                <option value="All">Cuisine (All)</option>
                                <option value="Indian">Indian</option>
                                <option value="North Indian">North Indian</option>
                                <option value="South Indian">South Indian</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Italian">Italian</option>
                            </select>
                        </div>

                        {/* FOOD SECTIONS */}
                        {foodSections?.map((section, secIdx) => {
                            const filteredItems = filterItems(section.items);
                            if (!filteredItems.length) return null;

                            return (
                                <div key={`${section.field}-${secIdx}`} className="mb-10 w-full">
                                    <h4 className="text-xl font-semibold mb-3 text-blue-600">{section.title}</h4>

                                    {/* MAIN COURSE - grouped by foodModel */}
                                    {section.title === "Main Course" ? (
                                        Object.entries(
                                            filteredItems.reduce((acc, item) => {
                                                if (!acc[item.foodModel]) acc[item.foodModel] = [];
                                                acc[item.foodModel].push(item);
                                                return acc;
                                            }, {})
                                        ).map(([model, items], modelIdx) => (
                                            <div key={`${model}-${modelIdx}`} className="mb-6 w-full">
                                                <h5 className="text-lg font-medium mb-2 text-pink-600">{model}</h5>

                                                <div className="mb-6">
                                                    <Swiper
                                                        modules={[A11y]}
                                                        loop={false}
                                                        spaceBetween={8}
                                                        slidesPerView={2}
                                                        breakpoints={{
                                                            640: { slidesPerView: 3 },
                                                            768: { slidesPerView: 3 },
                                                            1024: { slidesPerView: 4 },
                                                            1280: { slidesPerView: 5 },
                                                        }}
                                                        className="w-full"
                                                    >
                                                        {items.map((item) => {
                                                            const isSelected = formData.foodArrangements[section.field]?.some(i => i._id === item._id);
                                                            const dynamicPrice = item.price * 1.5;

                                                            return (
                                                                <SwiperSlide key={item._id} className="flex justify-center">
                                                                    <div
                                                                        onClick={() =>
                                                                            handleCheckboxChange(
                                                                                "foodArrangements",
                                                                                section.field,
                                                                                item,
                                                                                dynamicPrice,
                                                                                true
                                                                            )
                                                                        }
                                                                        className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""
                                                                            }`}
                                                                    >
                                                                        <ItemCard image={item.image} name={item.name} price={item.price} />
                                                                        {isSelected && (
                                                                            <div className="absolute top-2 right-2 bg-pink-600 text-white rounded-full p-1 text-xs">
                                                                                ✔
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </SwiperSlide>
                                                            );
                                                        })}

                                                        {/* Other Option */}
                                                    </Swiper>
                                                </div>

                                                {/* Input for Other */}
                                                {formData.foodArrangements[section.field]?.includes("Other") && (
                                                    <input
                                                        type="text"
                                                        placeholder={`Specify your ${section.title}`}
                                                        value={formData.foodArrangements[`${section.field}Other`] || ""}
                                                        onChange={(e) =>
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                foodArrangements: {
                                                                    ...prev.foodArrangements,
                                                                    [`${section.field}Other`]: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="border p-2 rounded w-full mt-3"
                                                    />
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        // OTHER SECTIONS
                                        <div className="overflow-x-auto w-full flex gap-4 pb-3">
                                            {filteredItems.map((item, idx) => {
                                                const dynamicPrice = item.price * 1.5;
                                                const isSelected = formData.foodArrangements[section.field]?.some(i => i._id === item._id);

                                                return (
                                                    <div
                                                        key={`${item.name}-${idx}`}
                                                        className="relative min-w-[160px] shrink-0"
                                                        onClick={() =>
                                                            handleCheckboxChange(
                                                                "foodArrangements",
                                                                section.field,
                                                                item,
                                                                dynamicPrice,
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={`absolute inset-0 border-4 rounded-2xl pointer-events-none ${isSelected ? "border-pink-500" : "border-transparent"
                                                                }`}
                                                        />
                                                        <ItemCard image={item.image} name={item.name} price={item.price} />
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 bg-pink-600 text-white rounded-full p-1 text-xs">
                                                                ✔
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Other Option */}
                                            <div
                                                className="relative min-w-[160px] shrink-0"
                                                onClick={() =>
                                                    handleCheckboxChange("foodArrangements", section.field, "Other", "Other", 0, false)
                                                }
                                            >
                                                <div
                                                    className={`absolute inset-0 border-4 rounded-2xl pointer-events-none ${formData.foodArrangements[section.field]?.includes("Other")
                                                        ? "border-pink-500"
                                                        : "border-transparent"
                                                        }`}
                                                />
                                                <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-2xl text-gray-700 font-semibold shadow">
                                                    Other
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Seating Arrangements */}
                        <div className="mb-6 w-full">
                            <h3 className="font-semibold text-lg mb-4 text-green-600">Seating Arrangements</h3>
                            <div className="overflow-x-auto w-full">
                                <Swiper
                                    modules={[A11y]}
                                    loop={false}
                                    spaceBetween={8}
                                    slidesPerView={2}
                                    breakpoints={{
                                        640: { slidesPerView: 3 },
                                        768: { slidesPerView: 3 },
                                        1024: { slidesPerView: 4 },
                                        1280: { slidesPerView: 5 },
                                    }}
                                    className="w-full"
                                >
                                    {seatingItems.map((item, idx) => {
                                        const dynamicPrice = item.price * 1.5;
                                        const isSelected = formData.foodArrangements.seating?.some(i => i._id === item._id);

                                        return (
                                            <SwiperSlide key={`${item.name}-${idx}`} className="flex justify-center w-[160px] shrink-0">
                                                <div
                                                    onClick={() =>
                                                        handleCheckboxChange(
                                                            "foodArrangements",
                                                            "seating",
                                                            item,
                                                            dynamicPrice,
                                                            true
                                                        )
                                                    }
                                                    className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""
                                                        }`}
                                                >
                                                    <ItemCard image={item.image} name={item.name} price={item.price} />
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 bg-pink-600 text-white rounded-full p-1 text-xs">
                                                            ✔
                                                        </div>
                                                    )}
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>
                            </div>
                        </div>
                    </div>

                    {/*entertainment*/}
                    <div className="p-6 border-2 border-purple-300 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg w-full">
                        <h3 className="text-2xl font-bold text-purple-600 text-center mb-6">
                            🎉 Entertainment & Activities
                        </h3>

                        {/* Emcee / Anchor */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2 text-gray-700">🎤 Emcee / Anchor Required?</h4>
                            <div className="flex gap-6">
                                {["Yes", "No"].map((option) => (
                                    <label key={option} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="emceeRequired"
                                            value={option}
                                            checked={formData.entertainment?.emceeRequired === option}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    entertainment: {
                                                        ...prev.entertainment,
                                                        emceeRequired: value,
                                                        emceeDetails: value === "Yes" ? (prev.entertainment?.emceeDetails || "") : "",
                                                    },
                                                }));
                                                updateCost(
                                                    "entertainment",
                                                    "emceeRequired",
                                                    1500,
                                                    value === "Yes",   // add if Yes, remove if No
                                                    false              // not multiplied by guests
                                                );
                                            }}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>

                            {formData.entertainment?.emceeRequired === "Yes" && (
                                <input
                                    type="text"
                                    placeholder="Specify any preferences for emcee/anchor"
                                    value={formData.entertainment?.emceeDetails || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            entertainment: {
                                                ...prev.entertainment,
                                                emceeDetails: e.target.value,
                                            },
                                        }))
                                    }
                                    className="border p-2 rounded w-full mt-2"
                                />
                            )}
                        </div>

                        {/* Entertainment subcategories -> grouped by item.subcategory */}
                        {entertainmentItems?.length > 0 &&
                            Object.entries(
                                entertainmentItems.reduce((acc, item) => {
                                    const sub = item.subcategory || "Other";
                                    if (!acc[sub]) acc[sub] = [];
                                    acc[sub].push(item);
                                    return acc;
                                }, {})
                            ).map(([subcategoryRaw, items], idx) => {
                                // state key: use a safe key (no spaces) - you can adapt mapping if required
                                const stateKey = subcategoryRaw.replace(/\s+/g, "");
                                // which array in formData to use for selections
                                const selectedArray = Array.isArray(formData.entertainment?.[stateKey])
                                    ? formData.entertainment[stateKey]
                                    : [];

                                return (
                                    <div key={stateKey + "-" + idx} className="mb-6 w-full">
                                        <h4 className="text-lg font-semibold mb-3 text-purple-600">🎯 {subcategoryRaw}</h4>

                                        {/* Swiper slider for this subcategory */}
                                        <Swiper
                                            modules={[A11y]}
                                            loop={false}
                                            spaceBetween={8}
                                            slidesPerView={2}
                                            breakpoints={{
                                                480: { slidesPerView: 2 },
                                                640: { slidesPerView: 3 },
                                                768: { slidesPerView: 3 },
                                                1024: { slidesPerView: 4 },
                                                1280: { slidesPerView: 5 },
                                            }}
                                            className="w-full"
                                            grabCursor={true}
                                        >
                                            {items.map((item) => {
                                                const isSelected = selectedArray?.some(i => i._id === item._id);
                                                const Price = item.price * 1.5;

                                                return (
                                                    <SwiperSlide key={item._id} className="flex justify-center">
                                                        <div
                                                            onClick={() =>
                                                                handleCheckboxChange(
                                                                    "entertainment",
                                                                    stateKey,
                                                                    item,
                                                                    Price,
                                                                    false
                                                                )
                                                            }
                                                            className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-purple-500 rounded-2xl" : ""}`}
                                                        >
                                                            <div className="w-full max-w-[160px] h-40">
                                                                <ItemCard image={item.image} name={item.name} price={item.price} />
                                                            </div>

                                                            {isSelected && (
                                                                <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1 text-xs">
                                                                    ✔
                                                                </div>
                                                            )}
                                                        </div>
                                                    </SwiperSlide>
                                                );
                                            })}
                                        </Swiper>

                                        {/* Other checkbox & input */}
                                    </div>
                                );
                            })}

                        {/* Seating / Summary area or dynamic cost (optional) */}
                        {/* If you want a dynamic cost display, you can compute it here similarly to step 5 */}
                    </div>

                    {/*phography*/}
                    <div className="my-2 p-6 border-2 border-green-300 rounded-2xl bg-gradient-to-r from-green-50 to-yellow-50 shadow-lg w-full">
                        <h3 className="text-2xl font-bold text-green-600 text-center mb-6">
                            📸 Photography & Videography
                        </h3>

                        {/* Team Requirement */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2 text-gray-700">👥 Team Requirement</h4>

                            <div className="flex flex-wrap gap-6">
                                {["Required", "Client's Own Team"].map((option) => (
                                    <label key={option} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="photoTeam"
                                            value={option}
                                            checked={formData.photography.photoTeam === option}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    photography: {
                                                        ...prev.photography,
                                                        photoTeam: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>

                            {formData.photography.photoTeam === "Required" && (
                                <input
                                    type="text"
                                    placeholder="Specify any preferences for photography/videography team"
                                    value={formData.photography.photoTeamDetails || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            photography: {
                                                ...prev.photography,
                                                photoTeamDetails: e.target.value,
                                            },
                                        }))
                                    }
                                    className="border p-2 rounded w-full mt-3"
                                />
                            )}
                        </div>

                        {/* Photography Team Items (Swiper) */}
                        {formData.photography.photoTeam === "Required" && photographyItems?.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-3 text-green-700">
                                    🎥 Photography/Videography Packages
                                </h4>

                                <Swiper
                                    modules={[A11y]}
                                    loop={false}
                                    spaceBetween={8}
                                    slidesPerView={2}
                                    breakpoints={{
                                        640: { slidesPerView: 3 },
                                        768: { slidesPerView: 3 },
                                        1024: { slidesPerView: 4 },
                                        1280: { slidesPerView: 5 },
                                    }}
                                    className="w-full"
                                    grabCursor={true}
                                >
                                    {photographyItems.map((item) => {
                                        const selectedArray = formData.photography.packageType || [];
                                        const isSelected = selectedArray?.some(i => i._id === item._id);

                                        let Price = item.price * 1.5;

                                        return (
                                            <SwiperSlide key={item._id} className="flex justify-center">
                                                <div
                                                    onClick={() =>
                                                        handleCheckboxChange(
                                                            "photography",
                                                            "packageType",
                                                            item,
                                                            Price,
                                                            false
                                                        )
                                                    }
                                                    className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-green-500 rounded-2xl" : ""
                                                        }`}
                                                >
                                                    <div className="w-full max-w-[160px] h-40">
                                                        <ItemCard image={item.image} name={item.name} price={item.price} />
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1 text-xs">
                                                            ✔
                                                        </div>
                                                    )}
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>

                                {/* Other option */}
                                <div className="mt-3 flex items-center gap-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.photography.packageType?.includes("Other")}
                                            onChange={() =>
                                                handleCheckboxChange("photography", "packageType", "Other", "Other", 0, true)
                                            }
                                        />
                                        Other
                                    </label>

                                    {formData.photography.packageType?.includes("Other") && (
                                        <input
                                            type="text"
                                            placeholder="Specify other photography package"
                                            value={formData.photography.packageTypeOther || ""}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    photography: {
                                                        ...prev.photography,
                                                        packageTypeOther: e.target.value,
                                                    },
                                                }))
                                            }
                                            className="border p-2 rounded w-full max-w-xl"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Instant Photo Options */}
                        <div>
                            <h4 className="text-lg font-semibold mb-2 text-gray-700">📷 Instant Photo Options</h4>

                            <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-3">
                                {["Yes", "No", "Other"].map((option) => (
                                    <div key={option}>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="photography.instantPhoto"
                                                value={option}
                                                checked={formData.photography.instantPhoto === option}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handleChange(e);

                                                    updateCost(
                                                        "photography",
                                                        "instantPhoto",
                                                        200,
                                                        value === "Yes",
                                                        true
                                                    );
                                                }}
                                            />
                                            {option}
                                        </label>

                                        {option === "Other" && formData.photography.instantPhoto === "Other" && (
                                            <input
                                                type="text"
                                                placeholder="Specify other instant photo option"
                                                value={formData.photography.instantPhotoOther || ""}
                                                onChange={(e) =>
                                                    handleChange({
                                                        target: {
                                                            name: "photography.instantPhotoOther",
                                                            value: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="border p-2 rounded w-full mt-2"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/*returngifts*/}
                    <div className="my-2 p-6 border-2 border-purple-300 rounded-2xl bg-gradient-to-r from-purple-50 to-yellow-50 shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-700 text-center mb-6">
                            Return Gifts
                        </h3>

                        {/* Quantity */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-2 text-gray-700">📦 Number of Gifts</label>
                            <input
                                type="number"
                                name="returnGifts.quantity"
                                value={formData.returnGifts.quantity}
                                min="0"
                                onChange={(e) => {
                                    const oldQty = Number(formData.returnGifts.quantity) || 0;
                                    const newQty = Number(e.target.value) || 0;
                                    const price = Number(formData.returnGifts.budget) || 0;

                                    // REMOVE OLD COST
                                    if (oldQty > 0 && price > 0) {
                                        updateCost("returnGifts", "total", oldQty * price, false);
                                    }

                                    // ADD NEW COST
                                    if (newQty > 0 && price > 0) {
                                        updateCost("returnGifts", "total", newQty * price, true);
                                    }

                                    handleChange(e);
                                }}
                                className="w-full p-3 border rounded-lg"
                                placeholder="Enter number of gifts"
                            />
                        </div>

                        {/* Cost per Gift */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-2 text-gray-700">💰 Cost Per Gift</label>
                            <input
                                type="number"
                                name="returnGifts.budget"
                                value={formData.returnGifts.budget}
                                min="0"
                                onChange={(e) => {
                                    const oldPrice = Number(formData.returnGifts.budget) || 0;
                                    const newPrice = Number(e.target.value) || 0;
                                    const qty = Number(formData.returnGifts.quantity) || 0;

                                    if (qty > 0) {
                                        // Remove old total
                                        if (oldPrice > 0) updateCost("returnGifts", "total", qty * oldPrice, false);

                                        // Add new total
                                        if (newPrice > 0) updateCost("returnGifts", "total", qty * newPrice, true);
                                    }

                                    handleChange(e);
                                }}
                                className="w-full p-3 border rounded-lg"
                                placeholder="Enter cost per gift"
                            />
                        </div>

                        {/* Gift Type Selection */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-2 text-gray-700">🎁 Gift Type</label>

                            <div className="grid md:grid-cols-2 gap-4">
                                {["Toys", "Sweets", "Customized Gift Hampers", "Other"].map((type) => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="returnGifts.giftType"
                                            value={type}
                                            checked={formData.returnGifts.giftType === type}
                                            onChange={(e) => {
                                                handleChange(e);
                                                if (type !== "Other") {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        returnGifts: { ...prev.returnGifts, giftTypeOther: "" }
                                                    }));
                                                }
                                            }}
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>

                            {/* Custom gift type */}
                            {formData.returnGifts.giftType === "Other" && (
                                <input
                                    type="text"
                                    name="returnGifts.giftTypeOther"
                                    value={formData.returnGifts.giftTypeOther}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg mt-3"
                                    placeholder="Specify other gift type"
                                />
                            )}
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="block font-semibold mb-2 text-gray-700">📝 Notes / Instructions</label>
                            <textarea
                                name="returnGifts.notes"
                                value={formData.returnGifts.notes}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg"
                                rows="3"
                                placeholder="Any special gift instructions..."
                            ></textarea>
                        </div>
                    </div>

                    {/* staff members */}
                    <div className="my-2 p-6 border-2 border-green-300 rounded-2xl bg-gradient-to-r from-green-50 to-yellow-50 shadow-lg">
                        <h3 className="text-2xl font-bold text-green-700 text-center mb-6">
                            👥 Event Staff / Management Team
                        </h3>

                        {/* Food & Reception Team */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">🍽 Food & Reception Team</h4>
                            <div className="mb-6">
                                <label className="block font-semibold mb-2 text-gray-700">Number of Food Servers</label>
                                <input
                                    type="number"
                                    name="eventStaff.foodServers"
                                    value={formData.eventStaff.foodServers}
                                    min="0"
                                    onChange={(e) => {
                                        const oldCount = Number(formData.eventStaff.foodServers) || 0;
                                        const newCount = Number(e.target.value) || 0;

                                        // REMOVE old cost
                                        if (oldCount > 0) {
                                            updateCost("eventStaff", "foodServers", oldCount * 1500, false);
                                        }

                                        // ADD new cost
                                        if (newCount > 0) {
                                            updateCost("eventStaff", "foodServers", newCount * 1500, true);
                                        }

                                        handleChange(e);
                                    }}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Enter count"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block font-semibold mb-2 text-gray-700">Welcome / Reception Staff</label>
                                <input
                                    type="number"
                                    name="eventStaff.welcomeStaff"
                                    value={formData.eventStaff.welcomeStaff}
                                    min="0"
                                    onChange={(e) => {
                                        const oldCount = Number(formData.eventStaff.welcomeStaff) || 0;
                                        const newCount = Number(e.target.value) || 0;

                                        if (oldCount > 0) {
                                            updateCost("eventStaff", "welcomeStaff", oldCount * 1500, false);
                                        }
                                        if (newCount > 0) {
                                            updateCost("eventStaff", "welcomeStaff", newCount * 1500, true);
                                        }

                                        handleChange(e);
                                    }}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Enter count"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block font-semibold mb-2 text-gray-700">Maintenance Team Members</label>
                                <input
                                    type="number"
                                    name="eventStaff.maintenanceTeam"
                                    value={formData.eventStaff.maintenanceTeam}
                                    min="0"
                                    onChange={(e) => {
                                        const oldCount = Number(formData.eventStaff.maintenanceTeam) || 0;
                                        const newCount = Number(e.target.value) || 0;

                                        if (oldCount > 0) {
                                            updateCost("eventStaff", "maintenanceTeam", oldCount * 1500, false);
                                        }
                                        if (newCount > 0) {
                                            updateCost("eventStaff", "maintenanceTeam", newCount * 1500, true);
                                        }

                                        handleChange(e);
                                    }}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Enter count"
                                />
                            </div>

                            {/* Other Roles */}
                            <div className="mb-6">
                                <label className="block font-semibold mb-2 text-gray-700">Other Roles (If any)</label>
                                <input
                                    type="text"
                                    name="eventStaff.otherRoles"
                                    value={formData.eventStaff.otherRoles}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="E.g., Supervisors, Helpers, etc."
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block font-semibold mb-2 text-gray-700">Special Notes / Instructions</label>
                                <textarea
                                    name="eventStaff.staffNotes"
                                    value={formData.eventStaff.staffNotes}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg"
                                    rows="3"
                                    placeholder="Add any extra instructions..."
                                ></textarea>
                            </div>

                        </div>
                    </div>

                    {/* STATUS */}
                    <h2 className="text-xl font-bold pt-4">Status</h2>

                    <select name="bookingStatus" value={formData.bookingStatus || ""} onChange={handleChange} className="border p-2 rounded w-full">
                        <option value="">Booking Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Booked">Booked</option>
                    </select>

                    <select name="paymentStatus" value={formData.paymentStatus || ""} onChange={handleChange} className="border p-2 rounded w-full">
                        <option value="">Payment Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Advance Paid">Advance Paid</option>
                        <option value="Full Paid">Full Paid</option>
                    </select>

                    {/* BUDGET (READ ONLY) */}
                    <h2 className="text-xl font-bold pt-4">Budget</h2>

                    {/* this is from prev data  */}
                    <div className="bg-gray-100 p-3 rounded-lg mb-3">
                        <p className="font-semibold text-gray-700">Previous Booking</p>
                        <p>Old Total: ₹{oldBudget?.totalBudget ?? 0}</p>
                        <p>Original Cost: ₹{oldBudget?.originalCost ?? 0}</p>
                        <p>GST: ₹{oldBudget?.gstAmount ?? 0}</p>
                        <p>CGST: ₹{oldBudget?.cgstAmount ?? 0}</p>
                        <p>Advance Paid: ₹{oldBudget?.advancePayment ?? 0}</p>
                        <p>Balance: ₹{oldBudget?.balancePayment ?? 0}</p>
                    </div>
                    {/* this is newly updated data after editing data  */}
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="font-semibold text-green-700">Updated Selection</p>
                        <p>New Total: ₹{formData.budget?.totalBudget ?? 0}</p>
                        <p>Original Cost: ₹{formData.budget?.originalCost ?? 0}</p>
                        <p>GST: ₹{formData.budget?.gstAmount ?? 0}</p>
                        <p>CGST: ₹{formData.budget?.cgstAmount ?? 0}</p>
                        <p>Advance: ₹{formData.budget?.advancePayment ?? 0}</p>
                        <p>Balance: ₹{formData.budget?.balancePayment ?? 0}</p>
                    </div>
                    {/* ACTIONS */}
                    <div className="flex gap-4 pt-6">
                        <Button onClick={handleUpdate}>Update Event</Button>
                        <Button variant="outline" onClick={() => navigate("/events")}>
                            Cancel
                        </Button>
                    </div>

                </main>
            </div>
        </div>
    );
}
