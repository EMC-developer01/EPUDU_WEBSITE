"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import api from "./api";

export default function EventGalaxyPanel() {

    const logoLetters = ["E", "P", "U", "D", "U"];
    const fallback = "/default.jpg";
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
    console.log(API_URL)

    const API = `${API_URL}/api/admin/Client-homepages-images/all`;
    console.log(API)
    // const IMAGE_BASE = `${MEDIA_URL}/homepageImages`;
    const VIDEO_API = `${API_URL}/api/admin/client-homepage-videos/all`;
    const VIDEO_BASE = `${MEDIA_URL}/`;

    const [events, setEvents] = useState([]);
    const [logoImages, setLogoImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bgVideos, setBgVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(0);
    const fixS3Url = (url) => {
        if (!url) return fallback;

        return url.replace(
            "s3.amazonaws.com",
            "s3.ap-south-2.amazonaws.com"
        );
    };



    // ---------------- FETCH EVENTS ----------------
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get(API);

                const activeEvents = res.data.filter(item => item.isActive);
                console.log(activeEvents);


                    setEvents(activeEvents);

                // Pick 5 images for EPUDU letters
                const selectedImages = activeEvents.slice(0, 5);
                console.log(selectedImages);

                const imagesForLetters = selectedImages.map(
                    i => i.image ? fixS3Url(i.image) : fallback
                );
                setLogoImages(imagesForLetters);
                console.log(imagesForLetters);


            } catch (err) {
                console.error("Failed to load homepage images", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        console.log("logoImages updated:", logoImages);
    }, [logoImages]);

    const handleExplore = () => {
        document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await axios.get(VIDEO_API);
                const active = res.data.filter(v => v.isActive);
                setBgVideos(active);
            } catch (err) {
                console.error("Failed to load background videos", err);
            }
        };

        fetchVideos();
    }, []);
    useEffect(() => {
        if (!bgVideos.length) return;

        const interval = setInterval(() => {
            setCurrentVideo((prev) => (prev + 1) % bgVideos.length);
        }, 12000); // change every 12s

        return () => clearInterval(interval);
    }, [bgVideos]);

    const getVideoUrl = (videoPath) => {
        if (!videoPath) return "";

        // remove "uploads/" if present
        const cleanedPath = videoPath.replace("uploads/", "");

        return `${MEDIA_URL}/${cleanedPath}`;
    };



    return (
        <section className="w-full min-h-[calc(100vh-75px)] pt-[75px] flex flex-col lg:flex-row">
            {/* 🎥 BACKGROUND VIDEO */}
            {bgVideos.length > 0 && (
                <motion.video
                    key={currentVideo}
                    src={getVideoUrl(bgVideos[currentVideo].video)}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                        duration: 14,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />
            )}
            <div className="absolute inset-0 bg-black/35 z-0" />

            <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-10 overflow-hidden ">

                {/* 🔹 CONTENT (UNCHANGED) */}
                <div className="relative z-10 flex flex-col items-center">

                    {/* EPUDU LETTERS */}
                    <div className="flex justify-center items-end flex-wrap lg:flex-nowrap">
                        {logoImages.length === logoLetters.length &&
                            logoLetters.map((letter, i) => (
                                <motion.span
                                    key={i}
                                    className="font-black leading-none text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[10rem] xl:text-[12rem]"
                                    style={{
                                        backgroundImage: `url("${encodeURI(logoImages[i])}")`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",

                                        // 🔥 BORDER LINE
                                        WebkitTextStroke: "3px #fff",   // black border
                                        textStroke: "3px #000",

                                        margin: "0 6px",
                                        display: "inline-block",
                                    }}
                                    animate={{ scale: [1, 1.06, 1] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.25,
                                    }}
                                >
                                    {letter}
                                </motion.span>

                            ))}
                    </div>

                    {/* SUB TEXT */}
                    <motion.p className="mt-3 text-white text-sm sm:text-base md:text-xl tracking-[0.35em] opacity-90">
                        EVENT MANAGEMENT
                    </motion.p>

                    {/* ZOMATO-STYLE APP PROMO */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center max-w-xl"
                    >
                        <h3 className="text-2xl sm:text-3xl font-bold text-white-900">
                            India’s #1 Events App
                        </h3>

                        <p className="mt-3 text-white-600 text-sm sm:text-base">
                            Experience fast & easy event booking, passes, and live updates
                            on the EPUDU app
                        </p>

                        {/* APP DOWNLOAD BUTTONS */}
                        <div className="mt-6 flex justify-center gap-4">
                            <img
                                src="/assets/playstore.png"
                                alt="Download on Play Store"
                                className="h-12 cursor-pointer hover:scale-105 transition"
                            />
                            <img
                                src="/assets/appstore.png"
                                alt="Download on App Store"
                                className="h-12 cursor-pointer hover:scale-105 transition"
                            />
                        </div>
                    </motion.div>

                    {/* CTA BUTTON */}
                    <motion.button
                        onClick={handleExplore}
                        className="mt-10 px-10 py-3 rounded-full bg-black text-white font-bold shadow-lg hover:scale-105 transition"
                        style={{ backgroundColor: "black", color: "white" }}
                    >
                        Explore Events
                    </motion.button>
                </div>

            </div>


            {/* RIGHT - EVENTS CARDS */}
            {!loading && events.length > 0 && (
                <div className="flex-1 relative overflow-hidden px-4 pb-10">
                    <motion.div
                        className="absolute top-0 left-0 w-full"
                        animate={{ y: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, duration: events.length * 4, ease: "linear" }}
                    >
                        {[...events, ...events].map((e, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05, x: 8, backgroundColor: "rgba(70, 124, 232, 0.86)" }}

                                className="mx-auto mb-5 w-full max-w-[420px] rounded-xl 
           bg-white backdrop-blur-md 
           border border-white 
           shadow-lg 
           text-black p-4 cursor-pointer"

                            >
                                <div className="flex items-center gap-4 ">
                                    <img
                                        src={fixS3Url(e.image)}
                                        alt={e.imageName}
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-blue"
                                    />
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-black">{e.imageName}</h3>
                                        <p className="text-xs sm:text-sm opacity-70 text-black">{e.description || ""}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

        </section>
    );
}
