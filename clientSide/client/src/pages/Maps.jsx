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

export default function VenueBookingSection() {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const inputRef = useRef(null);

  // 🔍 Fetch venues
  const fetchPlaces = (location, keyword = "wedding hall") => {
    if (!map || !window.google) return;

    const service = new window.google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location,
        radius: 5000,
        keyword,
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        }
      }
    );
  };

  // 📍 Current location
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const loc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCenter(loc);
      map.panTo(loc);
      fetchPlaces(loc);
    });
  };

  // 🔎 Autocomplete
  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const loc = place.geometry.location;
      const newCenter = {
        lat: loc.lat(),
        lng: loc.lng(),
      };

      setCenter(newCenter);
      map.panTo(newCenter);
      fetchPlaces(newCenter);
    });
  }, [map]);

  // 📌 Initial load
  useEffect(() => {
    if (map) fetchPlaces(center);
  }, [map]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div style={{ display: "flex" }}>
        {/* LEFT: MAP */}
        <div style={{ width: "70%" }}>
          {/* Search + Location */}
          <div style={{ padding: "10px", background: "#fff", zIndex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search location or venue..."
              style={{
                width: "60%",
                padding: "10px",
                marginRight: "10px",
              }}
            />
            <button onClick={getCurrentLocation}>Use Current Location</button>
          </div>

          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={(mapInstance) => setMap(mapInstance)}
          >
            {/* Markers */}
            {places.map((place, index) => (
              <Marker
                key={index}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }}
                onClick={() => setSelected(place)}
              />
            ))}

            {/* Info Window */}
            {selected && (
              <InfoWindow
                position={{
                  lat: selected.geometry.location.lat(),
                  lng: selected.geometry.location.lng(),
                }}
                onCloseClick={() => setSelected(null)}
              >
                <div>
                  <h3>{selected.name}</h3>
                  <p>{selected.vicinity}</p>
                  <p>⭐ {selected.rating || "N/A"}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* RIGHT: DETAILS PANEL */}
        <div
          style={{
            width: "30%",
            padding: "15px",
            overflowY: "auto",
            height: "100vh",
            borderLeft: "1px solid #ddd",
          }}
        >
          <h2>Venues</h2>

          {places.map((place, index) => (
            <div
              key={index}
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelected(place);
                map.panTo({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                });
              }}
            >
              <h4>{place.name}</h4>
              <p>{place.vicinity}</p>
              <p>⭐ {place.rating || "N/A"}</p>
              <button style={{ marginTop: "5px" }}>Book Now</button>
            </div>
          ))}
        </div>
      </div>
    </LoadScript>
  );
}