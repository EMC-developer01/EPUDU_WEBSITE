"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 17.385044,
  lng: 78.486671,
};

const libraries = ["places"];

const eventKeywords = {
  wedding: "wedding hall banquet",
  birthday: "birthday party hall",
  corporate: "conference hall meeting room",
  function: "function hall event venue",
};

const cities = ["Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi"];

export default function VenueBookingSection() {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState(defaultCenter);

  const [eventType, setEventType] = useState("wedding");
  const [city, setCity] = useState("");
  const [mode, setMode] = useState("browse");

  const [pinnedLocation, setPinnedLocation] = useState(null);

  const inputRef = useRef(null);

  // 🔥 Fetch based on map bounds (AUTO RADIUS)
  const fetchPlacesByBounds = () => {
    if (!map || !window.google || mode === "pin") return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const service = new window.google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location: map.getCenter(),
        radius: getRadiusFromBounds(bounds),
        keyword: eventKeywords[eventType],
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        }
      }
    );
  };

  // 📏 Convert bounds → radius
  const getRadiusFromBounds = (bounds) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const lat = (ne.lat() + sw.lat()) / 2;
    const lng = (ne.lng() + sw.lng()) / 2;

    const R = 6371;

    const dLat = (ne.lat() - lat) * (Math.PI / 180);
    const dLng = (ne.lng() - lng) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * (Math.PI / 180)) *
      Math.cos(ne.lat() * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000; // meters
  };

  // 🔎 Search (single)
  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const loc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setCenter(loc);
      map.panTo(loc);
      fetchPlacesByBounds();
    });
  }, [map]);

  // 📍 Current location
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setCenter(loc);
      map.panTo(loc);
      fetchPlacesByBounds();
    });
  };

  // 🎯 Apply city filter
  const applyFilters = () => {
    if (!city || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: city }, (results, status) => {
      if (status === "OK") {
        const loc = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };

        setCenter(loc);
        map.panTo(loc);
        fetchPlacesByBounds();
      }
    });
  };

  // 🔄 Initial
  useEffect(() => {
    if (map && mode === "browse") fetchPlacesByBounds();
  }, [map, eventType, mode]);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* 🔝 TOP BAR */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "12px",
            background: "#0f172a",
            color: "#fff",
            alignItems: "center",
          }}
        >
          <input
            ref={inputRef}
            placeholder="Search location or venue"
            style={{
              padding: "8px",
              width: "220px",
              borderRadius: "6px",
              border: "none",
            }}
          />

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px" }}
          >
            <option value="">City</option>
            {cities.map((c, i) => (
              <option key={i}>{c}</option>
            ))}
          </select>

          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px" }}
          >
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="corporate">Corporate</option>
            <option value="function">Function</option>
          </select>

          <button
            onClick={applyFilters}
            style={{
              background: "#22c55e",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            Apply
          </button>

          <button
            onClick={() => setMode("browse")}
            style={{
              background: mode === "browse" ? "#3b82f6" : "#1e293b",
              color: "#fff",
              padding: "8px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            Browse
          </button>

          <button
            onClick={() => setMode("pin")}
            style={{
              background: mode === "pin" ? "#3b82f6" : "#1e293b",
              color: "#fff",
              padding: "8px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            Set Pin
          </button>

          <button
            onClick={getCurrentLocation}
            style={{
              background: "#f59e0b",
              color: "#fff",
              padding: "8px",
              borderRadius: "6px",
              border: "none",
            }}
          >
            📍
          </button>
        </div>

        {/* MAIN */}
        <div style={{ display: "flex" }}>
          {/* LEFT LIST */}
          <div
            style={{
              width: "35%",
              height: "calc(100vh - 60px)",
              overflowY: "auto",
              background: "#f8fafc",
            }}
          >
            {mode === "browse" &&
              places.map((place, i) => {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                const image =
                  place.photos?.[0]?.getUrl({ maxWidth: 400 }) ||
                  "https://via.placeholder.com/200";

                return (
                  <div
                    key={i}
                    onClick={() => {
                      setSelected(place);
                      map.panTo({ lat, lng });
                    }}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={image}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                    <h4 style={{ color: "#0f172a" }}>{place.name}</h4>
                    <p style={{ color: "#475569" }}>{place.vicinity}</p>
                  </div>
                );
              })}

            {mode === "pin" && (
              <div style={{ padding: "20px" }}>
                Click map to set your venue 📍
              </div>
            )}
          </div>

          {/* MAP */}
          <div style={{ width: "65%" }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              onLoad={(m) => setMap(m)}
              onIdle={fetchPlacesByBounds}
              onClick={(e) => {
                if (mode === "pin") {
                  const loc = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  };
                  setPinnedLocation(loc);
                  setCenter(loc);
                }
              }}
            >
              {mode === "browse" &&
                places.map((place, i) => (
                  <Marker
                    key={i}
                    position={{
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    }}
                    onClick={() => setSelected(place)}
                  />
                ))}

              {mode === "pin" && pinnedLocation && (
                <Marker position={pinnedLocation} />
              )}

              {selected && (
                <InfoWindow
                  position={{
                    lat: selected.geometry.location.lat(),
                    lng: selected.geometry.location.lng(),
                  }}
                  onCloseClick={() => setSelected(null)}
                >
                  <div>
                    <h4>{selected.name}</h4>
                    <p>{selected.vicinity}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}