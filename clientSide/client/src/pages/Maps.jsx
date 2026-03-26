"use client";

import React, { useEffect, useRef, useState } from "react";

export default function VenueBookingSection() {
  const mapRef = useRef(null);
  const map = useRef(null);
  const service = useRef(null);
  const markers = useRef([]);
  const markerRef = useRef(null);

  const [mode, setMode] = useState("browse"); // browse | location
  const [eventType, setEventType] = useState("Birthday");
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");

  // 📍 Init Map
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      map.current = new google.maps.Map(mapRef.current, {
        center: loc,
        zoom: 14,
      });

      service.current = new google.maps.places.PlacesService(map.current);

      // Default marker (for location mode)
      markerRef.current = new google.maps.Marker({
        position: loc,
        map: map.current,
        draggable: true,
      });

      markerRef.current.addListener("dragend", () => {
        const p = markerRef.current.getPosition();
        setAddress(`Lat: ${p.lat()}, Lng: ${p.lng()}`);
      });

      fetchPlaces(loc);

      // 🔄 Update on map move
      map.current.addListener("idle", () => {
        if (mode === "browse") {
          const center = map.current.getCenter();
          fetchPlaces({
            lat: center.lat(),
            lng: center.lng(),
          });
        }
      });
    });
  }, []);

  // 📡 Fetch venues (Google Places)
  const fetchPlaces = (loc) => {
    if (!service.current) return;

    const request = {
      location: loc,
      radius: 5000,
      keyword:
        "banquet hall OR wedding hall OR resort OR hotel OR party hall",
    };

    service.current.nearbySearch(request, (results) => {
      if (!results) return;

      const limited = results.slice(0, 30);
      setPlaces(limited);
      addMarkers(limited);
    });
  };

  // 📍 Markers
  const addMarkers = (results) => {
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    results.forEach((place) => {
      const marker = new google.maps.Marker({
        map: map.current,
        position: place.geometry.location,
      });

      markers.current.push(marker);
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col">

      {/* 🔝 TOP BAR */}
      <div className="p-3 border-b bg-white flex flex-wrap gap-3 items-center">

        {/* 🎉 Event Type */}
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="border p-2 rounded"
        >
          <option>Birthday</option>
          <option>Wedding</option>
          <option>Engagement</option>
          <option>Party</option>
          <option>Function</option>
        </select>

        {/* 🔘 Mode Toggle */}
        <div className="flex border rounded overflow-hidden">
          <button
            onClick={() => setMode("browse")}
            className={`px-4 py-2 ${mode === "browse" ? "bg-black text-white" : ""
              }`}
          >
            Browse Venues
          </button>
          <button
            onClick={() => setMode("location")}
            className={`px-4 py-2 ${mode === "location" ? "bg-black text-white" : ""
              }`}
          >
            My Location
          </button>
        </div>

        {/* 🔍 Search (only browse mode) */}
        {mode === "browse" && (
          <input
            type="text"
            placeholder="Search venues or areas..."
            className="border p-2 rounded flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {/* 📦 MAIN CONTENT */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-3">

          {/* 📍 LOCATION MODE */}
          {mode === "location" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Confirm Location</h2>

              <input
                type="text"
                placeholder="Enter address manually"
                className="w-full border p-2 rounded"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <button className="bg-black text-white px-4 py-2 rounded">
                Confirm Location
              </button>
            </div>
          )}

          {/* 🏨 BROWSE MODE */}
          {mode === "browse" && (
            <div className="space-y-3">
              {places.map((p, i) => (
                <div
                  key={i}
                  className="border p-3 rounded-lg shadow hover:shadow-md"
                >
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-sm text-gray-500">{p.vicinity}</p>
                  <p>⭐ {p.rating || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🗺️ MAP */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}