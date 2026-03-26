"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

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
  const [center, setCenter] = useState({
    lat: 17.385044,
    lng: 78.486671,
  });
  const [eventType, setEventType] = useState("wedding");

  const inputRef = useRef(null);

  // 📏 Distance
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

  // 📡 Fetch venues
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
          setPlaces(results.slice(0, 30));
        }
      }
    );
  };

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
      const newCenter = { lat: loc.lat(), lng: loc.lng() };

      setCenter(newCenter);
      map.panTo(newCenter);
      fetchPlaces(newCenter);
    });
  }, [map]);

  // Initial load
  useEffect(() => {
    if (map) fetchPlaces(center);
  }, [map, eventType]);

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="h-screen w-screen flex overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-full md:w-[40%] h-full flex flex-col bg-white border-r">

          {/* 🔥 FILTERS */}
          <div className="p-4 border-b sticky top-0 bg-white z-10 space-y-3">

            {/* Event */}
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="corporate">Corporate</option>
              <option value="function">Function</option>
            </select>

            {/* Search */}
            <input
              ref={inputRef}
              placeholder="Search city / area / venue..."
              className="w-full p-2 border rounded"
            />

            {/* Current location */}
            <button
              onClick={getCurrentLocation}
              className="w-full p-2 bg-black text-white rounded"
            >
              Use Current Location
            </button>
          </div>

          {/* 📋 LIST */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {places.map((place) => {
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
                  key={place.place_id}
                  onClick={() => {
                    setSelected(place);
                    map.panTo({ lat, lng });
                  }}
                  className={`border rounded-xl p-3 cursor-pointer transition ${selected?.place_id === place.place_id
                      ? "border-blue-500 shadow"
                      : "hover:shadow"
                    }`}
                >
                  <img
                    src={image}
                    className="w-full h-40 object-cover rounded-lg"
                  />

                  <h3 className="font-semibold mt-2">{place.name}</h3>
                  <p className="text-sm text-gray-500">
                    {place.vicinity}
                  </p>
                  <p>⭐ {place.rating || "N/A"}</p>
                  <p className="text-sm">📍 {distance} km away</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      localStorage.setItem(
                        "selectedVenue",
                        JSON.stringify({
                          name: place.name,
                          address: place.vicinity,
                          lat,
                          lng,
                          placeId: place.place_id,
                          eventType,
                        })
                      );

                      alert("Venue Selected!");
                    }}
                    className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
                  >
                    Book Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL - MAP */}
        <div className="w-full md:w-[60%] h-full">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
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
            {places.map((place) => (
              <Marker
                key={place.place_id}
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
                  <p>⭐ {selected.rating || "N/A"}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </LoadScript>
  );
}