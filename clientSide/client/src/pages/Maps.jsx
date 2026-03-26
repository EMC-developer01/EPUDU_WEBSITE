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
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [eventType, setEventType] = useState("wedding");

  const [searchText, setSearchText] = useState("");
  const [city, setCity] = useState("");

  const inputRef = useRef(null);

  // 🔍 Fetch places
  const fetchPlaces = (location) => {
    if (!map || !window.google) return;

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
          setFilteredPlaces(results);
        }
      }
    );
  };

  // 🔎 Autocomplete (city/location search)
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

  // 📍 Current location
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

  // 🔄 Initial load
  useEffect(() => {
    if (map) fetchPlaces(center);
  }, [map, eventType]);

  // 🔍 Filter logic
  useEffect(() => {
    let filtered = places;

    if (searchText) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (city) {
      filtered = filtered.filter((p) =>
        p.vicinity?.toLowerCase().includes(city.toLowerCase())
      );
    }

    setFilteredPlaces(filtered);
  }, [searchText, city, places]);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div style={{ display: "flex", height: "100vh" }}>
        {/* LEFT SIDE */}
        <div
          style={{
            width: "35%",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid #ddd",
          }}
        >
          {/* FILTERS */}
          <div style={{ padding: "15px", borderBottom: "1px solid #ddd" }}>
            <h3>Filters</h3>

            {/* Event Type */}
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            >
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="corporate">Corporate</option>
              <option value="function">Function</option>
            </select>

            {/* City Search */}
            <input
              ref={inputRef}
              placeholder="Search city/location"
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />

            {/* Name Search */}
            <input
              placeholder="Search venue name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />

            {/* City Filter */}
            <input
              placeholder="Filter by city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />

            <button onClick={getCurrentLocation}>
              Use Current Location
            </button>
          </div>

          {/* VENUE LIST */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {filteredPlaces.map((place, i) => {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();

              const image =
                place.photos?.[0]?.getUrl({ maxWidth: 400 }) ||
                "https://via.placeholder.com/300";

              return (
                <div
                  key={i}
                  onClick={() => {
                    setSelected(place);
                    map.panTo({ lat, lng });
                  }}
                  style={{
                    border:
                      selected?.place_id === place.place_id
                        ? "2px solid blue"
                        : "1px solid #ccc",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    padding: "10px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={image}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />

                  <h4>{place.name}</h4>
                  <p>{place.vicinity}</p>
                  <p>⭐ {place.rating || "N/A"}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      localStorage.setItem(
                        "selectedVenue",
                        JSON.stringify(place)
                      );

                      alert("Venue Selected!");
                    }}
                  >
                    Book Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE (MAP) */}
        <div style={{ width: "65%" }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={(m) => setMap(m)}
            onIdle={() => {
              if (map) {
                const c = map.getCenter();
                fetchPlaces({ lat: c.lat(), lng: c.lng() });
              }
            }}
          >
            {filteredPlaces.map((place, i) => (
              <Marker
                key={i}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }}
                onClick={() => setSelected(place)}
              />
            ))}

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
    </LoadScript>
  );
}