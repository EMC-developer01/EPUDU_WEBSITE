'use client';
import { useState, useEffect } from 'react';

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  const quotes = [
    "Every Moment Matters. We Make Moments Memorable.",
    "Turning Ideas Into Experiences — That’s EPUDU.",
    "Crafting Emotions, Not Just Events.",
  ];
  const API_URL = import.meta.env.VITE_API_URL;
  const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
  console.log(API_URL,MEDIA_URL)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/client-banner/all`, {
          cache: "no-store",
        });

        const data = await res.json();

        const activeBanners = data.filter(
          b => b.isActive === true || b.isActive === "active" || b.isActive === 1
        );

        setBanners(activeBanners);
      } catch (err) {
        console.error("Banner fetch failed", err);
      }
    };

    fetchBanners(); // initial load

    const interval = setInterval(fetchBanners, 5000); // 🔁 every 5 sec

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (!banners.length) return;

    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [banners]);

  if (!banners.length) return null;

  return (
    <section className="relative w-full h-[350px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
            }`}
        >
          <img
            src={`${MEDIA_URL}/banners/${banner.image}`}
            alt="Banner"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-white text-xl md:text-3xl lg:text-5xl font-bold text-center px-6">
              {quotes[current % quotes.length]}
            </h2>
          </div>
        </div>
      ))}
    </section>
  );
}
