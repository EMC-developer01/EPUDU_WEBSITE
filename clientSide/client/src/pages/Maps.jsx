"use client";
// import React, { useEffect, useRef, useState } from "react";
// At the top, add useCallback and useRef
import React, { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
// ✅ No LoadScript import here

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

// ✅ Accept isLoaded as a prop
export default function VenueBookingSection({ isLoaded, onVenueSelect }) {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [eventType, setEventType] = useState("birthday"); // default to birthday
  const [city, setCity] = useState("");
  const [mode, setMode] = useState("browse");
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [pinnedAddress, setPinnedAddress] = useState("");
  const inputRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ Guard all google API calls with isLoaded
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



  // const fetchPlacesByBounds = () => {
  //   if (!map || !window.google || mode === "pin") return;
  //   const bounds = map.getBounds();
  //   if (!bounds) return;
  //   const service = new window.google.maps.places.PlacesService(map);
  //   service.nearbySearch(
  //     {
  //       location: map.getCenter(),
  //       radius: getRadiusFromBounds(bounds),
  //       keyword: eventKeywords[eventType],
  //     },
  //     (results, status) => {
  //       if (status === window.google.maps.places.PlacesServiceStatus.OK) {
  //         setPlaces(results);
  //       }
  //     }
  //   );
  // };

  // Replace your fetchPlacesByBounds with this debounced version
  const fetchTimerRef = useRef(null);

  const fetchPlacesByBounds = useCallback(() => {
    if (!map || !window.google || mode === "pin") return;

    // ✅ Clear any pending fetch — debounce by 600ms
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
            // ✅ Only update if results actually changed
            setPlaces((prev) => {
              const prevIds = prev.map((p) => p.place_id).join(",");
              const newIds = results.map((p) => p.place_id).join(",");

              if (prevIds === newIds) return prev;

              // ✅ Add default cost internally
              const updatedResults = results.map((place) => ({
                ...place,
                estimatedCost: 20000, // ₹20,000 default
              }));

              return updatedResults;
            });
          }
        }
      );
    }, 600); // wait 600ms after map stops moving
  }, [map, mode, eventType]);

  // ✅ Cleanup timer on unmount
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
  }, [isLoaded, map]); // ✅ depends on isLoaded

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
  }, [isLoaded, map, eventType, mode]); // ✅ depends on isLoaded
  const saveVenueData = (data) => {
    localStorage.setItem("selectedVenue", JSON.stringify(data));

    // ✅ This was broken before — onVenueSelect was never received as a prop
    if (onVenueSelect) {
      onVenueSelect(data);
    }
  };

  // ✅ Guard render — don't render map until loaded
  if (!isLoaded) return <div className="p-4 text-center text-gray-500">Loading map...</div>;

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minHeight: "400px",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      {/* TOP BAR */}
      <div style={{
        display: "flex",
        gap: "10px",
        padding: "12px",
        background: "#0f172a",
        color: "#fff",
        alignItems: "center",
        flexWrap: "wrap",   // ✅ stops bar from overflowing on small screens
        width: "100%",
        boxSizing: "border-box",
        height: "60px",
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          placeholder="Search location or venue"
          style={{ padding: "8px", width: "220px", borderRadius: "6px", border: "none", background: "#0f172a", color: "#fff", }}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: "8px", borderRadius: "6px", background: "#0f172a", color: "#fff", }}>
          <option value="">City</option>
          {cities.map((c, i) => <option key={i}>{c}</option>)}
        </select>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={{ padding: "8px", borderRadius: "6px", background: "#0f172a", color: "#fff", }}>
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

      {/* MAIN */}
      <div
        style={{
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          width: "100%",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            height: "100%",
            overflowY: "auto",
            padding: "10px",
            background: "#f8fafc",
            boxSizing: "border-box",
          }}
        >
          {mode === "browse" && places.map((place, i) => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const image = place.photos?.[0]?.getUrl({ maxWidth: 400 }) || "https://via.placeholder.com/200";

            return (
              <div
                key={i}
                onClick={() => {
                  setSelected(place);
                  setShowPopup(true);

                  const lat = place.geometry.location.lat();
                  const lng = place.geometry.location.lng();

                  map.panTo({ lat, lng });

                  const data = {
                    name: place.name,
                    address: place.vicinity,
                    city: city || "",
                    lat,
                    lng,
                    estimatedCost: place.estimatedCost || 20000,
                    image: place.photos?.[0]?.getUrl({ maxWidth: 400 }) || "",
                  };

                  saveVenueData(data);
                }}

                style={{ marginBottom: "10px", cursor: "pointer", minHeight: "180px" }}
              >
                <img src={image} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px", display: "block" }} />
                <h4 style={{ margin: "6px 0 2px" }}>{place.name}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>{place.vicinity}</p>
              </div>
            );
          })}

          {mode === "pin" && (
            <div>
              <h3>Selected Location 📍</h3>
              {pinnedLocation ? (
                <>
                  <p><b>Lat:</b> {pinnedLocation.lat}</p>
                  <p><b>Lng:</b> {pinnedLocation.lng}</p>
                  <p><b>Address:</b></p>
                  <textarea value={pinnedAddress} readOnly style={{ width: "100%", height: "80px", padding: "8px" }} />
                </>
              ) : (
                <p>Click on map to select location</p>
              )}
            </div>
          )}
        </div>

        {/* MAP — no LoadScript wrapper */}
        <div style={{
          flex: 1,
          // ✅ takes all remaining width
          height: "100%",
        }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={(m) => setMap(m)}
            onDragEnd={fetchPlacesByBounds}      // ✅ only after user drags
            onZoomChanged={fetchPlacesByBounds}
            // onIdle={fetchPlacesByBounds}
            onClick={(e) => {
              if (mode === "pin") {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();

                setPinnedLocation({ lat, lng });

                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                  let address = "Address not found";

                  if (status === "OK" && results[0]) {
                    address = results[0].formatted_address;
                    setPinnedAddress(address);
                  }

                  const data = {
                    name: "Custom Pinned Location",
                    address,
                    city: city || "",
                    lat,
                    lng,
                    estimatedCost: 0,
                  };

                  saveVenueData(data); // ✅ auto save instantly
                });
              }
            }}
          >
            {mode === "browse" && places.map((place, i) => (
              <Marker
                key={i}
                position={{ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }}
                onClick={() => setSelected(place)}
              />
            ))}
            {mode === "pin" && pinnedLocation && <Marker position={pinnedLocation} />}
          </GoogleMap>
        </div>
      </div>
      {
        showPopup && selected && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}>
            <div style={{
              width: "90%",
              maxWidth: "400px",
              background: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
            }}>

              {/* IMAGE */}
              <img
                src={selected.photos?.[0]?.getUrl({ maxWidth: 400 }) || "https://via.placeholder.com/400"}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />

              {/* DETAILS */}
              <div style={{ padding: "15px" }}>
                <h3>{selected.name}</h3>
                <p>{selected.vicinity}</p>
                <p><b>Estimated Cost:</b> ₹{selected.estimatedCost || 20000}</p>

                {/* BUTTONS */}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => {
                      // ✅ Build venue data from the selected place
                      const lat = selected.geometry.location.lat();
                      const lng = selected.geometry.location.lng();

                      const data = {
                        name: selected.name,
                        address: selected.vicinity,
                        city: city || "",
                        lat,
                        lng,
                        estimatedCost: selected.estimatedCost || 20000,
                        image: selected.photos?.[0]?.getUrl({ maxWidth: 400 }) || "",
                      };

                      // ✅ Save to localStorage AND call onVenueSelect → updates Birthday.jsx formData
                      saveVenueData(data);

                      setShowPopup(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                    }}
                  >
                    Book Now
                  </button>

                  <button
                    onClick={() => setShowPopup(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>

  );
}
