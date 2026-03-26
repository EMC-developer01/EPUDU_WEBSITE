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
  const [pinnedAddress, setPinnedAddress] = useState("");

  const inputRef = useRef(null);

  // 🔥 Fetch venues
  const fetchPlacesByBounds = () => {
    if (!map || !window.google || mode === "pin") return;

    const service = new window.google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location: map.getCenter(),
        radius: 20000,
        keyword: eventKeywords[eventType],
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        }
      }
    );
  };

  // 🔁 Reverse Geocode (lat/lng → address)
  const getAddressFromLatLng = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === "OK" && results[0]) {
          setPinnedAddress(results[0].formatted_address);
        } else {
          setPinnedAddress("Address not found");
        }
      }
    );
  };

  // 🔎 Search
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

  // 🔄 Load
  useEffect(() => {
    if (map && mode === "browse") fetchPlacesByBounds();
  }, [map, eventType, mode]);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "12px",
            background: "#0f172a",
            color: "#fff",
          }}
        >
          <input
            ref={inputRef}
            placeholder="Search location or venue"
            style={{ padding: "8px", borderRadius: "6px", border: "none" }}
          />

          <select onChange={(e) => setCity(e.target.value)}>
            <option value="">City</option>
            {cities.map((c, i) => (
              <option key={i}>{c}</option>
            ))}
          </select>

          <select onChange={(e) => setEventType(e.target.value)}>
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
          </select>

          <button onClick={() => setMode("browse")}>Browse</button>
          <button onClick={() => setMode("pin")}>Set Pin</button>
          <button onClick={getCurrentLocation}>📍</button>
        </div>

        {/* MAIN */}
        <div style={{ display: "flex" }}>
          {/* LEFT SIDE */}
          <div
            style={{
              width: "35%",
              height: "calc(100vh - 60px)",
              overflowY: "auto",
              padding: "10px",
              background: "#f8fafc",
            }}
          >
            {/* BROWSE */}
            {mode === "browse" &&
              places.map((place, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <h4>{place.name}</h4>
                  <p>{place.vicinity}</p>
                </div>
              ))}

            {/* PIN MODE */}
            {mode === "pin" && (
              <div>
                <h3>Selected Location 📍</h3>

                {pinnedLocation && (
                  <>
                    <p><b>Lat:</b> {pinnedLocation.lat}</p>
                    <p><b>Lng:</b> {pinnedLocation.lng}</p>

                    <p style={{ marginTop: "10px" }}>
                      <b>Address:</b>
                    </p>
                    <textarea
                      value={pinnedAddress}
                      readOnly
                      style={{
                        width: "100%",
                        height: "80px",
                        padding: "8px",
                      }}
                    />

                    <button
                      onClick={() => {
                        const data = {
                          lat: pinnedLocation.lat,
                          lng: pinnedLocation.lng,
                          address: pinnedAddress,
                        };

                        localStorage.setItem(
                          "selectedVenue",
                          JSON.stringify(data)
                        );

                        alert("Location Saved!");
                      }}
                      style={{
                        marginTop: "10px",
                        background: "green",
                        color: "#fff",
                        padding: "10px",
                        border: "none",
                        borderRadius: "6px",
                      }}
                    >
                      Save Location
                    </button>
                  </>
                )}

                {!pinnedLocation && <p>Click on map to select location</p>}
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
              onClick={(e) => {
                if (mode === "pin") {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();

                  setPinnedLocation({ lat, lng });
                  getAddressFromLatLng(lat, lng);
                }
              }}
              onIdle={fetchPlacesByBounds}
            >
              {/* Markers */}
              {mode === "browse" &&
                places.map((place, i) => (
                  <Marker
                    key={i}
                    position={{
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    }}
                  />
                ))}

              {/* Pin */}
              {mode === "pin" && pinnedLocation && (
                <Marker position={pinnedLocation} />
              )}
            </GoogleMap>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}