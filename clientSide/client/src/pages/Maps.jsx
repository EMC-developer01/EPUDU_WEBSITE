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
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
      },
      () => {
        setLocation({ lat: 17.385, lng: 78.4867 }); // fallback (Hyderabad)
      }
    );
  }, []);

  // 🗺️ Initialize map
  useEffect(() => {
    if (!location || !window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: location,
      zoom: 13,
    });

    fetchVenues(location);
  }, [location]);

  // 📡 Fetch venues (replace API)
  const fetchVenues = async (loc) => {
    // Replace with your API
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

  // 📍 Add markers
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

  // 🔍 Filter logic
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
    <div className="flex h-screen">
      {/* LEFT SIDE - LIST */}
      <div className="w-1/2 overflow-y-auto p-4 space-y-4 bg-white">
        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search venue..."
          className="w-full p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 🎯 Filters */}
        <div className="flex gap-2 mt-2">
          <select
            onChange={(e) =>
              setFilters({ ...filters, city: e.target.value })
            }
            className="border p-2"
          >
            <option value="">City</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>

          <select
            onChange={(e) =>
              setFilters({ ...filters, stars: e.target.value })
            }
            className="border p-2"
          >
            <option value="">Stars</option>
            <option value="5">5 Star</option>
            <option value="4">4 Star</option>
          </select>

          <select
            onChange={(e) =>
              setFilters({ ...filters, pricing: e.target.value })
            }
            className="border p-2"
          >
            <option value="">Pricing</option>
            <option value="daily">Daily</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        {/* 📋 Venue List */}
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold">{venue.name}</h2>
            <p>{venue.city}</p>
            <p>{"⭐".repeat(venue.stars)}</p>
            <p>₹{venue.price} / {venue.pricingType}</p>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE - MAP */}
      <div className="w-1/2 h-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}