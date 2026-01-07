"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Save } from "lucide-react";

const BASE_URL = "http://localhost:4000/api/client";

const EventEdits = () => {
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

    if (!formData) return <p className="p-6">Loading...</p>;

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header title="Edit Event" />

                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">

                        {/* ACTIONS */}
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => navigate(-1)}>
                                <ArrowLeft size={16} /> Back
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                <Save size={16} /> Save
                            </Button>
                        </div>

                        {/* BASIC DETAILS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Celebrant Name</label>
                                <Input
                                    placeholder="Celebrant Name"
                                    value={formData.celebrantName}
                                    onChange={e => updateField("celebrantName", e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Phone</label>
                                <Input
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={e => updateField("phone", e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Email</label>
                                <Input
                                    placeholder="Email Id"
                                    value={formData.email}
                                    onChange={e => updateField("email", e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Event Date</label>
                                <Input
                                    type="date"
                                    value={formData.eventDate}
                                    onChange={e => updateField("eventDate", e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Event Time</label>
                                <Input
                                    type="time"
                                    value={formData.timings?.time || ""}
                                    onChange={e => updateField("timings.time", e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Guest Count</label>
                                <Input
                                    type="Capacity"
                                    value={formData.timings?.capacity || ""}
                                    onChange={e => updateField("timings.Capacity", e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Booking Status</label>
                                <select
                                    value={formData.bookingStatus}
                                    onChange={e => updateField("bookingStatus", e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Booked">Booked</option>
                                </select>
                            </div>

                            <div>
                                <label>Payment Status</label>
                                <select
                                    value={formData.paymentStatus}
                                    onChange={e => updateField("paymentStatus", e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Advance Paid">Advance Paid</option>
                                    <option value="Full Paid">Full Paid</option>
                                </select>
                            </div>
                        </div>
                        {/* Venue Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Venue Details</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Venue Name</label>
                                    <Input
                                        placeholder="Venue Name"
                                        value={formData.venue?.name || ""}
                                        onChange={e => updateField("venue.name", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>City</label>
                                    <Input
                                        placeholder="City"
                                        value={formData.venue?.city || ""}
                                        onChange={e => updateField("venue.city", e.target.value)}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label>Address</label>
                                    <Input
                                        placeholder="Full Address"
                                        value={formData.venue?.address || ""}
                                        onChange={e => updateField("venue.address", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Decoration Section */}

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Decoration Details</h3>

                            {/* Theme */}
                            <div className="mb-6">
                                <label className="font-medium">Theme Scheme</label>
                                <Input
                                    value={formData.decoration?.themeScheme || ""}
                                    onChange={(e) => updateField("decoration.themeScheme", e.target.value)}
                                />
                            </div>

                            {/* All Decoration Sections as sliders */}
                            <DecorationSection
                                title="Stage Design"
                                items={stageItems}
                                selected={formData.decoration?.stageDesign}
                                onSelect={(item) =>
                                    handleCheckboxChange("decoration", "stageDesign", item, item.price, false)
                                }
                            />

                            <DecorationSection
                                title="Entrance Decor"
                                items={entranceItems}
                                selected={formData.decoration?.entranceDecor}
                                onSelect={(item) =>
                                    handleCheckboxChange("decoration", "entranceDecor", item, item.price, false)
                                }
                            />

                            <DecorationSection
                                title="Photo Booth"
                                items={photoBoothItems}
                                selected={formData.decoration?.photoBoothDesign}
                                onSelect={(item) =>
                                    handleCheckboxChange("decoration", "photoBoothDesign", item, item.price, false)
                                }
                            />

                            <DecorationSection
                                title="Table Decor"
                                items={tableDecorItems}
                                selected={formData.decoration?.tableDecor}
                                onSelect={(item) =>
                                    handleCheckboxChange("decoration", "tableDecor", item, item.price, false)
                                }
                            />

                            <DecorationSection
                                title="Cake Setup"
                                items={cakeTableItems}
                                selected={formData.decoration?.cakeSetup}
                                onSelect={(item) =>
                                    handleCheckboxChange("decoration", "cakeSetup", item, item.price, false)
                                }
                            />

                            <DecorationSection
                                title="Lighting"
                                items={lightingItems}
                                selected={formData.decoration?.lighting}
                                onSelect={(item) =>
                                    handleCheckboxChange("decoration", "lighting", item, item.price, false)
                                }
                            />
                        </div>

                        {/* Food Arrangements Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Food Arrangements</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Meal Type</label>
                                    <Input
                                        placeholder="Veg / Non-Veg / Both"
                                        value={formData.foodArrangements?.mealType || ""}
                                        onChange={e => updateField("foodArrangements.mealType", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Meal Time</label>
                                    <Input
                                        placeholder="Breakfast / Lunch / Dinner"
                                        value={formData.foodArrangements?.mealTime || ""}
                                        onChange={e => updateField("foodArrangements.mealTime", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Cuisine</label>
                                    <Input
                                        placeholder="North Indian, South Indian, Continental..."
                                        value={formData.foodArrangements?.cuisine || ""}
                                        onChange={e => updateField("foodArrangements.cuisine", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Cutlery Team</label>
                                    <Input
                                        placeholder="In-house / External"
                                        value={formData.foodArrangements?.cutleryTeam || ""}
                                        onChange={e => updateField("foodArrangements.cutleryTeam", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Cutlery Team (Other)</label>
                                    <Input
                                        placeholder="Specify if other"
                                        value={formData.foodArrangements?.cutleryTeamOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.cutleryTeamOther", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Arrays with comma separated input */}

                                <div>
                                    <label>Welcome Drinks</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.welcomeDrinks?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.welcomeDrinks",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Welcome Drinks (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.welcomeDrinksOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.welcomeDrinksOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Starters</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.starters?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.starters",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Starters (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.startersOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.startersOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Main Course</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.mainCourse?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.mainCourse",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Main Course (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.mainCourseOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.mainCourseOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Desserts</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.desserts?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.desserts",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Desserts (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.dessertsOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.dessertsOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Snacks</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.snacks?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.snacks",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Snacks (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.snacksOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.snacksOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Beverages</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.beverages?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.beverages",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Beverages (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.beveragesOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.beveragesOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Fruits</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.fruits?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.fruits",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Fruits (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.fruitsOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.fruitsOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Seating Arrangement</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.foodArrangements?.seating?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "foodArrangements.seating",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Seating (Other)</label>
                                    <Input
                                        value={formData.foodArrangements?.seatingOther || ""}
                                        onChange={e =>
                                            updateField("foodArrangements.seatingOther", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Entertainment Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Entertainment</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Emcee */}
                                <div>
                                    <label>Emcee Required</label>
                                    <select
                                        value={formData.entertainment?.emceeRequired || "No"}
                                        onChange={e => updateField("entertainment.emceeRequired", e.target.value)}
                                        className="border rounded px-3 py-2"
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Emcee Details</label>
                                    <Input
                                        placeholder="Emcee name / notes"
                                        value={formData.entertainment?.emceeDetails || ""}
                                        onChange={e => updateField("entertainment.emceeDetails", e.target.value)}
                                    />
                                </div>

                                {/* Activities */}
                                <div>
                                    <label>Activities</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.entertainment?.activities?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.activities",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Activities (Other)</label>
                                    <Input
                                        value={formData.entertainment?.activitiesOther || ""}
                                        onChange={e =>
                                            updateField("entertainment.activitiesOther", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Cartoon Character */}
                                <div>
                                    <label>Cartoon Character</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.entertainment?.CartoonCharacter?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.CartoonCharacter",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Cartoon Character (Other)</label>
                                    <Input
                                        value={formData.entertainment?.CartoonCharacterOther || ""}
                                        onChange={e =>
                                            updateField("entertainment.CartoonCharacterOther", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Dance */}
                                <div>
                                    <label>Dance</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.entertainment?.Dance?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.Dance",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Dance (Other)</label>
                                    <Input
                                        value={formData.entertainment?.DanceOther || ""}
                                        onChange={e =>
                                            updateField("entertainment.DanceOther", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Live Performance */}
                                <div>
                                    <label>Live Performance</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.entertainment?.LivePerformance?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.LivePerformance",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Live Performance (Other)</label>
                                    <Input
                                        value={formData.entertainment?.LivePerformanceOther || ""}
                                        onChange={e =>
                                            updateField("entertainment.LivePerformanceOther", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Magic Show */}
                                <div>
                                    <label>Magic Show</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.entertainment?.MagicShow?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.MagicShow",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Magic Show (Other)</label>
                                    <Input
                                        value={formData.entertainment?.MagicShowOther || ""}
                                        onChange={e =>
                                            updateField("entertainment.MagicShowOther", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Music / DJ */}
                                <div>
                                    <label>Music / DJ / Sound System</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.entertainment?.Music_DJ_SoundSystem?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.Music_DJ_SoundSystem",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Music / DJ (Other)</label>
                                    <Input
                                        value={formData.entertainment?.Music_DJ_SoundSystemOther || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.Music_DJ_SoundSystemOther",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Puppet Show */}
                                <div>
                                    <label>Puppet Show</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.entertainment?.PuppetShow?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "entertainment.PuppetShow",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Puppet Show (Other)</label>
                                    <Input
                                        value={formData.entertainment?.PuppetShowOther || ""}
                                        onChange={e =>
                                            updateField("entertainment.PuppetShowOther", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Photography Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Photography</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Photo Team</label>
                                    <Input
                                        placeholder="In-house / External"
                                        value={formData.photography?.photoTeam || ""}
                                        onChange={e => updateField("photography.photoTeam", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Photo Team Details</label>
                                    <Input
                                        placeholder="Team name / contact / notes"
                                        value={formData.photography?.photoTeamDetails || ""}
                                        onChange={e =>
                                            updateField("photography.photoTeamDetails", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Package Type</label>
                                    <Input
                                        placeholder="Comma separated"
                                        value={formData.photography?.packageType?.join(", ") || ""}
                                        onChange={e =>
                                            updateField(
                                                "photography.packageType",
                                                e.target.value.split(",").map(v => v.trim())
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Package Type (Other)</label>
                                    <Input
                                        value={formData.photography?.packageTypeOther || ""}
                                        onChange={e =>
                                            updateField("photography.packageTypeOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Instant Photo</label>
                                    <Input
                                        placeholder="Yes / No / Polaroid etc."
                                        value={formData.photography?.instantPhoto || ""}
                                        onChange={e =>
                                            updateField("photography.instantPhoto", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Instant Photo (Other)</label>
                                    <Input
                                        value={formData.photography?.instantPhotoOther || ""}
                                        onChange={e =>
                                            updateField("photography.instantPhotoOther", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Return Gifts Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Return Gifts</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Gift Type</label>
                                    <Input
                                        placeholder="Chocolate / Toys / Custom Gifts"
                                        value={formData.returnGifts?.giftType || ""}
                                        onChange={e =>
                                            updateField("returnGifts.giftType", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Gift Type (Other)</label>
                                    <Input
                                        placeholder="Specify other gift"
                                        value={formData.returnGifts?.giftTypeOther || ""}
                                        onChange={e =>
                                            updateField("returnGifts.giftTypeOther", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Quantity</label>
                                    <Input
                                        type="number"
                                        placeholder="Number of gifts"
                                        value={formData.returnGifts?.quantity || ""}
                                        onChange={e =>
                                            updateField("returnGifts.quantity", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Budget</label>
                                    <Input
                                        placeholder="Budget per gift / total budget"
                                        value={formData.returnGifts?.budget || ""}
                                        onChange={e =>
                                            updateField("returnGifts.budget", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label>Notes</label>
                                    <Input
                                        placeholder="Any additional notes"
                                        value={formData.returnGifts?.notes || ""}
                                        onChange={e =>
                                            updateField("returnGifts.notes", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Event Staff Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Event Staff</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Welcome Staff</label>
                                    <Input
                                        placeholder="Number / details"
                                        value={formData.eventStaff?.welcomeStaff || ""}
                                        onChange={e =>
                                            updateField("eventStaff.welcomeStaff", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Food Servers</label>
                                    <Input
                                        placeholder="Number / details"
                                        value={formData.eventStaff?.foodServers || ""}
                                        onChange={e =>
                                            updateField("eventStaff.foodServers", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Maintenance Team</label>
                                    <Input
                                        placeholder="Number / details"
                                        value={formData.eventStaff?.maintenanceTeam || ""}
                                        onChange={e =>
                                            updateField("eventStaff.maintenanceTeam", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label>Other Roles</label>
                                    <Input
                                        placeholder="Security, Helpers, etc."
                                        value={formData.eventStaff?.otherRoles || ""}
                                        onChange={e =>
                                            updateField("eventStaff.otherRoles", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label>Staff Notes</label>
                                    <Input
                                        placeholder="Any special instructions"
                                        value={formData.eventStaff?.staffNotes || ""}
                                        onChange={e =>
                                            updateField("eventStaff.staffNotes", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>


                        {/* BUDGET SUMMARY */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Budget (Auto Calculated)</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ["Original Cost", "originalCost"],
                                    ["GST Amount", "gstAmount"],
                                    ["CGST Amount", "cgstAmount"],
                                    ["Total Budget", "totalBudget"],
                                    ["Advance Payment", "advancePayment"],
                                    ["Balance Payment", "balancePayment"],
                                    ["Additional / Aid Amount", "aidAmount"],
                                ].map(([label, key]) => (
                                    <div key={key} className={key === "aidAmount" ? "col-span-2" : ""}>
                                        <label>{label}</label>
                                        <Input
                                            type="number"
                                            disabled
                                            className="bg-gray-100 cursor-not-allowed"
                                            value={formData.budget?.[key] || "0"}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </main>
            </div>
        </div>
    );
};

export default EventEdits;