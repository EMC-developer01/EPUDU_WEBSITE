"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Header from "./common/Header";
import Banner from "./common/Banner";
import Footer from "./common/Footer";
import ItemCard from "./common/card";

import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";

const Catering = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        foodArrangements: {},
        totalAmount: 0,
        clientId: "",
        paymentStatus: "Pending",
    });

    const [foodSections, setFoodSections] = useState([]);
    const [seatingItems, setSeatingItems] = useState([]);

    const [searchFood, setSearchFood] = useState("");
    const [mealTypeFilter, setMealTypeFilter] = useState("All");
    const [foodTimeFilter, setFoodTimeFilter] = useState("All");
    const [cuisineFilter, setCuisineFilter] = useState("All");

    /* CLIENT ID */
    useEffect(() => {
        const id = localStorage.getItem("userId");
        if (id) setFormData(p => ({ ...p, clientId: id }));
    }, []);

    /* FETCH ITEMS */
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/vendor/items/getitems");
            const allItems = res.data.items;

            const cateringItems = allItems.filter(i => i.category === "Catering");
            const seating = allItems.filter(i => i.subcategory === "seating");
            setSeatingItems(seating);

            const priority = ["Main Course", "Starter", "Breakfast", "Snacks", "Dessert", "Drinks"];

            cateringItems.sort(
                (a, b) =>
                    priority.indexOf(a.subcategory) - priority.indexOf(b.subcategory)
            );

            const grouped = {};
            cateringItems.forEach(item => {
                if (!grouped[item.subcategory]) grouped[item.subcategory] = [];
                grouped[item.subcategory].push(item);
            });

            setFoodSections(
                Object.keys(grouped).map(sub => ({
                    title: sub,
                    field: sub.toLowerCase().replace(/ /g, "_"),
                    items: grouped[sub],
                }))
            );
        } catch (err) {
            console.error(err);
        }
    };

    /* FILTER */
    const filterItems = items =>
        items.filter(item => {
            if (!item.name.toLowerCase().includes(searchFood.toLowerCase())) return false;
            if (mealTypeFilter !== "All" && item.foodType !== mealTypeFilter) return false;
            if (foodTimeFilter !== "All" && item.mealTime !== foodTimeFilter) return false;
            if (cuisineFilter !== "All" && item.cuisine !== cuisineFilter) return false;
            return true;
        });

    /* PRICE */
    const updateCost = (price, add) =>
        setFormData(p => ({
            ...p,
            totalAmount: add ? p.totalAmount + price : Math.max(p.totalAmount - price, 0),
        }));

    /* SELECT */
    const handleCheckboxChange = (key, field, item, price, isObject = true) => {
        setFormData(prev => {
            const selected = prev[key][field] || [];
            const exists = isObject
                ? selected.some(i => i._id === item._id)
                : selected.includes("Other");

            updateCost(price, !exists);

            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    [field]: exists
                        ? selected.filter(i => (isObject ? i._id !== item._id : i !== "Other"))
                        : [...selected, isObject ? item : "Other"],
                },
            };
        });
    };
    /* 💳 PAYMENT */
    const startPayment = async () => {
        if (!formData.totalAmount) {
            toast.error("Please select food items");
            return;
        }

        try {
            const orderRes = await fetch(
                "http://localhost:4000/api/payment/create-order",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: formData.totalAmount }),
                }
            );

            const orderData = await orderRes.json();
            let paymentCompleted = false;

            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: "INR",
                name: "EPUDU Catering",
                description: "Catering Booking",
                order_id: orderData.order.id,

                handler: async (response) => {
                    const verifyRes = await fetch(
                        "http://localhost:4000/api/payment/verify",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...response,
                                eventType: "Catering",
                                clientName: formData.name,
                                amount: formData.totalAmount,
                            }),
                        }
                    );

                    const verifyData = await verifyRes.json();
                    if (!verifyData.success) return toast.error("Payment failed");

                    paymentCompleted = true;

                    await fetch(
                        "http://localhost:4000/api/client/catering/add",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...formData,
                                paymentStatus: "Paid",
                            }),
                        }
                    );

                    toast.success("Catering booked 🍽️");
                    window.location.href = "/custom-services-History";
                },

                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },

                theme: { color: "#ec4899" },
                modal: {
                    ondismiss: () => {
                        if (!paymentCompleted) toast("Payment cancelled");
                    },
                },
            };

            new window.Razorpay(options).open();
        } catch (err) {
            console.error(err);
            toast.error("Payment error");
        }
    };


    return (
        <>
            <Header />
            <Banner title="Catering & Food Arrangements" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                    name="name"
                    placeholder="Name"
                    className="border p-2 rounded"
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                />
                <input
                    name="email"
                    placeholder="Email"
                    className="border p-2 rounded"
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
                <input
                    name="phone"
                    placeholder="Phone"
                    className="border p-2 rounded sm:col-span-2"
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                />
            </div>


            <section className="px-3 md:px-6 py-10">
                <div className="space-y-10 pb-20">

                    <h3 className="text-2xl font-bold text-pink-600 text-center">
                        🍽️ Food Arrangements 🍽️
                    </h3>

                    {/* SEARCH + FILTERS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            className="border p-2 rounded"
                            placeholder="Search food..."
                            value={searchFood}
                            onChange={e => setSearchFood(e.target.value)}
                        />
                        <select className="border p-2 rounded" value={mealTypeFilter} onChange={e => setMealTypeFilter(e.target.value)}>
                            <option value="All">Meal Type (All)</option>
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                            <option value="Mixed">Mixed</option>
                        </select>
                        <select className="border p-2 rounded" value={foodTimeFilter} onChange={e => setFoodTimeFilter(e.target.value)}>
                            <option value="All">Food Time (All)</option>
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Dinner">Dinner</option>
                        </select>
                        <select className="border p-2 rounded" value={cuisineFilter} onChange={e => setCuisineFilter(e.target.value)}>
                            <option value="All">Cuisine (All)</option>
                            <option value="Indian">Indian</option>
                            <option value="North Indian">North Indian</option>
                            <option value="South Indian">South Indian</option>
                            <option value="Chinese">Chinese</option>
                        </select>
                    </div>

                    {/* FOOD SECTIONS */}
                    {foodSections.map(section => {
                        const items = filterItems(section.items);
                        if (!items.length) return null;

                        return (
                            <div key={section.field}>
                                <h4 className="text-xl font-semibold text-blue-600 mb-3">
                                    {section.title}
                                </h4>

                                {/* MAIN COURSE GROUPING */}
                                {section.title === "Main Course" ? (
                                    Object.entries(
                                        items.reduce((acc, i) => {
                                            acc[i.foodModel] = acc[i.foodModel] || [];
                                            acc[i.foodModel].push(i);
                                            return acc;
                                        }, {})
                                    ).map(([model, foods]) => (
                                        <div key={model} className="mb-6">
                                            <h5 className="text-lg font-medium text-pink-600 mb-2">{model}</h5>
                                            <Swiper modules={[A11y]} slidesPerView={2} spaceBetween={8} breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}>
                                                {foods.map(item => {
                                                    const price = item.price * 1.5;
                                                    const selected = formData.foodArrangements[section.field]?.some(i => i._id === item._id);
                                                    return (
                                                        <SwiperSlide key={item._id}>
                                                            <div
                                                                onClick={() => handleCheckboxChange("foodArrangements", section.field, item, price)}
                                                                className={`cursor-pointer ${selected && "ring-4 ring-pink-500 rounded-xl"}`}
                                                            >
                                                                <ItemCard image={item.image} name={item.name} price={item.price} />
                                                            </div>
                                                        </SwiperSlide>
                                                    );
                                                })}
                                            </Swiper>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex gap-4 overflow-x-auto pb-3">
                                        {items.map(item => {
                                            const price = item.price * 1.5;
                                            const selected = formData.foodArrangements[section.field]?.some(i => i._id === item._id);
                                            return (
                                                <div
                                                    key={item._id}
                                                    onClick={() => handleCheckboxChange("foodArrangements", section.field, item, price)}
                                                    className={`min-w-[160px] cursor-pointer ${selected && "ring-4 ring-pink-500 rounded-xl"}`}
                                                >
                                                    <ItemCard image={item.image} name={item.name} price={item.price} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* SEATING */}
                    <div>
                        <h3 className="text-lg font-semibold text-green-600 mb-3">Seating Arrangements</h3>
                        <Swiper modules={[A11y]} slidesPerView={2} spaceBetween={8} breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}>
                            {seatingItems.map(item => {
                                const price = item.price * 1.5;
                                const selected = formData.foodArrangements.seating?.some(i => i._id === item._id);
                                return (
                                    <SwiperSlide key={item._id}>
                                        <div
                                            onClick={() => handleCheckboxChange("foodArrangements", "seating", item, price)}
                                            className={`cursor-pointer ${selected && "ring-4 ring-pink-500 rounded-xl"}`}
                                        >
                                            <ItemCard image={item.image} name={item.name} price={item.price} />
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>

                    <div className="text-right font-bold text-lg">
                        Total: ₹ {formData.totalAmount}
                    </div>

                    <button
                        onClick={startPayment}
                        className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700"
                    >
                        💳 Pay & Book Catering
                    </button>


                </div>
            </section>

            <Footer />
        </>
    );
};

export default Catering;
