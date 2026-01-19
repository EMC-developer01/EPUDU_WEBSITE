// "use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import DatePicker from "react-datepicker";
import "swiper/css";
// import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

const BASE_URL = "http://localhost:4000/api/client";



const EventEdits = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mapReady, setMapReady] = useState(false);
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
            originalCost: 0,
            gstAmount: 0,
            cgstAmount: 0,
            totalBudget: 0,
            advancePayment: 0,
            balancePayment: 0,
            aidAmount: "",
        },


        paymentStatus: "Pending", // "Pending", "Advance Paid", or "Full Paid"
        bookingStatus: "Pending", // "Pending" or "Booked"
        balanceAmount: "",         // Auto-calculated balance

        notes: "",
        step: 1,
    });
    const [cards, setCards] = useState([]);
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
    const initialVenues = [
        { id: 1, name: "Grand Indoor Hall", type: "Indoor", lat: 17.3870, lng: 78.4867, stars: 3, image: "/placeholder.jpg", location: "Hyderabad", cost: 20000 },
        { id: 2, name: "City Party Hall", type: "Party Hall", lat: 17.3890, lng: 78.4820, stars: 4, image: "/placeholder.jpg", location: "Hyderabad", cost: 30000 },
        { id: 3, name: "Green Park Lawn", type: "Outdoor", lat: 17.3830, lng: 78.4880, stars: 5, image: "/placeholder.jpg", location: "Hyderabad", cost: 25000 },
    ];
    const [venues, setVenues] = useState(initialVenues);
    const [selectedVenue, setSelectedVenue] = useState(null);


    let [step, setStep] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [stageItems, setStageItems] = useState([]);
    const [entranceItems, setEntranceItems] = useState([]);
    const [photoBoothItems, setPhotoBoothItems] = useState([]);
    const [tableDecorItems, setTableDecorItems] = useState([]);
    const [cakeTableItems, setCakeTableItems] = useState([]);
    const [lightingItems, setLightingItems] = useState([]);

    /* ================= FETCH EVENT ================= */
    const fetchEvent = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/birthday/order/${id}`);
            console.log(res.data);
            setFormData(res.data);
        } catch (err) {
            console.error("❌ Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    useEffect(() => {
        const fetchDecorations = async () => {
            const res = await axios.get("http://localhost:4000/api/vendor/items/getitems");
            const allItems = res.data.items;
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
            // const SeatingItem = decorationItems.filter(i => i.subcategory === "seating");
            // setSeatingItems(SeatingItem);
        };

        fetchDecorations();
    }, []);

    useEffect(() => {
        const total =
            sumItems(formData.decoration?.stageDesign) +
            sumItems(formData.decoration?.entranceDecor) +
            sumItems(formData.decoration?.photoBoothDesign) +
            sumItems(formData.decoration?.tableDecor) +
            sumItems(formData.decoration?.cakeSetup) +
            sumItems(formData.decoration?.lighting) +

            sumItems(formData.foodArrangements?.welcomeDrinks) +
            sumItems(formData.foodArrangements?.starters) +
            sumItems(formData.foodArrangements?.mainCourse) +
            sumItems(formData.foodArrangements?.desserts) +
            sumItems(formData.foodArrangements?.snacks) +
            sumItems(formData.foodArrangements?.beverages) +
            sumItems(formData.foodArrangements?.fruits) +

            sumItems(formData.entertainment?.CartoonCharacter) +
            sumItems(formData.entertainment?.Dance) +
            sumItems(formData.entertainment?.LivePerformance) +
            sumItems(formData.entertainment?.MagicShow) +
            sumItems(formData.entertainment?.Music_DJ_SoundSystem) +
            sumItems(formData.entertainment?.PuppetShow) +
            sumItems(formData.entertainment?.activities) +

            sumItems(formData.photography?.packageType);

        updateField("budget.originalCost", total.toFixed(2));
    }, [formData]);

    useEffect(() => {
        if (!formData?.budget) return;

        const original = Number(formData.budget.originalCost || 0);
        const advance = Number(formData.budget.advancePayment || 0);
        const aid = Number(formData.budget.aidAmount || 0);

        const gst = original * 0.09;   // 9% GST
        const cgst = original * 0.09;  // 9% CGST

        const total = original + gst + cgst + aid;
        const balance = total - advance;

        updateField("budget.gstAmount", gst.toFixed(2));
        updateField("budget.cgstAmount", cgst.toFixed(2));
        updateField("budget.totalBudget", total.toFixed(2));
        updateField("budget.balancePayment", balance.toFixed(2));
    }, [
        formData.budget.originalCost,
        formData.budget.advancePayment,
        formData.budget.aidAmount
    ]);


    /* ================= UNIVERSAL UPDATE ================= */
    const updateField = (path, value) => {
        setFormData(prev => {
            const updated = structuredClone(prev);
            let ref = updated;
            const keys = path.split(".");

            keys.slice(0, -1).forEach(k => {
                ref[k] = ref[k] ?? {};
                ref = ref[k];
            });

            ref[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    /* ================= PRICE CALC ================= */
    const sumItems = (items = []) =>
        items.reduce((t, i) => t + Number(i.price || 0), 0);

    const calculateTotal = () => {
        if (!formData) return 0;
        const { decoration, foodArrangements, entertainment, photography } = formData;

        let total = 0;

        Object.values(decoration || {}).forEach(v => Array.isArray(v) && (total += sumItems(v)));
        Object.values(foodArrangements || {}).forEach(v => Array.isArray(v) && (total += sumItems(v)));
        Object.values(entertainment || {}).forEach(v => Array.isArray(v) && (total += sumItems(v)));
        total += sumItems(photography?.packageType);

        return total;
    };

    /* ================= AUTO BUDGET UPDATE ================= */
    useEffect(() => {
        // ⛔ formData not loaded yet
        if (!formData || !formData.budget) return;

        const original = Number(formData.budget.originalCost || 0);
        const gst = Number(formData.budget.gstAmount || 0);
        const cgst = Number(formData.budget.cgstAmount || 0);
        const advance = Number(formData.budget.advancePayment || 0);
        const aid = Number(formData.budget.aidAmount || 0);

        const total = original + gst + cgst + aid;
        const balance = total - advance;

        updateField("budget.totalBudget", total.toFixed(2));
        updateField("budget.balancePayment", balance.toFixed(2));
    }, [
        formData?.budget?.originalCost,
        formData?.budget?.gstAmount,
        formData?.budget?.cgstAmount,
        formData?.budget?.advancePayment,
        formData?.budget?.aidAmount
    ]);

    /* ================= SAVE ================= */
    const handleSave = async () => {
        try {
            await axios.put(`${BASE_URL}/birthday/update/admin/${id}`, formData);
            navigate("/events");
        } catch (err) {
            console.error("❌ Update failed", err);
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
        const guestCount = Number(formData.timings.capacity) || 0;

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

    // const ItemCard = ({ image, name, price }) => {
    //     const imageUrl = image.startsWith("http") ? image : `http://localhost:4000/${image}`;

    //     return (
    //         <Card className="w-40 h-56 flex flex-col items-center justify-between p-4 cursor-pointer hover:scale-105 transition-transform duration-300">
    //             <img src={imageUrl} alt={name} className="w-full h-32 object-cover rounded-lg mb-2" />
    //             <CardContent className="text-center">
    //                 <CardTitle className="text-sm font-semibold">{name}</CardTitle>
    //                 <CardDescription className="text-pink-600 font-bold">₹ {price}</CardDescription>
    //             </CardContent>
    //         </Card>
    //     );
    // };


    const ItemCard = ({ image, name, price }) => {
        const IMAGE_BASE_URL = "http://localhost:4000/uploads/vendorItems/";

        const finalPrice = (price * 1.5).toFixed(2);


        return (
            <div className="w-40 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100">

                {/* Image */}
                <div className="h-28 w-full overflow-hidden rounded-t-2xl">
                    <img
                        src={IMAGE_BASE_URL + image}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                </div>

                {/* Content */}
                <div className="p-3">

                    {/* Item Name */}
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {name}
                    </h3>

                    {/* Price */}
                    <p className="text-xs font-bold text-pink-600 mt-1">
                        ₹ {finalPrice}
                    </p>

                </div>
            </div>
        );
    }

    const DecorationSection = ({ title, items = [], selected = [], onSelect }) => {
        return (
            <div className="mb-6 w-full">
                <h3 className="font-semibold text-lg mb-4 text-pink-600">{title} Options</h3>

                <Swiper
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
                        const isSelected = selected?.some((i) => i._id === item._id);

                        return (
                            <SwiperSlide key={item._id} className="flex justify-center">
                                <div
                                    onClick={() => onSelect(item)}
                                    className={`relative cursor-pointer transition-all duration-300
                  ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""}
                `}
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
        );
    };
    const libraries = ["places"];
    console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        // libraries,
    });
    useEffect(() => {
        if (isLoaded) {
            console.log("Google Maps loaded!");
            setMapReady(true); // <-- triggers a re-render
        }
    }, [isLoaded]);
    if (loadError) return <p>Map error</p>;
    if (!isLoaded) return <p>Loading map...</p>;

    if (!formData) return <p className="p-6">Loading...</p>;
    const handleChange = (e) => {
        const { name, value } = e.target;

        // For nested decoration or timings keys like "decoration.themeScheme"
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
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };


    return (
        <>
            <Header />
            <section id='birthdaybooking' className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-r from-pink-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-32">
                <div className="w-full max-w-[2560px] mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16">

                    <h2 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-pink- mb-8 text-center">
                        🎂 Birthday Event Booking
                    </h2>

                    {step === 1 && isLoaded && (
                        <div className=' py-4 px-4 border-2 border-gray-400'>
                            <div className="w-full space-y-6 px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 mx-auto py-8 mb-4 ">
                                <h5 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-pink- mb-8 text-center">
                                    📝 Person Details
                                </h5>
                                {/* Responsive Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">

                                    {/* Name */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Name</label>
                                        <input
                                            type="text"
                                            name="celebrantName"
                                            value={formData.celebrantName ?? ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            placeholder="Enter Name"
                                            required
                                        />
                                    </div>

                                    {/* Theme */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Theme</label>
                                        <input
                                            type="text"
                                            name="themePreference"
                                            value={formData.themePreference ?? ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            placeholder="Theme Preference"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone ?? ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            placeholder="Enter Phone"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email ?? ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            placeholder="Enter Email"
                                            required
                                        />
                                    </div>

                                    {/* Age */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age ?? ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            placeholder="Enter Age"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender ?? ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                        >
                                            <option value="">Select</option>
                                            <option value="Girl">Girl</option>
                                            <option value="Boy">Boy</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Event Date */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Date</label>
                                        <DatePicker
                                            selected={formData.eventDate ? new Date(formData.eventDate) : null}
                                            onChange={(date) =>
                                                handleChange({
                                                    target: {
                                                        name: "eventDate",
                                                        value: date ? date.toISOString().split("T")[0] : "",
                                                    },
                                                })
                                            }
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            minDate={new Date()}
                                            placeholderText="Select Date"
                                            required
                                        />
                                    </div>

                                </div>
                            </div>
                            <h5 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-pink- mb-8 text-center">
                                📝 venu Details
                            </h5>
                            <div className=" w-full flex flex-col lg:flex-row gap-6 2xl:flex-row gap-8 py-8 mb-4 ">
                                {/* Venue List */}
                                <div className="lg:w-1/2 space-y-4 overflow-y-auto max-h-[500px] border-r pr-4">
                                    {venues.map((v) => (
                                        <div
                                            key={v.id}
                                            onClick={() => {
                                                setSelectedVenue(v);
                                                handleCustomChange("venue", {
                                                    name: v.name,
                                                    address: v.address || "",
                                                    city: v.location || "",
                                                    cost: v.cost || 0, // <-- Add cost here
                                                });
                                            }
                                            }
                                            className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${selectedVenue?.id === v.id ? "bg-pink-50 border-pink-400" : "hover:bg-gray-50"
                                                }`}
                                        >
                                            {/* <img src={v.image} alt={v.name} className="w-24 h-24 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                    e.currentTarget.parentElement.querySelector(".img-fallback").style.display = "flex";
                                                }} /> */}
                                            <div className="flex flex-col justify-between">
                                                <h4 className="font-semibold">{v.name}</h4>
                                                <p className="text-sm text-gray-600">{v.type} | {v.location}</p>
                                                <p className="text-yellow-500 text-sm">{'★'.repeat(v.stars)}{'☆'.repeat(5 - v.stars)}</p>
                                                <p className="font-bold mt-1">₹ {v.cost}</p> {/* Display cost */}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Map & Confirmation */}
                                <div className="lg:w-1/2 flex flex-col">
                                    <GoogleMap
                                        zoom={13}
                                        center={
                                            selectedVenue
                                                ? { lat: selectedVenue.lat, lng: selectedVenue.lng }
                                                : { lat: 17.3850, lng: 78.4867 }
                                        }
                                        mapContainerStyle={{ width: "100%", height: "400px", borderRadius: "12px" }}
                                    >
                                        {venues.map((v) => (
                                            <Marker
                                                key={v.id}
                                                position={{ lat: v.lat, lng: v.lng }}
                                                onClick={() => setSelectedVenue(v)}
                                            />
                                        ))}
                                        {selectedVenue && (
                                            <InfoWindow
                                                position={{ lat: selectedVenue.lat, lng: selectedVenue.lng }}
                                                onCloseClick={() => setSelectedVenue(null)}
                                            >
                                                <div>{selectedVenue.name}</div>
                                            </InfoWindow>
                                        )}
                                    </GoogleMap>

                                    {/* {selectedVenue && (
                    <button
                      onClick={nextStep}
                      className="bg-pink-600 text-white px-6 py-2 rounded-lg mt-4 self-start"
                    >
                      Confirm Venue & Continue
                    </button>
                  )} */}
                                </div>
                            </div>
                            <h5 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-pink- mb-8 text-center">
                                📝 Invitation Card
                            </h5>
                            <div className="flex flex-col lg:flex-row gap-6  py-8 mb-4">
                                {/* Event Timings & Guest Details */}
                                <div className="lg:w-1/2 space-y-6">

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="font-medium">Event Date</label>
                                            <DatePicker
                                                selected={formData.eventDate ? new Date(formData.eventDate) : null}
                                                onChange={(date) =>
                                                    handleChange({
                                                        target: { name: "timings.date", value: date.toISOString().split("T")[0] },
                                                    })
                                                }
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                                minDate={new Date()}
                                                placeholderText="Select Date"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="font-medium">Event Time</label>
                                            <input
                                                type="time"
                                                name="timings.time"
                                                value={formData.timings?.time || ""}
                                                onChange={handleChange}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Number of Guests */}
                                    <div className="flex flex-col gap-2">
                                        <label className="font-medium">Number of Guests</label>
                                        <input
                                            type="number"
                                            name="timings.capacity"
                                            value={formData.timings?.capacity || ""}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                                            placeholder="Enter Number of Guests"
                                            min={1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === Step 4: Decoration & Theme Setup === */}
                    {step === 2 && (
                        <div className="p-6 border-2 border-pink-300 rounded-2xl bg-gradient-to-r from-pink-50 to-yellow-50 shadow-lg">
                            <h3 className="text-2xl font-bold text-pink-600 text-center mb-6">
                                🎀  Decoration & Theme Preferences 🎀
                            </h3>

                            {/* Theme */}
                            <div className="mb-6">
                                <label className="block font-semibold mb-2">Theme / Color Scheme</label>
                                <input
                                    type="text"
                                    name="decoration.themeScheme"
                                    placeholder="e.g., Barbie, Avengers, Floral, Neon"
                                    value={formData.decoration.themeScheme || ""}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            {/* Stage Design – Auto Slider with Arrows */}
                            <div className="mb-6 w-full">
                                <h3 className="font-semibold text-lg mb-4 text-pink-600">
                                    Stage Design Options
                                </h3>

                                <div className="w-full">
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

                                        {stageItems.map((item) => {
                                            const isSelected =
                                                formData.decoration.stageDesign?.some(i => i._id === item._id);
                                            let Price = (item.price * 1.5)
                                            console.log(item)

                                            return (
                                                <SwiperSlide key={item._id} className="flex justify-center">
                                                    <div
                                                        onClick={() => handleCheckboxChange("decoration", "stageDesign", item, Price, false)}
                                                        className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""
                                                            }`}
                                                    >
                                                        <ItemCard
                                                            image={item.image}
                                                            name={item.name}
                                                            price={item.price}
                                                        />

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

                            {/* Entrance Decoration – Auto Slider */}
                            <div className="mb-6 w-full">
                                <h3 className="font-semibold text-lg mb-4 text-pink-600">
                                    Entrance Decoration Options
                                </h3>

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
                                    {entranceItems.map((item) => {
                                        const isSelected =
                                            formData.decoration.entranceDecor?.some(i => i._id === item._id);
                                        let Price = item.price * 1.5

                                        return (
                                            <SwiperSlide key={item._id} className="flex justify-center">
                                                <div
                                                    onClick={() => handleCheckboxChange("decoration", "entranceDecor", item, Price, false)}
                                                    className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""
                                                        }`}
                                                >
                                                    <ItemCard
                                                        image={item.image}
                                                        name={item.name}
                                                        price={item.price}
                                                    />

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


                            {/* Photo Booth / Selfie Corner – Slider with Dots */}
                            <div className="mb-6 w-full">
                                <h3 className="font-semibold text-lg mb-4 text-pink-600">
                                    Photo Booth / Selfie Corner
                                </h3>

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
                                    {photoBoothItems.map((item) => {
                                        const isSelected =
                                            formData.decoration.photoBoothDesign?.some(i => i._id === item._id);
                                        let Price = item.price * 1.5

                                        return (
                                            <SwiperSlide key={item._id} className="flex justify-center">
                                                <div
                                                    onClick={() => handleCheckboxChange("decoration", "photoBoothDesign", item, Price, false)}
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


                            <div className="mb-6 w-full">
                                <h3 className="font-semibold text-lg mb-4 text-pink-600">
                                    Table / Ceiling / Seating Decor
                                </h3>


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
                                    {tableDecorItems.map((item) => {
                                        const isSelected =
                                            formData.decoration.tableDecor?.some(i => i._id === item._id);
                                        let Price = item.price * 1.5

                                        return (
                                            <SwiperSlide key={item.name} className="flex justify-center">
                                                <div
                                                    onClick={() => handleCheckboxChange("decoration", "tableDecor", item, Price, false)}
                                                    className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""
                                                        }`}
                                                >
                                                    <ItemCard
                                                        image={item.image}
                                                        name={item.name}
                                                        price={item.price}
                                                    />

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


                            {/* ⭐ Cake Table Setup Section */}
                            <div className="mb-6 w-full">
                                <h3 className="font-semibold text-lg mb-4 text-pink-600">
                                    Cake Table Setup
                                </h3>

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
                                    {cakeTableItems.map((item) => {
                                        const isSelected = formData.decoration.cakeSetup?.some(i => i._id === item._id);
                                        let Price = item.price * 1.5

                                        return (
                                            <SwiperSlide key={item.name} className="flex justify-center">
                                                <div
                                                    onClick={() => handleCheckboxChange("decoration", "cakeSetup", item, Price, false)}
                                                    className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""
                                                        }`}
                                                >
                                                    <ItemCard
                                                        image={item.image}
                                                        name={item.name}
                                                        price={item.price}
                                                    />

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


                            {/* Lighting */}
                            <div className="mb-6 w-full">
                                <h3 className="font-semibold text-lg mb-4 text-pink-600">
                                    Lightings
                                </h3>

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
                                    {lightingITems.map((item) => {
                                        const isSelected = formData.decoration.lighting?.some(i => i._id === item._id);
                                        let Price = item.price * 1.5

                                        return (
                                            <SwiperSlide key={item.name} className="flex justify-center">
                                                <div
                                                    onClick={() => handleCheckboxChange("decoration", "lighting", item, Price, false)}
                                                    className={`relative cursor-pointer transition-all duration-300 ${isSelected ? "scale-105 ring-4 ring-pink-500 rounded-2xl" : ""
                                                        }`}
                                                >
                                                    <ItemCard
                                                        image={item.image}
                                                        name={item.name}
                                                        price={item.price}
                                                    />

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
                    )}

                    {step === 3 && (
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
                    )}

                    {/* === Step 6: Entertainment & Activities === */}
                    {step === 4 && (
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
                    )}

                    {/* === Step 7: Photography & Videography === */}
                    {step === 5 && (
                        <div>
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
                            <div className="my-2 p-6 border-2 border-green-300 rounded-2xl bg-gradient-to-r from-green-50 to-yellow-50 shadow-lg">
                                <h3 className="text-2xl font-bold text-green-700 text-center mb-6">
                                    👥 Event Staff / Management Team
                                </h3>

                                {/* Food & Reception Team */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-3 text-gray-800">🍽 Food & Reception Team</h4>
                                    {/* {["foodServers", "welcomeStaff"].map((role) => (
                  <div className="mb-4" key={role}>
                    <label className="block font-medium mb-1 text-gray-700">
                      {role === "foodServers" ? "Number of Food Servers" : "Number of Welcome / Reception Staff"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.eventStaff[role] || 0}
                      onChange={(e) => {
                        const num = Number(e.target.value) || 0;
                        setFormData((prev) => {
                          const updatedEventStaff = { ...prev.eventStaff, [role]: num };
                          const totalStaff =
                            (updatedEventStaff.foodServers || 0) +
                            (updatedEventStaff.welcomeStaff || 0) +
                            (updatedEventStaff.maintenanceTeam || 0);
                          return {
                            ...prev,
                            eventStaff: updatedEventStaff,
                            costs: { ...prev.costs, eventStaffCost: totalStaff * 1500 },
                          };
                        });
                      }}
                      className="border p-2 rounded w-full"
                      placeholder={`Enter number of ${role === "foodServers" ? "servers" : "welcome staff"}`}
                    />
                  </div>
                ))} */}
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

                                {/* Maintenance & Handling Team */}
                                {/* <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">🛠 Maintenance & Handling Team</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">Maintenance Team Members</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.eventStaff.maintenanceTeam || 0}
                      onChange={(e) => {
                        const num = Number(e.target.value) || 0;
                        setFormData((prev) => {
                          const updatedEventStaff = { ...prev.eventStaff, maintenanceTeam: num };
                          const totalStaff =
                            (updatedEventStaff.foodServers || 0) +
                            (updatedEventStaff.welcomeStaff || 0) +
                            (updatedEventStaff.maintenanceTeam || 0);
                          return {
                            ...prev,
                            eventStaff: updatedEventStaff,
                            costs: { ...prev.costs, eventStaffCost: totalStaff * 1500 },
                          };
                        });
                      }}
                      className="border p-2 rounded w-full"
                      placeholder="Enter number of maintenance staff"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">Other Roles (if any)</label>
                    <input
                      type="text"
                      value={formData.eventStaff.otherRoles || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          eventStaff: { ...prev.eventStaff, otherRoles: e.target.value },
                        }))
                      }
                      className="border p-2 rounded w-full"
                      placeholder="Specify other roles (e.g., cleaning, helpers)"
                    />
                  </div>
                </div>
              </div> */}

                                {/* Notes */}
                                {/* <div className="mb-6">
                <label className="block font-semibold mb-2 text-gray-700">📝 Special Notes / Instructions</label>
                <textarea
                  value={formData.eventStaff.staffNotes || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventStaff: { ...prev.eventStaff, staffNotes: e.target.value },
                    }))
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Mention additional instructions or preferences"
                  rows={3}
                />
              </div> */}

                                {/* Total Staff Cost */}
                                {/* <div className="mt-6 p-4 bg-white rounded-xl shadow text-center font-semibold text-green-700 border border-green-200">
                Total Staff Cost: ₹{formData.costs?.eventStaffCost || 0}
              </div> */}
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="p-6 border-2 border-pink-300 rounded-2xl bg-gradient-to-r from-pink-50 to-yellow-50 shadow-lg">

                            <h3 className="text-2xl font-bold text-pink-600 text-center mb-6">
                                💰 Budget & Payment Details
                            </h3>

                            <div className="space-y-4">

                                <div>
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Original Event Cost
                                    </label>
                                    <input
                                        type="number"
                                        value={safeFixed(formData.budget?.originalCost)}
                                        readOnly
                                        className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                                {/* Taxes & Charges */}
                                <div className="space-y-4 mb-6">

                                    <div>
                                        <label className="block font-semibold mb-1 text-gray-700">GST</label>
                                        <input
                                            type="number"
                                            value={safeFixed(formData.budget?.gstAmount)}
                                            readOnly
                                            className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-1 text-gray-700">CGST </label>
                                        <input
                                            type="number"
                                            value={safeFixed(formData.budget?.cgstAmount)}
                                            readOnly
                                            className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* <div>
                    <label className="block font-semibold mb-1 text-gray-700">Service Charges </label>
                    <input
                      type="number"
                      value={safeFixed(formData.budget?.serviceChargeAmount)}
                      readOnly
                      className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div> */}

                                </div>

                                {/* Total Budget */}
                                <div>
                                    <label className="block font-semibold mb-2 text-gray-700">
                                        Total Budget / Package Preference
                                    </label>

                                    <input
                                        type="number"
                                        value={safeFixed(formData.budget?.totalBudget)}
                                        readOnly
                                        className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                    />
                                </div>


                                {/* Payments */}
                                <div className="grid md:grid-cols-2 gap-4">

                                    <div>
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Advance Payment (70%)
                                        </label>
                                        <input
                                            type="number"
                                            value={safeFixed(formData.budget?.advancePayment)}
                                            readOnly
                                            className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-2 text-gray-700">
                                            Balance Payment (30%)
                                        </label>
                                        <input
                                            type="number"
                                            value={safeFixed(formData.budget?.balancePayment)}
                                            readOnly
                                            className="border p-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                </div>

                                <p className="text-pink-700 font-medium mt-3">
                                    ⚠️ Advance payment is required to confirm your booking slot.
                                </p>
                            </div>

                            {/* Billing Info */}
                            <div className="mt-8">
                                <h4 className="text-lg font-semibold mb-2 text-gray-700">🧾 Billing Information</h4>

                                <input
                                    type="text"
                                    name="billingName"
                                    placeholder="Billing Name"
                                    value={formData.billingName || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full mb-4"
                                />

                                <input
                                    type="text"
                                    name="gstNumber"
                                    placeholder="GST Number (if applicable)"
                                    value={formData.gstNumber || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded w-full"
                                />
                            </div>

                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        {step > 1 && (
                            <button
                                onClick={() => {
                                    // saveStepData(step, formData); // Save current step before going back
                                    prevStep();
                                    // handleNext();
                                }}
                                className="bg-indigo-900 px-4 py-2 rounded-lg"
                            >
                                Back
                            </button>
                        )}

                        {step < 6 && (
                            <button
                                onClick={() => {
                                    // createEvent();
                                    // saveStepData(step, formData); // Save current step before going next
                                    handleNext();
                                    // nextStep();
                                }}
                                className="bg-indigo-900 text-white px-4 py-2 rounded-lg"
                            >
                                Next
                            </button>
                        )}

                        {step === 6 && (
                            <button
                                onClick={async () => {
                                    try {
                                        const total = Math.round(Number(formData.budget.totalBudget) * 100) / 100;
                                        const advance = Math.round(Number(formData.budget.advancePayment) * 100) / 100;
                                        const balance = Math.max(0, Math.round((total - advance) * 100) / 100);

                                        if (!advance || isNaN(advance) || advance <= 0) {
                                            alert("Please enter a valid advance amount");
                                            return;
                                        }

                                        // ✅ STEP 1: Mark status as Pending BEFORE payment starts
                                        const pendingData = {
                                            ...formData,
                                            paymentStatus: "Pending",
                                            bookingStatus: "Pending",
                                        };
                                        setFormData(pendingData);

                                        await fetch("http://localhost:4000/api/client/birthday/update-step", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                birthdayId,
                                                step: 10,
                                                formData: pendingData,
                                            }),
                                        });

                                        // ✅ STEP 2: Create Razorpay order
                                        const orderRes = await fetch("http://localhost:4000/api/payment/create-order", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ amount: advance }),
                                        });

                                        const orderData = await orderRes.json();
                                        if (!orderData?.order?.id) throw new Error("Order creation failed");

                                        // Helper to safely revert to Pending
                                        const updatePending = async (msg) => {
                                            if (paymentCompleted) return;
                                            console.warn(msg);
                                            alert(msg);
                                            const reverted = {
                                                ...formData,
                                                paymentStatus: "Pending",
                                                bookingStatus: "Pending",
                                            };
                                            setFormData(reverted);
                                            console.log(reverted);

                                            await fetch("http://localhost:4000/api/client/birthday/update-step", {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    birthdayId,
                                                    step: 10,
                                                    formData: reverted,
                                                }),
                                            });
                                        };

                                        // ✅ STEP 3: Razorpay options
                                        let paymentCompleted = false;
                                        const options = {
                                            key: orderData.key,
                                            amount: orderData.order.amount,
                                            currency: "INR",
                                            name: "Event Planner",
                                            description: "Advance Payment for Event",
                                            order_id: orderData.order.id,

                                            handler: async function (response) {
                                                try {
                                                    // ✅ STEP 4: Verify payment on backend

                                                    const verifyRes = await fetch("http://localhost:4000/api/payment/verify", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            ...response,
                                                            // birthdayId: formData._id,
                                                            eventId: birthdayId,
                                                            eventType: formData.eventType,
                                                            clientName: formData.celebrantName,
                                                            amount: advance,
                                                        }),
                                                    });

                                                    const verifyData = await verifyRes.json();

                                                    if (!verifyData.success) {
                                                        toast.error("Payment failed");
                                                        return;
                                                    }

                                                    if (verifyData.success) {
                                                        paymentCompleted = true;
                                                        const paymentStatus = advance >= total ? "Full Paid" : "Advance Paid";
                                                        const bookingStatus = "Booked";
                                                        const balanceAmount = advance >= total ? 0 : balance;

                                                        const updatedFormData = {
                                                            ...formData,
                                                            paymentStatus,
                                                            bookingStatus,
                                                            balanceAmount,
                                                            budget: {
                                                                ...formData.budget,
                                                                totalBudget: total,
                                                                advancePayment: advance,
                                                                balancePayment: balanceAmount,
                                                            },
                                                        };

                                                        setFormData(updatedFormData);

                                                        // ********************************************
                                                        // 🔥 STEP A: Update backend after payment
                                                        // ********************************************
                                                        await fetch("http://localhost:4000/api/client/birthday/update-step", {
                                                            method: "PUT",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                birthdayId,
                                                                step: 10,
                                                                formData: updatedFormData,
                                                            }),
                                                        });

                                                        // ********************************************
                                                        // 🔥 STEP B — SYNC BIRTHDAY → VENDOR ORDERS
                                                        // ********************************************
                                                        await fetch("http://localhost:4000/api/vendor/orders/sync", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                        });

                                                        // ********************************************
                                                        // 🔥 STEP C — INFORM ADMIN
                                                        // ********************************************
                                                        await fetch("http://localhost:4000/api/admin/notifications/sendAdminNotification", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                birthdayId: birthdayId ? birthdayId.replace(/"/g, "") : "",
                                                                eventType: formData.eventType,
                                                                clientName: formData.celebrantName,
                                                            }),
                                                        });

                                                        // ********************************************
                                                        // 🔥 STEP D — INFORM CLIENT (Frontend Notification)
                                                        // ********************************************
                                                        await fetch("http://localhost:4000/api/client/notifications/client-bill", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                clientId: cleanId,        // or whichever ID you store
                                                                eventName: formData.eventType,
                                                                advanceAmount: formData.budget.advancePayment,
                                                                totalAmount: formData.budget.totalBudget,
                                                                email: formData.email
                                                            }),
                                                        });

                                                        // ********************************************
                                                        // 🔔 FRONTEND NOTIFICATIONS
                                                        // ********************************************

                                                        function notify(title, message) {
                                                            if (Notification.permission !== "granted") {
                                                                Notification.requestPermission();
                                                            }
                                                            new Notification(title, { body: message, icon: "/logo.png" });
                                                        }

                                                        toast.success("Payment Verified!");
                                                        notify("Payment Successful", "Your payment has been verified.");

                                                        toast.success("Booking Confirmed!");
                                                        notify("Booking Confirmed", "Your event has been confirmed.");

                                                        alert("✅ Payment Verified — All notifications + bill sent successfully!");

                                                        window.location.href = "/eventHistory?status=paid";
                                                    }

                                                    else {
                                                        await updatePending("❌ Payment verification failed. Status reverted to Pending.");
                                                    }

                                                } catch (err) {
                                                    console.error("Error verifying payment:", err);
                                                    await updatePending("⚠️ Error verifying payment. Status reverted to Pending.");
                                                }
                                            },

                                            prefill: {
                                                name: formData.celebrantName || "User",
                                                email: formData.email || "example@gmail.com",
                                                contact: formData.email || "9999999999",
                                            },
                                            theme: { color: "#0d9488" },

                                            modal: {
                                                ondismiss: async () => {
                                                    if (!paymentCompleted) {
                                                        await updatePending("⚠️ Payment popup closed without completing payment. Status reverted to Pending.");
                                                    }
                                                },
                                            },
                                        };

                                        const rzp = new window.Razorpay(options);

                                        rzp.on("payment.failed", async (response) => {
                                            console.error("Payment failed:", response.error);
                                            if (!paymentCompleted) {
                                                await updatePending("❌ Payment failed or cancelled. Status reverted to Pending.");
                                            }
                                        });

                                        rzp.open();
                                    }
                                    catch (err) {
                                        console.error("Error in payment:", err);
                                        alert("❌ Error starting payment");
                                    }
                                }}
                                className="bg-indigo-900 text-white px-4 py-2 rounded-lg"
                            >
                                💳 Pay Advance via Razorpay
                            </button>
                        )}

                    </div>
                </div>
            </section >
        </>
    );
};

export default EventEdits;