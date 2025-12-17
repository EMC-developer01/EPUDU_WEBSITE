'use client';
import { useState, useEffect } from 'react';

export default function Banner() {
  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659",
  ];

  const quotes = [
    "Every Moment Matters. We Make Moments Memorable.",
    "Turning Ideas Into Experiences — That’s EPUDU.",
    "Crafting Emotions, Not Just Events.",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[350px] overflow-hidden">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
            }`}
        >
          {/* Background Image */}
          <img
            src={img}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Dark Overlay + Quote */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-white text-xl md:text-3xl lg:text-5xl font-bold drop-shadow-lg text-center px-6">
              {quotes[current]}
            </h2>
          </div>
        </div>
      ))}
    </section>
  );
}
