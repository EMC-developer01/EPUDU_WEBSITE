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

  const inputRef = useRef(null);

  // 🔍 Fetch Places
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
    if (map) fetchPlaces(center);
  }, [map, eventType]);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div style={{ position: "relative" }}>
        {/* 🔝 TOP FILTER BAR */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: "10px",
            borderRadius: "10px",
            display: "flex",
            gap: "10px",
            zIndex: 10,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          {/* Search */}
          <input
            ref={inputRef}
            placeholder="Search location..."
            style={{ padding: "8px", width: "200px" }}
          />

          {/* City Filter */}
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ padding: "8px", width: "120px" }}
          />

          {/* Event Type */}
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

          {/* Current Location */}
          <button onClick={getCurrentLocation}>📍</button>
        </div>

        {/* 🗺 MAP */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={(m) => setMap(m)}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            const newLoc = { lat, lng };
            setCenter(newLoc);
            fetchPlaces(newLoc);
          }}
          onIdle={() => {
            if (map) {
              const c = map.getCenter();
              fetchPlaces({ lat: c.lat(), lng: c.lng() });
            }
          }}
        >
          {/* Markers */}
          {places
            .filter((p) =>
              city
                ? p.vicinity?.toLowerCase().includes(city.toLowerCase())
                : true
            )
            .map((place, i) => (
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
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* 🔽 BOTTOM VENUE LIST */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            display: "flex",
            overflowX: "auto",
            gap: "10px",
            padding: "10px",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          {places
            .filter((p) =>
              city
                ? p.vicinity?.toLowerCase().includes(city.toLowerCase())
                : true
            )
            .map((place, i) => {
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
                    minWidth: "220px",
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "10px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={image}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <h4>{place.name}</h4>
                  <p>{place.vicinity}</p>
                </div>
              );
            })}
        </div>
      </div>
    </LoadScript>
  );
}