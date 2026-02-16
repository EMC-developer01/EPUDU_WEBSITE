'use client';
import React, { useState, useEffect } from 'react';
import Header from './common/Header';
import Footer from './common/Footer';
import Banner from './common/Banner';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import * as htmlToImage from "html-to-image";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { formatDate } from 'date-fns';
import ItemCard from './common/card';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import toast from 'react-hot-toast';
import { H3Icon } from '@heroicons/react/24/solid';
import api from './common/api';


// --- Helpers ---
const geocodeAddress = async (address) => {

  if (!window.google) return null;
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        np
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        console.error("Geocode failed:", status);
        resolve(null);
      }
    });
  });
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
let API_URL = import.meta.env.VITE_API_URL;
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
export default function Birthday() {
  // const API_URL = import.meta.env.VITE_API_URL;
  // const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

  API_URL = `${API_URL}/api/client`;

  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCards = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/client-invitation/all`);
        const activeCards = res.data.filter(c => c.isActive);

        if (isMounted) {
          setCards(activeCards);
          // If no card is selected or selected card was removed, select first
          if (!selectedCard || !activeCards.find(c => c._id === selectedCard._id)) {
            setSelectedCard(activeCards[0] || null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch invitation cards:", err);
      }
    };

    // Fetch initially
    fetchCards();

    // Poll every 5 seconds
    const interval = setInterval(fetchCards, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedCard]);

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    if (!cards.length) return;
    setCurrentBg(0);
  }, [cards]);

  let [step, setStep] = useState(1);
  let [birthdayId, setBirthdayId] = useState(null);
  let [userId, setUserId] = useState(null);
  const cleanId = userId ? userId.replace(/"/g, "") : null;

  const [decorationItems, setDecorationItems] = useState([]);
  const [cateringItems, setCateringItems] = useState([]);
  const [photographyItems, setPhotographyItems] = useState([]);
  const [makeupItems, setMakeupItems] = useState([]);
  const [venueItems, setVenueItems] = useState([]);
  const [musicItems, setMusicItems] = useState([]);
  const [entertainmentItems, setEntertainmentItems] = useState([]);

  const [stageItems, setStageItems] = useState([]);
  const [entranceItems, setEntranceItems] = useState([]);
  const [photoBoothItems, setPhotoBoothItems] = useState([]);
  const [tableDecorItems, setTableDecorItems] = useState([]);
  const [cakeTableItems, setCakeTableItems] = useState([]);
  const [lightingITems, setLightingItems] = useState([]);
  const [foodSections, setFoodSections] = useState([]);
  const [seatingItems, setSeatingItems] = useState([]);

  const [searchFood, setSearchFood] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("All");
  const [foodTimeFilter, setFoodTimeFilter] = useState("All");
  const [cuisineFilter, setCuisineFilter] = useState("All");
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

  useEffect(() => {
    const original = Number(costs.total) || 0;

    const gst = original * 0.11;
    const cgst = original * 0.07;


    const finalTotal = original + gst + cgst;
    const advance = finalTotal * 0.7;
    const balance = finalTotal * 0.3;

    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        originalCost: original,
        gstAmount: gst,
        cgstAmount: cgst,
        totalBudget: finalTotal,
        advancePayment: advance,
        balancePayment: balance,
      }
    }));
  }, [costs.total]);

  // const calculateEntertainmentCost = () => {
  //   let total = 0;

  //   // Go through all submenu categories inside entertainment
  //   const ent = formData.entertainment;

  //   const allKeys = [
  //     "CartoonCharacter",
  //     "Dance",
  //     "LivePerformance",
  //     "MagicShow",
  //     "Music_DJ_SoundSystem",
  //     "PuppetShow",
  //     "activitiesSelected",
  //   ];

  //   allKeys.forEach((key) => {
  //     const selectedItems = ent[key] || [];

  //     selectedItems.forEach((name) => {
  //       if (name !== "Other") {
  //         const found = entertainmentItems.find((i) => i.name === name);
  //         if (found) total += Number(found.price) || 0;
  //       }
  //     });
  //   });

  //   // ✔ Emcee pricing (optional: adjust as needed)
  //   if (ent.emceeRequired === "Yes") {
  //     total += 2000; // your default emcee cost
  //   }

  //   setCosts((prev) => {
  //     const updated = { ...prev, entertainment: total };
  //     updated.total =
  //       updated.food +
  //       updated.decoration +
  //       updated.photography +
  //       updated.entertainment +
  //       updated.venue;

  //     return updated;
  //   });
  // };
  // useEffect(() => {
  //   calculateEntertainmentCost();
  // }, [formData.entertainment]);

  // const calculatePhotographyCost = () => {
  //   let total = 0;

  //   // Selected photography/videography packages
  //   const selectedPackages = formData.photography.packageType || [];

  //   selectedPackages.forEach((name) => {
  //     if (name !== "Other") {
  //       const found = photographyItems.find((i) => i.name === name);
  //       if (found) total += Number(found.price) || 0;
  //     }
  //   });

  //   // Team requirement (optional)
  //   if (formData.photography.photoTeam === "Required") {
  //     total += 2500; // default team charge
  //   }

  //   // Instant photo (optional logic)
  //   if (formData.photography.instantPhoto === "Yes") {
  //     total += 1000; // default instant photo package
  //   }

  //   setCosts((prev) => {
  //     const updated = { ...prev, photography: total };

  //     updated.total =
  //       updated.food +
  //       updated.decoration +
  //       updated.photography +
  //       updated.entertainment +
  //       updated.venue;

  //     return updated;
  //   });
  // };
  // useEffect(() => {
  //   calculatePhotographyCost();
  // }, [formData.photography]);
  // const calculateEventStaffCost = () => {
  //   const foodServers = Number(formData.eventStaff.foodServers) || 0;
  //   const welcomeStaff = Number(formData.eventStaff.welcomeStaff) || 0;
  //   const maintenanceTeam = Number(formData.eventStaff.maintenanceTeam) || 0;

  //   const totalStaff = foodServers + welcomeStaff + maintenanceTeam;

  //   const eventStaffCost = totalStaff * 1500;

  //   setCosts(prev => {
  //     const updated = { ...prev, eventStaff: eventStaffCost };

  //     updated.total =
  //       prev.decoration.total +
  //       prev.foodArrangements.total +
  //       prev.entertainment.total +
  //       prev.photography.total +
  //       prev.venue +
  //       eventStaffCost;

  //     return updated;
  //   });
  // };
  // useEffect(() => {
  //   calculateEventStaffCost();
  // }, [formData.eventStaff]);

  useEffect(() => {
    console.log("📌 Total Event Cost:", costs.total);
  }, [costs.total]);

  const filterItems = (items) => {
    return items.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchFood.toLowerCase());

      const matchMealType =
        mealTypeFilter === "All" ? true : item.foodType === mealTypeFilter;

      const matchFoodTime =
        foodTimeFilter === "All" ? true : item.mealTime === foodTimeFilter;

      const matchCuisine =
        cuisineFilter === "All" ? true : item.cuisine === cuisineFilter;

      return matchSearch && matchMealType && matchFoodTime && matchCuisine;
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
      setDecorationItems(decorationItems);
      setCateringItems(cateringItems);
      setPhotographyItems(photographyItems);
      setMakeupItems(makeupItems);
      setVenueItems(venueItems);
      setMusicItems(musicItems);
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
    const savedUserId = localStorage.getItem("userId");
    const savedBirthdayId = localStorage.getItem("birthdayId");


    if (savedUserId) setUserId(savedUserId);
    if (savedBirthdayId) setBirthdayId(savedBirthdayId);
  }, []);

  const createEvent = async () => {
    console.log("👤 UserId from localStorage:", userId);

    if (!userId) {
      console.error("❌ No userId found in localStorage");
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/birthday/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...formData }),
      });

      const data = await res.json();
      console.log("📦 Create Event Response:", data);

      if (res.ok && data.birthday?._id) {
        const id = data.birthday._id;
        setBirthdayId(id);
        localStorage.setItem("birthdayId", id);

        console.log("✅ New event created:", id);
        return id;
      } else {
        console.error("❌ Failed to create event:", data.message || data);
        return null;
      }
    } catch (err) {
      console.error("❌ Error creating event:", err.message);
      return null;
    }
  };

  const handleNext = async () => {
    console.log(birthdayId)
    try {
      let id = birthdayId || localStorage.getItem("birthdayId");

      if (!id && step === 1) {
        console.log("🚀 Creating event for step 1...");
        id = await createEvent();
        if (id) {
          setBirthdayId(id);
          localStorage.setItem("birthdayId", id);
          console.log("🎉 New birthday event created:", id)
          return setStep((prev) => prev + 1);

        } else {
          console.error("❌ Failed to create event on step 1");
          return false;
        }
      }
      else if (id) {
        let activeId = id || localStorage.getItem("birthdayId");
        if (!activeId) {
          console.error(`⚠️ Cannot save: No valid birthdayId found`);
          return false;

        }
        console.log(`💾 Saving step ${step} data to birthdayId:`, activeId);
        await saveStepData(step, formData, activeId);

        setStep((prev) => prev + 1);
        console.log("➡️ Moved to next step successfully");
      }
    }
    catch (err) {
      console.error("❌ Error in handleNext:", err);
    }
  };

  const saveStepData = async (stepNumber, stepData, id) => {
    // if (!birthdayId) {
    //   console.error("⚠️ No birthdayId yet, skipping save");
    //   return;
    // }
    const finalId = id || birthdayId || localStorage.getItem("birthdayId");
    console.log(finalId)

    try {
      console.log("🧩 Sending to backend:", {
        birthdayId: finalId,
        step: stepNumber,
        formData: stepData,
      });
      const res = await fetch(`${API_URL}/birthday/update-step`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthdayId: finalId,
          step: stepNumber,
          formData: stepData,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        console.error("❌ Failed to save step data:", result.message || result);
      } else {
        console.log(`✅ Step ${stepNumber} saved successfully`);
      }
    } catch (error) {
      console.error("❌ Error saving step data:", error);
    }
  };


  const nextStep = async () => {
    const success = await handleNext();
    if (success) console.log("➡️ Moved to next step successfully");
  };

  const prevStep = async () => {
    try {
      const id = birthdayId || localStorage.getItem("birthdayId");

      if (!id) {
        console.error("⚠️ Cannot save: No valid birthdayId found");
        setStep((prev) => Math.max(prev - 1, 1)); // still allow navigation
        return;
      }

      console.log(`💾 Saving step ${step} data before going back for birthdayId:`, id);
      await saveStepData(step, formData, id);

      // Go back only after save completes
      setStep((prev) => Math.max(prev - 1, 1));
      console.log("⬅️ Moved to previous step successfully");
    } catch (err) {
      console.error("❌ Error in prevStep:", err);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [radius, setRadius] = useState("10");
  const [filterStars, setFilterStars] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const initialVenues = [
    { id: 1, name: "Grand Indoor Hall", type: "Indoor", lat: 17.3870, lng: 78.4867, stars: 3, image: "/placeholder.jpg", location: "Hyderabad", cost: 20000 },
    { id: 2, name: "City Party Hall", type: "Party Hall", lat: 17.3890, lng: 78.4820, stars: 4, image: "/placeholder.jpg", location: "Hyderabad", cost: 30000 },
    { id: 3, name: "Green Park Lawn", type: "Outdoor", lat: 17.3830, lng: 78.4880, stars: 5, image: "/placeholder.jpg", location: "Hyderabad", cost: 25000 },
  ];
  const [venues, setVenues] = useState(initialVenues);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    // libraries: ["places"],
  });

  const [budget, setBudget] = useState({
    totalBudget: 0,
    advancePayment: 0,
    balancePayment: 0
  });
  // Safe toFixed helper
  const safeFixed = (num) => {
    const n = Number(num);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  };

  // const getMainCourseItems = (mealType, mealTime, cuisine) => {
  //   if (!mealType || !mealTime || !cuisine) return {};

  //   const menus = {
  //     "South Indian": {
  //       Tiffin: {
  //         "Tiffin Dishes": ["Idli", "Vada", "Dosa", "Pongal", "Upma"],
  //       },
  //       Lunch: {
  //         "Rice Items": ["Sambar Rice", "Curd Rice", "Veg Biryani", "Tomato Rice"],
  //         "Curries": ["Aloo Fry", "Bendakaya Curry", "Dal", "Sambar"],
  //         "Flour Items": ["Chapati", "Parota", "Puri"],
  //       },
  //       Dinner: {
  //         "Rice Items": ["Lemon Rice", "Jeera Rice", "Biryani"],
  //         "Curries": ["Kurma", "Tomato Curry", "Paneer Masala"],
  //         "Flour Items": ["Chapati", "Naan", "Roti"],
  //       },
  //     },

  //     "North Indian": {
  //       Tiffin: {
  //         "Tiffens": ["Paratha", "Poha", "Aloo Tikki", "Chole Bhature"],
  //       },
  //       Lunch: {
  //         "Curries": ["Dal Makhani", "Paneer Butter Masala", "Aloo Gobi"],
  //         "Rice Items": ["Jeera Rice", "Veg Pulao", "Biryani"],
  //         "Flour Items": ["Naan", "Roti", "Paratha"],
  //       },
  //       Dinner: {
  //         "Curries": ["Rajma Chawal", "Butter Chicken", "Kadai Paneer"],
  //         "Flour Items": ["Tandoori Roti", "Butter Naan", "Missi Roti"],
  //       },
  //     },

  //     Italian: {
  //       Tiffin: {
  //         "BreakFast": ["Bread", "Butter", "Honey", "Jam Mixed-Fruite"],
  //       },
  //       Lunch: {
  //         "Pasta": ["Penne Alfredo", "Spaghetti Arrabiata"],
  //         "Pizza": ["Margherita", "Veg Supreme"],
  //       },
  //       Dinner: {
  //         "Pasta": ["Lasagna", "Fettuccine"],
  //         "Pizza": ["Pepperoni", "Cheese Burst"],
  //       },
  //     },

  //     Chinese: {
  //       Tiffin: {
  //         "BreakFast": ["Bread", "Butter", "Honey", "Jam Mixed-Fruite"],
  //       },
  //       Lunch: {
  //         "Rice & Noodles": ["Fried Rice", "Hakka Noodles"],
  //         "Sides": ["Manchurian", "Chilli Paneer", "Spring Rolls"],
  //       },
  //       Dinner: {
  //         "Rice & Noodles": ["Schezwan Rice", "Garlic Noodles"],
  //         "Sides": ["Momos", "Crispy Corn", "Honey Chilli Potato"],
  //       },
  //     },

  //     Japanese: {
  //       Tiffin: {
  //         "Tiffens": ["Paratha", "Poha", "Aloo Tikki", "Chole Bhature"],
  //       },
  //       Lunch: {
  //         "Sushi": ["California Roll", "Nigiri"],
  //         "Soups": ["Miso Soup"],
  //       },
  //       Dinner: {
  //         "Dishes": ["Ramen", "Tempura", "Teriyaki Chicken"],
  //       },
  //     },

  //     French: {
  //       Tiffin: {
  //         "Tiffens": ["Paratha", "Poha", "Aloo Tikki", "Chole Bhature"],
  //       },
  //       Lunch: {
  //         "Specials": ["Quiche", "Ratatouille"],
  //         "Desserts": ["Crème Brûlée"],
  //       },
  //       Dinner: {
  //         "Main Course": ["Coq au Vin", "Boeuf Bourguignon"],
  //       },
  //     },
  //   };

  //   // fallback for unknown cuisine or missing meal time
  //   return menus[cuisine]?.[mealTime] || {};
  // };


  // // ---------- helper: getFoodItems (you already have similar) ----------
  // const getFoodItems = (category, mealType, mealTime) => {
  //   const foodOptions = {
  //     "Welcome Drinks": {
  //       default: ["Lassi", "Juice", "Mocktail", "Soft Drinks", "Cold Coffee"],
  //       Veg: ["Fresh Juice", "Lemon Soda", "Butter Milk", "Rose Milk"],
  //       "Non-Veg": ["Fruit Punch", "Cold Coffee", "Soft Drinks"],
  //       Mixed: ["Fruit Punch", "Lemon Soda", "Mocktail"],
  //     },
  //     Starters: {
  //       default: ["Paneer Tikka", "Chicken Wings", "Spring Rolls", "Veg Manchurian", "Fish Fingers"],
  //       Veg: ["Paneer Tikka", "Veg Manchurian", "Spring Rolls"],
  //       "Non-Veg": ["Chicken Wings", "Fish Fingers", "Chicken 65"],
  //       Mixed: ["Paneer Tikka", "Chicken Wings", "Spring Rolls"],
  //     },
  //     Snacks: ["Samosa", "Cutlet", "Sandwich", "Pakora", "Popcorn"],
  //     Desserts: ["Gulab Jamun", "Ice Cream", "Rasmalai", "Cake", "Payasam"],
  //     "Beverages & Hot Drinks": ["Tea", "Coffee", "Green Tea", "Hot Chocolate"],
  //     Fruits: ["Apple", "Banana", "Watermelon", "Mango", "Pineapple"],
  //   };

  //   // if there is an entry keyed by mealType (Veg/Non-Veg/Mixed) use it,
  //   // else fall back to default or the raw array
  //   const entry = foodOptions[category];
  //   if (!entry) return [];

  //   if (Array.isArray(entry)) return entry;
  //   // entry is object: prefer mealType-specific list if present
  //   return entry[mealType] || entry.default || [];
  // };

  // // ---------- build foodSections (declare BEFORE return/JSX) ----------
  // const foodSections = [
  //   { title: "🥤 Welcome Drinks", field: "welcomeDrinks", category: "Welcome Drinks" },
  //   { title: "🍢 Starters", field: "starters", category: "Starters" },
  //   { title: "🍰 Desserts & Sweets", field: "desserts", category: "Desserts" },
  //   { title: "🍪 Snacks", field: "snacks", category: "Snacks" },
  //   { title: "☕ Beverages & Hot Drinks", field: "beverages", category: "Beverages & Hot Drinks" },
  //   { title: "🍎 Fruits", field: "fruits", category: "Fruits" },
  // ];

  useEffect(() => {
    const filterVenues = async () => {
      let center = { lat: 17.3850, lng: 78.4867 };
      if (searchQuery) {
        const geoResult = await geocodeAddress(searchQuery);
        if (geoResult) center = geoResult;
      }

      const filtered = initialVenues.filter((v) => {
        const matchesType = filterType ? v.type === filterType : true;
        const matchesStars = filterStars ? v.stars >= filterStars : true;
        const distance = getDistanceKm(center.lat, center.lng, v.lat, v.lng);
        return matchesType && matchesStars && distance <= Number(radius);
      });

      setVenues(filtered);
      setSelectedVenue(filtered[0] || null);
    };

    filterVenues();
  }, [searchQuery, filterType, radius, filterStars]);

  if (loadError) return <div className="text-center text-red-500 mt-10">❌ Failed to load Google Maps</div>;

  useEffect(() => {
    const UserId = localStorage.getItem("userId");
    console.log(UserId);
    if (UserId) {
      setFormData((prev) => ({ ...prev, userId: UserId }));
    }
  }, []);

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

  // const handleCheckboxChange = (parent, field, item, price = 0, multiplyByGuests = false) => {
  //   const existing = formData[parent]?.[field];
  //   const currentArray = Array.isArray(existing) ? existing : [];

  //   const newObj = {
  //     id: item._id,
  //     name: item.name,
  //     vendorId: item.vendorId,
  //     price: price
  //   };

  //   const isAdding = !currentArray.some(i => i.id === item._id);

  //   const updatedArray = isAdding
  //     ? [...currentArray, newObj]
  //     : currentArray.filter(i => i.id !== item._id);

  //   setFormData(prev => ({
  //     ...prev,
  //     [parent]: {
  //       ...prev[parent],
  //       [field]: updatedArray
  //     }
  //   }));

  //   updateCost(parent, field, price, isAdding, multiplyByGuests);
  // };

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

  const handleCustomChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };


  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // cleanup when component unmounts
    };
  }, []);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      axios
        .get(`${API_URL}/api/client/birthday/order/${id}`)
        .then((res) => {
          if (res.data) {
            setFormData((prev) => ({
              ...prev,
              ...res.data,
              venue: { ...prev.venue, ...(res.data.venue || {}) },
              timings: { ...prev.timings, ...(res.data.timings || {}) },
              decoration: { ...prev.decoration, ...(res.data.decoration || {}) },
              foodArrangements: {
                ...prev.foodArrangements,
                ...(res.data.foodArrangements || {}),
              },
              entertainment: {
                ...prev.entertainment,
                ...(res.data.entertainment || {}),
              },
              photography: {
                ...prev.photography,
                ...(res.data.photography || {}),
              },
              returnGifts: {
                ...prev.returnGifts,
                ...(res.data.returnGifts || {}),
              },
              eventStaff: {
                ...prev.eventStaff,
                ...(res.data.eventStaff || {}),
              },
              budget: {
                ...prev.budget,
                ...(res.data.budget || {}),
              },
            }));
            console.log("Fetched event data:", res.data);
          }
        })
        .catch((err) => console.error("❌ Error fetching event:", err));
    }
  }, [id]);

  // useEffect(() => {
  //   const guestCount = Number(formData.timings?.capacity) || 0;

  //   const {
  //     venue = { total: 0 },
  //     decoration = { total: 0 },
  //     food = { total: 0 },
  //     entertainment = { total: 0 },
  //     photography = { total: 0 },
  //     eventStaff = { total: 0 },
  //     total = 0
  //   } = costs;

  //   const returnGiftQty = Number(formData.returnGifts?.quantity) || 0;
  //   const returnGiftBudget = Number(formData.returnGifts?.budget) || 0;
  //   const returnGiftTotal = returnGiftQty * returnGiftBudget;

  //   const totalBudget = total + returnGiftTotal;
  //   const advancePayment = totalBudget * 0.7;
  //   const balancePayment = totalBudget - advancePayment;

  //   setFormData(prev => ({
  //     ...prev,
  //     budget: {
  //       totalBudget,
  //       advancePayment,
  //       balancePayment,
  //     },
  //   }));
  // }, [costs, formData.returnGifts, formData.timings.capacity]);


  const birthdayQuotes = [
    "A day filled with laughter, love, and sweet memories awaits you.",
    "Come celebrate a special day with joy, cake, and cheerful moments.",
    "Another year older, another reason to celebrate together.",
    "Let’s make beautiful memories and celebrate a wonderful birthday.",
    "Your presence will make this birthday celebration truly special."
  ];

  // <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

  return (
    <>
      <Header />
      <Banner />
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
                      <img src={v.image} alt={v.name} className="w-24 h-24 object-cover rounded-lg" />
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

                {/* Invitation Card Preview & Download */}
                <div className="lg:w-1/2 flex flex-col items-center space-y-4">

                  {/* Background Selection */}
                  <div className="flex gap-3 flex-wrap justify-center">
                    {cards.map(card => (
                      <img
                        key={card._id}
                        src={`${API_URL}/${card.image}`}
                        alt={card.cardName}
                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-4 ${selectedCard?._id === card._id ? "border-blue-500" : "border-transparent"}`}
                        onClick={() => setSelectedCard(card)}
                      />
                    ))}
                  </div>

                  {/* Invitation Card Preview */}
                  {selectedVenue && (
                    <div
                      id="invitation-card"
                      className="p-6 border-2 border-pink-300 rounded-2xl shadow-lg w-full max-w-md relative text-gray-800"
                      style={{
                        backgroundImage: selectedCard
                          ? `url("${API_URL}/${selectedCard.image}")`
                          : "linear-gradient(to bottom right, #fff, #fff9c4)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      {/* Company Logo */}
                      <img
                        src="/logo/epudu-logo.png"
                        alt="Epudu Logo"
                        className="absolute top-4 left-4 w-14 h-14 object-contain"
                      />

                      {/* Invitation Content */}
                      <div className="mt-12 text-center p-4 rounded-xl">
                        <h3 className="text-3xl font-bold text-pink-600 mb-2">
                          You’re Invited!
                        </h3>

                        <p className="italic text-gray-700 mb-3">
                          {
                            birthdayQuotes[
                            Math.floor(Math.random() * birthdayQuotes.length)
                            ]
                          }
                        </p>

                        <p className="text-xl font-semibold mb-2">
                          🎂 {formData.celebrantName || "________"}’s Birthday 🎂
                        </p>

                        <p className="mb-1">
                          <span className="font-semibold">Theme:</span>{" "}
                          {formData.themePreference || "________"}
                        </p>

                        <p className="mb-1">
                          <span className="font-semibold">Date:</span>{" "}
                          {formData.eventDate || "________"}
                        </p>

                        <p className="mb-1">
                          <span className="font-semibold">Time:</span>{" "}
                          {formData.timings?.time || "________"}
                        </p>

                        <p className="mb-4">
                          <span className="font-semibold">Venue:</span>{" "}
                          {selectedVenue.name}, {selectedVenue.location}
                        </p>

                        <p className="text-sm italic text-gray-600">
                          We look forward to celebrating with you!
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="flex gap-4 justify-end text-xs text-gray-700">
                        <p>
                          Contact: <span className="font-semibold"> +919030406896</span>
                        </p>
                        <p>
                          Email: <span className="font-semibold">hr@epudu.com</span>
                        </p>
                        <p>
                          Insta: <span className="font-semibold">@epudu_events</span>
                        </p>
                      </div>

                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
                    onClick={() => {
                      const card = document.getElementById("invitation-card");
                      if (!card) return;

                      htmlToImage.toPng(card, {
                        cacheBust: true,
                        backgroundColor: null, // ensure transparency handled
                      })
                        .then((dataUrl) => {
                          const link = document.createElement("a");
                          link.download = `${formData.celebrantName || "invitation"}.png`;
                          link.href = dataUrl;
                          link.click();
                        })
                        .catch((err) => console.error("Invitation image error:", err));
                    }}
                  >
                    Download Invitation
                  </button>
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

                    await fetch(`${API_URL}/api/client/birthday/update-step`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        birthdayId,
                        step: 10,
                        formData: pendingData,
                      }),
                    });

                    // ✅ STEP 2: Create Razorpay order
                    const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
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

                      await fetch(`${API_URL}/api/client/birthday/update-step`, {
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

                          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
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
                            await fetch(`${API_URL}/api/client/birthday/update-step`, {
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
                            await fetch(`${API_URL}/api/vendor/orders/sync`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                            });

                            // ********************************************
                            // 🔥 STEP C — INFORM ADMIN
                            // ********************************************
                            await fetch(`${API_URL}/api/admin/notifications/sendAdminNotification`, {
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
                            await fetch(`${API_URL}/api/client/notifications/client-bill`, {
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
      <Footer />
    </>
  );
}