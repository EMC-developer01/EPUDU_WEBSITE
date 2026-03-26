"use client";

import React, { useEffect, useState, useRef } from "react";

export default function VenueBookingSection() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    stars: "",
    pricing: "",
  });

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // 📍 Get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setLocation({ lat: 17.385, lng: 78.4867 }); // fallback
      }
    );
  }, []);

  // 🗺️ Initialize map
  useEffect(() => {
    if (!location || !window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: location,
      zoom: 13,
      disableDefaultUI: false,
    });

    fetchVenues(location);
  }, [location]);

  // 📡 Dummy fetch (replace API)
  const fetchVenues = async (loc) => {
    const data = [
      {
        id: 1,
        name: "Grand Palace",
        city: "Hyderabad",
        stars: 5,
        price: 5000,
        pricingType: "daily",
        lat: loc.lat + 0.01,
        lng: loc.lng + 0.01,
      },
      {
        id: 2,
        name: "Royal Banquet",
        city: "Hyderabad",
        stars: 4,
        price: 2000,
        pricingType: "hourly",
        lat: loc.lat - 0.01,
        lng: loc.lng - 0.01,
      },
    ];

    setVenues(data);
    setFilteredVenues(data);
    addMarkers(data);
  };

  // 📍 Markers
  const addMarkers = (data) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    data.forEach((venue) => {
      const marker = new window.google.maps.Marker({
        position: { lat: venue.lat, lng: venue.lng },
        map: mapInstance.current,
        title: venue.name,
      });
      markersRef.current.push(marker);
    });
  };

  // 🔍 Filtering
  useEffect(() => {
    let result = venues;

    if (search) {
      result = result.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filters.city) {
      result = result.filter((v) => v.city === filters.city);
    }

    if (filters.stars) {
      result = result.filter((v) => v.stars === Number(filters.stars));
    }

    if (filters.pricing) {
      result = result.filter((v) => v.pricingType === filters.pricing);
    }

    setFilteredVenues(result);
    addMarkers(result);
  }, [search, filters, venues]);

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-white">

        {/* 🔍 Sticky Header */}
        <div className="p-3 border-b bg-white sticky top-0 z-10 space-y-2">
          <input
            type="text"
            placeholder="Search venue or location..."
            className="w-full p-2 border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-2 overflow-x-auto">
            <select
              className="border p-2"
              onChange={(e) =>
                setFilters({ ...filters, city: e.target.value })
              }
            >
              <option value="">City</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>

            <select
              className="border p-2"
              onChange={(e) =>
                setFilters({ ...filters, stars: e.target.value })
              }
            >
              <option value="">Stars</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
            </select>

            <select
              className="border p-2"
              onChange={(e) =>
                setFilters({ ...filters, pricing: e.target.value })
              }
            >
              <option value="">Pricing</option>
              <option value="daily">Daily</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>

        {/* 📋 Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg">{venue.name}</h2>
              <p className="text-sm text-gray-500">{venue.city}</p>
              <p>{"⭐".repeat(venue.stars)}</p>
              <p className="font-medium">
                ₹{venue.price} / {venue.pricingType}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - MAP */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}