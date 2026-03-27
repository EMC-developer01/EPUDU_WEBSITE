"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 17.385044, lng: 78.486671 };
const libraries = ["places"];

const eventKeywords = {
  wedding: "wedding hall banquet",
  birthday: "birthday party hall",
  corporate: "conference hall meeting room",
  function: "function hall event venue",
};
const cities = ["Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi"];

export default function VenueBookingSection({ isLoaded }) {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [eventType, setEventType] = useState("birthday");
  const [city, setCity] = useState("");
  const [mode, setMode] = useState("browse");
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [pinnedAddress, setPinnedAddress] = useState("");
  const inputRef = useRef(null);

  const fetchTimerRef = useRef(null);

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
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
  };

  const fetchPlacesByBounds = useCallback(() => {
    if (!map || !window.google || mode === "pin") return;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);

    fetchTimerRef.current = setTimeout(() => {
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
            setPlaces((prev) => {
              const prevIds = prev.map((p) => p.place_id).join(",");
              const newIds = results.map((p) => p.place_id).join(",");

              if (prevIds === newIds) return prev;

              return results.map((place) => ({
                ...place,
                estimatedCost: 20000,
              }));
            });
          }
        }
      );
    }, 600);
  }, [map, mode, eventType]);

  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, []);

  const getAddressFromLatLng = (lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setPinnedAddress(results[0].formatted_address);
      } else {
        setPinnedAddress("Address not found");
      }
    });
  };

  useEffect(() => {
    if (!isLoaded || !window.google || !inputRef.current) return;
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const loc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(loc);
      map?.panTo(loc);
      fetchPlacesByBounds();
    });
  }, [isLoaded, map]);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCenter(loc);
      map?.panTo(loc);
      fetchPlacesByBounds();
    });
  };

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
        map?.panTo(loc);
        fetchPlacesByBounds();
      }
    });
  };

  useEffect(() => {
    if (isLoaded && map && mode === "browse") fetchPlacesByBounds();
  }, [isLoaded, map, eventType, mode]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>

      {/* ✅ TOP BAR FIXED */}
      <div style={{
        display: "flex",
        gap: "10px",
        padding: "12px",
        background: "#0f172a",
        color: "#fff",
        flexWrap: "wrap",
        width: "100%",
      }}>
        <input ref={inputRef} placeholder="Search location or venue" />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">City</option>
          {cities.map((c, i) => <option key={i}>{c}</option>)}
        </select>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate">Corporate</option>
          <option value="function">Function</option>
        </select>
        <button onClick={applyFilters}>Apply</button>
        <button onClick={() => setMode("browse")}>Browse</button>
        <button onClick={() => setMode("pin")}>Set Pin</button>
        <button onClick={getCurrentLocation}>📍</button>
      </div>

      {/* ✅ MAIN FIXED */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
      }}>

        {/* LEFT PANEL */}
        <div style={{
          width: "400px",
          overflowY: "auto",
          padding: "10px",
          background: "#f8fafc",
        }}>
          {/* KEEP YOUR EXISTING CONTENT */}
        </div>

        {/* MAP */}
        <div style={{ flex: 1, minHeight: "400px" }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={(m) => setMap(m)}
            onDragEnd={fetchPlacesByBounds}
            onZoomChanged={fetchPlacesByBounds}
          >
            {places.map((place, i) => (
              <Marker
                key={i}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }}
              />
            ))}
          </GoogleMap>
        </div>

      </div>
    </div>
  );
}