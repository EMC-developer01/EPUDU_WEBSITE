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

  const inputRef = useRef(null);

  // 📏 Distance Calculation
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;

    return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(2);
  };

  // 🔍 Fetch venues
  const fetchPlaces = (location) => {
    if (!map || !window.google) return;

    const service = new window.google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location,
        radius: 5000,
        keyword: eventKeywords[eventType],
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        }
      }
    );
  };

  // 📍 Current Location
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

  // 🔄 Load on map ready
  useEffect(() => {
    if (map) fetchPlaces(center);
  }, [map, eventType]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div style={{ display: "flex" }}>
        {/* LEFT SIDE */}
        <div style={{ width: "70%" }}>
          {/* Controls */}
          <div style={{ padding: "10px", background: "#fff" }}>
            {/* Event Type */}
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{ padding: "10px", marginRight: "10px" }}
            >
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="corporate">Corporate</option>
              <option value="function">Function</option>
            </select>

            {/* Search */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search location..."
              style={{
                padding: "10px",
                width: "40%",
                marginRight: "10px",
              }}
            />

            {/* Current Location */}
            <button onClick={getCurrentLocation}>
              Use Current Location
            </button>
          </div>

          {/* Map */}
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={(mapInstance) => setMap(mapInstance)}
            onIdle={() => {
              if (map) {
                const c = map.getCenter();
                fetchPlaces({ lat: c.lat(), lng: c.lng() });
              }
            }}
            onClick={(e) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();

              const newLoc = { lat, lng };
              setCenter(newLoc);
              fetchPlaces(newLoc);
            }}
          >
            {/* Markers */}
            {places.map((place, i) => (
              <Marker
                key={i}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }}
                onClick={() => setSelected(place)}
              />
            ))}

            {/* InfoWindow */}
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
                  <p>⭐ {selected.rating || "N/A"}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            width: "30%",
            height: "100vh",
            overflowY: "auto",
            padding: "10px",
            borderLeft: "1px solid #ddd",
          }}
        >
          <h2>Venues</h2>

          {places.map((place, i) => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            const distance = getDistance(
              center.lat,
              center.lng,
              lat,
              lng
            );

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
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                <h4>{place.name}</h4>
                <p>{place.vicinity}</p>
                <p>⭐ {place.rating || "N/A"}</p>
                <p>📍 {distance} km away</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    const data = {
                      name: place.name,
                      address: place.vicinity,
                      lat,
                      lng,
                      placeId: place.place_id,
                      eventType,
                    };

                    localStorage.setItem(
                      "selectedVenue",
                      JSON.stringify(data)
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
    </LoadScript>
  );
}