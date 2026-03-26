"use client";

import React, { useEffect, useRef, useState } from "react";

const EVENT_KEYWORDS = {
  birthday: "party hall",
  wedding: "wedding venue banquet hall",
  function: "banquet hall function hall",
  corporate: "conference hall hotel",
};

export default function VenueBookingSection() {
  const mapRef = useRef(null);
  const map = useRef(null);
  const service = useRef(null);
  const markers = useRef([]);

  const [eventType, setEventType] = useState("birthday");
  const [mode, setMode] = useState("browse"); // browse | current
  const [location, setLocation] = useState(null);
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");

  // 📍 Get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setLocation({ lat: 17.385, lng: 78.4867 })
    );
  }, []);

  // 🗺️ Init Map
  useEffect(() => {
    if (!location || !window.google) return;

    map.current = new window.google.maps.Map(mapRef.current, {
      center: location,
      zoom: 13,
    });

    service.current = new window.google.maps.places.PlacesService(
      map.current
    );

    fetchVenues(location);

    // 🔥 Map move → fetch new venues
    map.current.addListener("idle", () => {
      const center = map.current.getCenter();
      fetchVenues({
        lat: center.lat(),
        lng: center.lng(),
      });
    });
  }, [location, eventType]);

  // 📡 Fetch venues from Google
  const fetchVenues = (loc) => {
    if (!service.current) return;

    const request = {
      location: loc,
      radius: 5000,
      keyword: EVENT_KEYWORDS[eventType],
    };

    service.current.nearbySearch(request, (results, status) => {
      if (status === "OK") {
        setVenues(results.slice(0, 30));
        renderMarkers(results);
      }
    });
  };

  // 📍 Markers
  const renderMarkers = (places) => {
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    places.forEach((place) => {
      const marker = new window.google.maps.Marker({
        map: map.current,
        position: place.geometry.location,
        title: place.name,
      });

      markers.current.push(marker);
    });
  };

  // 🔍 Search place (city / area / venue)
  const handleSearch = () => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: search }, (results, status) => {
      if (status === "OK") {
        const loc = results[0].geometry.location;

        map.current.setCenter(loc);
        fetchVenues({
          lat: loc.lat(),
          lng: loc.lng(),
        });
      }
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row">

      {/* LEFT */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-white">

        {/* 🔥 TOP CONTROLS */}
        <div className="p-3 border-b space-y-2 sticky top-0 bg-white z-10">

          {/* Event Type */}
          <select
            className="w-full p-2 border"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="birthday">Birthday</option>
            <option value="wedding">Wedding</option>
            <option value="function">Function</option>
            <option value="corporate">Corporate</option>
          </select>

          {/* Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("browse")}
              className={`flex-1 p-2 border ${mode === "browse" && "bg-black text-white"
                }`}
            >
              Browse Venues
            </button>

            <button
              onClick={() => setMode("current")}
              className={`flex-1 p-2 border ${mode === "current" && "bg-black text-white"
                }`}
            >
              My Location
            </button>
          </div>

          {/* Search (only browse mode) */}
          {mode === "browse" && (
            <div className="flex gap-2">
              <input
                className="flex-1 border p-2"
                placeholder="Search city / area / venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={handleSearch} className="px-4 border">
                Go
              </button>
            </div>
          )}
        </div>

        {/* 📋 VENUE LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {venues.map((place) => (
            <div key={place.place_id} className="border p-3 rounded-lg">
              <h2 className="font-semibold">{place.name}</h2>
              <p className="text-sm text-gray-500">
                {place.vicinity}
              </p>
              <p>{"⭐".repeat(place.rating || 3)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - MAP */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}