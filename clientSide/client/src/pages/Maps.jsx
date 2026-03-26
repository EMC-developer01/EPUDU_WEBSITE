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

export default function VenueBookingSection() {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState(defaultCenter);

  const [eventType, setEventType] = useState("wedding");
  const [city, setCity] = useState("");
  const [searchText, setSearchText] = useState("");

  const [mode, setMode] = useState("browse"); // browse | pin
  const [pinnedLocation, setPinnedLocation] = useState(null);

  const inputRef = useRef(null);

  // 🔍 Fetch Places
  const fetchPlaces = (location) => {
    if (!map || !window.google || mode === "pin") return;

    const service = new window.google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location,
        radius: 8000,
        keyword: eventKeywords[eventType],
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        }
      }
    );
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

      const loc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setCenter(loc);
      map.panTo(loc);
      fetchPlaces(loc);
    });
  }, [map]);

  // 📍 Current Location
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setCenter(loc);
      map.panTo(loc);
      fetchPlaces(loc);
    });
  };

  // 🔄 Load
  useEffect(() => {
    if (map && mode === "browse") fetchPlaces(center);
  }, [map, eventType, mode]);

  // 🔍 Filtered list
  const filteredPlaces = places.filter((p) => {
    return (
      (!city ||
        p.vicinity?.toLowerCase().includes(city.toLowerCase())) &&
      (!searchText ||
        p.name.toLowerCase().includes(searchText.toLowerCase()))
    );
  });

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
            padding: "10px",
            background: "#fff",
            borderBottom: "1px solid #ddd",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <input
            ref={inputRef}
            placeholder="Search location"
            style={{ padding: "8px", width: "180px" }}
          />

          {/* Venue Search */}
          <input
            placeholder="Search venue"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ padding: "8px", width: "150px" }}
          />

          {/* City */}
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ padding: "8px", width: "120px" }}
          />

          {/* Event */}
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            style={{ padding: "8px" }}
          >
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="corporate">Corporate</option>
            <option value="function">Function</option>
          </select>

          {/* Mode Toggle */}
          <button
            onClick={() => setMode("browse")}
            style={{
              background: mode === "browse" ? "blue" : "#eee",
              color: mode === "browse" ? "#fff" : "#000",
              padding: "8px",
            }}
          >
            Browse Venues
          </button>

          <button
            onClick={() => setMode("pin")}
            style={{
              background: mode === "pin" ? "blue" : "#eee",
              color: mode === "pin" ? "#fff" : "#000",
              padding: "8px",
            }}
          >
            Set Pin
          </button>

          <button onClick={getCurrentLocation}>📍</button>
        </div>

        {/* MAIN */}
        <div style={{ display: "flex" }}>
          {/* LEFT LIST */}
          <div
            style={{
              width: "35%",
              height: "calc(100vh - 60px)",
              overflowY: "auto",
              borderRight: "1px solid #ddd",
            }}
          >
            {mode === "browse" &&
              filteredPlaces.map((place, i) => {
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
                      }}
                    />
                    <h4>{place.name}</h4>
                    <p>{place.vicinity}</p>
                  </div>
                );
              })}

            {mode === "pin" && (
              <div style={{ padding: "20px" }}>
                <h3>Click on map to set your venue location 📍</h3>
              </div>
            )}
          </div>

          {/* RIGHT MAP */}
          <div style={{ width: "65%" }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={(m) => setMap(m)}
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
              onIdle={() => {
                if (map && mode === "browse") {
                  const c = map.getCenter();
                  fetchPlaces({ lat: c.lat(), lng: c.lng() });
                }
              }}
            >
              {/* Browse markers */}
              {mode === "browse" &&
                filteredPlaces.map((place, i) => (
                  <Marker
                    key={i}
                    position={{
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    }}
                    onClick={() => setSelected(place)}
                  />
                ))}

              {/* Pin marker */}
              {mode === "pin" && pinnedLocation && (
                <Marker position={pinnedLocation} />
              )}

              {/* Info */}
              {selected && mode === "browse" && (
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