/**
 * VenueBookingSection.jsx
 *
 * Drop-in replacement for the existing venue section.
 * Wrap in:  <div className="flex flex-col lg:flex-row gap-6"> ... </div>
 *
 * Props:
 *   googleMapsApiKey  – your VITE_GOOGLE_MAPS_API_KEY (string)
 *   onVenueCostChange – callback(cost: number) so parent can add to total
 *   isLoaded          – boolean from useLoadScript (pass the same one you already have)
 *
 * The component is fully self-contained; copy it into your project.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const LIBRARIES = ["places"];

const PREFERRED_LOCATION_COST = 3000;

const MAP_DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 }; // Hyderabad

const EVENT_TYPES = ["Birthday Party", "Wedding", "Reception", "Corporate", "Anniversary", "Other"];

const VENUE_TYPES = [
  { label: "All", value: "" },
  { label: "Indoor", value: "banquet_hall" },
  { label: "Outdoor", value: "park" },
  { label: "Resort", value: "lodging" },
  { label: "Hotel", value: "hotel" },
];

const STAR_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "3★+", value: 3 },
  { label: "4★+", value: 4 },
  { label: "5★", value: 5 },
];

// Rough price-per-day estimates by Google price_level (0–4)
const PRICE_PER_DAY = {
  0: 8000,
  1: 15000,
  2: 35000,
  3: 75000,
  4: 150000,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const getPhotoUrl = (place, maxWidth = 400) => {
  if (place?.photos?.length) {
    return place.photos[0].getUrl({ maxWidth });
  }
  return "https://via.placeholder.com/400x300?text=No+Image";
};

const priceLabel = (level) => {
  const map = { 0: "Budget", 1: "Affordable", 2: "Moderate", 3: "Upscale", 4: "Luxury" };
  return map[level] ?? "N/A";
};

const starsDisplay = (rating) => {
  const full = Math.round(rating || 0);
  return "★".repeat(full) + "☆".repeat(5 - full);
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VenueBookingSection({
  googleMapsApiKey,
  onVenueCostChange,
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || "",
    libraries: LIBRARIES,
  });

  // Mode
  const [mode, setMode] = useState(""); // "" | "preferred" | "select"

  // ── Preferred Location state ──
  const [prefLocation, setPrefLocation] = useState(null); // { lat, lng, address }
  const [searchBoxRef, setSearchBoxRef] = useState(null);
  const [mapCenter, setMapCenter] = useState(MAP_DEFAULT_CENTER);
  const [pinMarker, setPinMarker] = useState(null);

  // ── Venue Select state ──
  const [venueSearch, setVenueSearch] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [venueType, setVenueType] = useState("");
  const [venueStars, setVenueStars] = useState(0);
  const [venueEventType, setVenueEventType] = useState("");
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [venueMapCenter, setVenueMapCenter] = useState(MAP_DEFAULT_CENTER);
  const [infoOpen, setInfoOpen] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // Booking options (for selected venue)
  const [bookingType, setBookingType] = useState("day"); // "hour" | "day"
  const [hours, setHours] = useState(4);
  const [days, setDays] = useState(1);

  // placesService ref
  const placesServiceRef = useRef(null);
  const mapRef = useRef(null);

  // ── Cost calculation ──
  const venueCost = (() => {
    if (mode === "preferred") return PREFERRED_LOCATION_COST;
    if (mode === "select" && selectedPlace) {
      const priceLevel = selectedPlace.price_level ?? 1;
      const baseDay = PRICE_PER_DAY[priceLevel] ?? 15000;
      if (bookingType === "day") return baseDay * days;
      return Math.round((baseDay / 8) * hours);
    }
    return 0;
  })();

  // Notify parent whenever cost changes
  useEffect(() => {
    onVenueCostChange?.(venueCost);
  }, [venueCost]);

  // ── Map load callback ──
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    }
  }, []);

  // ── Fetch venues from Google Places ──
  const fetchVenues = useCallback(() => {
    if (!placesServiceRef.current) return;
    setLoadingPlaces(true);

    const query = [
      venueSearch || "event venue",
      venueCity,
      venueEventType,
    ]
      .filter(Boolean)
      .join(" ");

    const request = {
      query,
      type: venueType || undefined,
      location: venueMapCenter,
      radius: 20000,
    };

    placesServiceRef.current.textSearch(request, (results, status) => {
      setLoadingPlaces(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        let filtered = results;
        if (venueStars > 0) {
          filtered = results.filter((p) => (p.rating || 0) >= venueStars);
        }
        setPlaces(filtered.slice(0, 20));
        if (filtered[0]?.geometry?.location) {
          setVenueMapCenter({
            lat: filtered[0].geometry.location.lat(),
            lng: filtered[0].geometry.location.lng(),
          });
        }
      } else {
        setPlaces([]);
      }
    });
  }, [venueSearch, venueCity, venueType, venueStars, venueEventType, venueMapCenter]);

  // Auto-fetch when filters change (debounced)
  useEffect(() => {
    if (mode !== "select" || !isLoaded) return;
    const t = setTimeout(fetchVenues, 600);
    return () => clearTimeout(t);
  }, [venueSearch, venueCity, venueType, venueStars, venueEventType, mode, isLoaded]);

  // ── Preferred location: map click to pin ──
  const handleMapClick = (e) => {
    if (mode !== "preferred") return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPinMarker({ lat, lng });
    setMapCenter({ lat, lng });

    // Reverse geocode
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setPrefLocation({ lat, lng, address: results[0].formatted_address });
      } else {
        setPrefLocation({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      }
    });
  };

  // ── SearchBox (preferred) ──
  const onSBLoad = (ref) => setSearchBoxRef(ref);
  const onSBPlacesChanged = () => {
    if (!searchBoxRef) return;
    const results = searchBoxRef.getPlaces();
    if (results?.length) {
      const p = results[0];
      const lat = p.geometry.location.lat();
      const lng = p.geometry.location.lng();
      setPinMarker({ lat, lng });
      setMapCenter({ lat, lng });
      setPrefLocation({ lat, lng, address: p.formatted_address });
    }
  };

  if (loadError) {
    return (
      <div className="w-full text-center text-red-500 py-10 font-semibold">
        ❌ Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full text-center py-10 text-gray-400 animate-pulse">
        Loading maps…
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ─── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="lg:w-1/2 flex flex-col gap-5">

        {/* ── Mode selector ── */}
        <div
          style={{
            background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.1rem",
              color: "#e2b96f",
              marginBottom: "16px",
              letterSpacing: "0.5px",
            }}
          >
            How would you like to set the venue?
          </p>
          <div className="flex gap-4 flex-wrap">
            {[
              {
                key: "preferred",
                icon: "📍",
                title: "My Preferred Location",
                desc: "Pin any location on the map",
                cost: "₹3,000 flat fee",
              },
              {
                key: "select",
                icon: "🏛️",
                title: "Browse Venues",
                desc: "Search venues via Google Maps",
                cost: "Venue pricing applies",
              },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setMode(opt.key);
                  setSelectedPlace(null);
                  setPrefLocation(null);
                  setPinMarker(null);
                }}
                style={{
                  flex: "1 1 180px",
                  padding: "16px",
                  borderRadius: "12px",
                  border: `2px solid ${mode === opt.key ? "#e2b96f" : "rgba(255,255,255,0.1)"}`,
                  background:
                    mode === opt.key
                      ? "rgba(226,185,111,0.15)"
                      : "rgba(255,255,255,0.04)",
                  color: "#fff",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  boxShadow:
                    mode === opt.key ? "0 0 0 1px #e2b96f40" : "none",
                }}
              >
                <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>{opt.icon}</div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: mode === opt.key ? "#e2b96f" : "#fff",
                    marginBottom: "4px",
                  }}
                >
                  {opt.title}
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginBottom: "6px" }}>
                  {opt.desc}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#e2b96f",
                    background: "rgba(226,185,111,0.1)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    display: "inline-block",
                  }}
                >
                  {opt.cost}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Preferred Location panel ── */}
        {mode === "preferred" && (
          <div
            style={{
              border: "1.5px solid #e5e7eb",
              borderRadius: "14px",
              padding: "20px",
              background: "#fafafa",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "12px",
                color: "#1a1a2e",
              }}
            >
              📍 Search or pin your location
            </p>

            <StandaloneSearchBox onLoad={onSBLoad} onPlacesChanged={onSBPlacesChanged}>
              <input
                type="text"
                placeholder="Search address, landmark, city…"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #d1d5db",
                  fontSize: "0.9rem",
                  marginBottom: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </StandaloneSearchBox>

            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "10px" }}>
              Or click anywhere on the map to drop a pin
            </p>

            {prefLocation && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  color: "#166534",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span>✅</span>
                <div>
                  <strong>Pinned:</strong> {prefLocation.address}
                  <br />
                  <span style={{ color: "#4b5563" }}>
                    Lat: {prefLocation.lat.toFixed(5)}, Lng: {prefLocation.lng.toFixed(5)}
                  </span>
                </div>
              </div>
            )}

            {/* Cost card */}
            <CostCard
              label="Preferred Location Fee"
              amount={PREFERRED_LOCATION_COST}
              note="Flat service charge for client-chosen locations"
            />
          </div>
        )}

        {/* ── Venue Browse filters ── */}
        {mode === "select" && (
          <div
            style={{
              border: "1.5px solid #e5e7eb",
              borderRadius: "14px",
              padding: "20px",
              background: "#fafafa",
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "14px",
                color: "#1a1a2e",
              }}
            >
              🔍 Find the perfect venue
            </p>

            {/* Search */}
            <input
              type="text"
              placeholder="e.g. wedding hall, birthday venue, resort…"
              value={venueSearch}
              onChange={(e) => setVenueSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #d1d5db",
                fontSize: "0.9rem",
                marginBottom: "12px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {/* Filters row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
              {/* City */}
              <select
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                style={selectStyle}
              >
                <option value="">All Cities</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
                <option value="Delhi">Delhi</option>
              </select>

              {/* Type */}
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                style={selectStyle}
              >
                {VENUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Stars */}
              <select
                value={venueStars}
                onChange={(e) => setVenueStars(Number(e.target.value))}
                style={selectStyle}
              >
                {STAR_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {/* Event type */}
              <select
                value={venueEventType}
                onChange={(e) => setVenueEventType(e.target.value)}
                style={selectStyle}
              >
                <option value="">Any Event</option>
                {EVENT_TYPES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Results list */}
            <div
              style={{
                maxHeight: "340px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                paddingRight: "4px",
              }}
            >
              {loadingPlaces && (
                <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
                  Searching venues…
                </p>
              )}
              {!loadingPlaces && places.length === 0 && (
                <p style={{ color: "#9ca3af", fontSize: "0.85rem", textAlign: "center", padding: "20px 0" }}>
                  No venues found. Try adjusting filters.
                </p>
              )}
              {places.map((place) => (
                <PlaceCard
                  key={place.place_id}
                  place={place}
                  isSelected={selectedPlace?.place_id === place.place_id}
                  onClick={() => {
                    setSelectedPlace(place);
                    setInfoOpen(true);
                    const loc = place.geometry?.location;
                    if (loc) {
                      setVenueMapCenter({ lat: loc.lat(), lng: loc.lng() });
                    }
                  }}
                />
              ))}
            </div>

            {/* Booking options + cost – shown when venue selected */}
            {selectedPlace && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "10px",
                    padding: "14px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "12px",
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "10px", color: "#1a1a2e" }}>
                    ⏱ Booking Duration
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    {["hour", "day"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setBookingType(t)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: `1.5px solid ${bookingType === t ? "#0f3460" : "#d1d5db"}`,
                          background: bookingType === t ? "#0f3460" : "#fff",
                          color: bookingType === t ? "#fff" : "#374151",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          textTransform: "capitalize",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {t === "hour" ? "Hourly" : "Full Day"}
                      </button>
                    ))}
                  </div>

                  {bookingType === "hour" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <label style={{ fontSize: "0.85rem", color: "#4b5563", minWidth: "60px" }}>
                        Hours:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={hours}
                        onChange={(e) => setHours(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: "70px",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1.5px solid #d1d5db",
                          fontSize: "0.9rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  )}

                  {bookingType === "day" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <label style={{ fontSize: "0.85rem", color: "#4b5563", minWidth: "60px" }}>
                        Days:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={days}
                        onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: "70px",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1.5px solid #d1d5db",
                          fontSize: "0.9rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  )}
                </div>

                <CostCard
                  label={`${selectedPlace.name} — ${bookingType === "hour" ? `${hours} hr${hours > 1 ? "s" : ""}` : `${days} day${days > 1 ? "s" : ""}`}`}
                  amount={venueCost}
                  note={`Based on venue price tier: ${priceLabel(selectedPlace.price_level ?? 1)}`}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── RIGHT PANEL — MAP ──────────────────────────────────── */}
      <div className="lg:w-1/2">
        <GoogleMap
          zoom={mode === "preferred" && pinMarker ? 15 : 12}
          center={mode === "preferred" ? mapCenter : venueMapCenter}
          mapContainerStyle={{
            width: "100%",
            height: "520px",
            borderRadius: "14px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
          onLoad={onMapLoad}
          onClick={mode === "preferred" ? handleMapClick : undefined}
          options={{
            styles: darkMapStyle,
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          {/* Preferred pin */}
          {mode === "preferred" && pinMarker && (
            <Marker
              position={pinMarker}
              icon={{
                url:
                  "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'><path fill='%23e2b96f' d='M18 0C8.06 0 0 8.06 0 18c0 12 18 30 18 30S36 30 36 18C36 8.06 27.94 0 18 0z'/><circle fill='%23fff' cx='18' cy='18' r='8'/></svg>`),
                scaledSize: new window.google.maps.Size(36, 48),
                anchor: new window.google.maps.Point(18, 48),
              }}
            />
          )}

          {/* Venue markers */}
          {mode === "select" &&
            places.map((place) => {
              const loc = place.geometry?.location;
              if (!loc) return null;
              const isSelected = selectedPlace?.place_id === place.place_id;
              return (
                <Marker
                  key={place.place_id}
                  position={{ lat: loc.lat(), lng: loc.lng() }}
                  onClick={() => {
                    setSelectedPlace(place);
                    setInfoOpen(true);
                    setVenueMapCenter({ lat: loc.lat(), lng: loc.lng() });
                  }}
                  icon={{
                    url:
                      "data:image/svg+xml;charset=UTF-8," +
                      encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='48' viewBox='0 0 36 48'><path fill='${isSelected ? "#e2b96f" : "#0f3460"}' d='M18 0C8.06 0 0 8.06 0 18c0 12 18 30 18 30S36 30 36 18C36 8.06 27.94 0 18 0z'/><circle fill='%23fff' cx='18' cy='18' r='8'/></svg>`
                      ),
                    scaledSize: new window.google.maps.Size(isSelected ? 44 : 32, isSelected ? 58 : 44),
                    anchor: new window.google.maps.Point(isSelected ? 22 : 16, isSelected ? 58 : 44),
                  }}
                />
              );
            })}

          {/* InfoWindow for selected venue */}
          {mode === "select" && selectedPlace && infoOpen && selectedPlace.geometry?.location && (
            <InfoWindow
              position={{
                lat: selectedPlace.geometry.location.lat(),
                lng: selectedPlace.geometry.location.lng(),
              }}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div style={{ maxWidth: "220px", fontFamily: "sans-serif" }}>
                <img
                  src={getPhotoUrl(selectedPlace, 300)}
                  alt={selectedPlace.name}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    marginBottom: "8px",
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "4px" }}>
                  {selectedPlace.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563", marginBottom: "4px" }}>
                  {selectedPlace.formatted_address || selectedPlace.vicinity}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ color: "#f59e0b" }}>
                    {starsDisplay(selectedPlace.rating)} {selectedPlace.rating?.toFixed(1)}
                  </span>
                  <span style={{ color: "#0f3460", fontWeight: 700 }}>
                    {priceLabel(selectedPlace.price_level ?? 1)}
                  </span>
                </div>
                <div style={{ marginTop: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#0f3460" }}>
                  Est. ₹{(PRICE_PER_DAY[selectedPlace.price_level ?? 1] || 15000).toLocaleString("en-IN")} / day
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Instruction overlay when no mode */}
          {mode === "" && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(15,52,96,0.85)",
                color: "#fff",
                padding: "16px 24px",
                borderRadius: "12px",
                textAlign: "center",
                backdropFilter: "blur(6px)",
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🗺️</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem" }}>
                Select a venue option to get started
              </div>
            </div>
          )}

          {/* Preferred location instruction */}
          {mode === "preferred" && !pinMarker && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(226,185,111,0.95)",
                color: "#1a1a2e",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.82rem",
                fontWeight: 600,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
              }}
            >
              📍 Click on the map to pin your location
            </div>
          )}
        </GoogleMap>

        {/* Quick info bar below map */}
        {mode === "select" && selectedPlace && (
          <div
            style={{
              marginTop: "10px",
              background: "linear-gradient(135deg,#1a1a2e,#0f3460)",
              borderRadius: "10px",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <div style={{ color: "#e2b96f", fontWeight: 700, fontSize: "0.9rem" }}>
                {selectedPlace.name}
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>
                {selectedPlace.formatted_address || selectedPlace.vicinity}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#f59e0b", fontSize: "0.85rem" }}>
                {starsDisplay(selectedPlace.rating)} {selectedPlace.rating?.toFixed(1)}
              </div>
              <div style={{ color: "#e2b96f", fontWeight: 700, fontSize: "0.9rem" }}>
                ₹{venueCost.toLocaleString("en-IN")} total
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlaceCard({ place, isSelected, onClick }) {
  const photoUrl = getPhotoUrl(place, 300);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px",
        borderRadius: "10px",
        border: `1.5px solid ${isSelected ? "#0f3460" : "#e5e7eb"}`,
        background: isSelected ? "#eff6ff" : "#fff",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isSelected ? "0 0 0 2px #0f346030" : "none",
      }}
    >
      <img
        src={photoUrl}
        alt={place.name}
        style={{
          width: "80px",
          height: "72px",
          objectFit: "cover",
          borderRadius: "8px",
          flexShrink: 0,
        }}
        onError={(e) => { e.target.src = "https://via.placeholder.com/80x72?text=Venue"; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.88rem",
            color: "#1a1a2e",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: "3px",
          }}
        >
          {place.name}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: "5px",
          }}
        >
          {place.formatted_address || place.vicinity}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#f59e0b", fontSize: "0.78rem" }}>
            {starsDisplay(place.rating)} {place.rating?.toFixed(1) || "N/A"}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              background: "#f1f5f9",
              padding: "2px 7px",
              borderRadius: "4px",
              color: "#475569",
              fontWeight: 600,
            }}
          >
            {priceLabel(place.price_level ?? 1)}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              background: "#ecfdf5",
              color: "#065f46",
              padding: "2px 7px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            ₹{(PRICE_PER_DAY[place.price_level ?? 1] || 15000).toLocaleString("en-IN")}/day
          </span>
        </div>
      </div>
    </div>
  );
}

function CostCard({ label, amount, note }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#1a1a2e 0%,#0f3460 100%)",
        borderRadius: "10px",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div>
        <div style={{ color: "#e2b96f", fontWeight: 700, fontSize: "0.88rem", marginBottom: "3px" }}>
          {label}
        </div>
        {note && (
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>{note}</div>
        )}
      </div>
      <div
        style={{
          color: "#fff",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "1.3rem",
          whiteSpace: "nowrap",
        }}
      >
        ₹{amount.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const selectStyle = {
  padding: "7px 10px",
  borderRadius: "8px",
  border: "1.5px solid #d1d5db",
  fontSize: "0.82rem",
  background: "#fff",
  color: "#374151",
  outline: "none",
  cursor: "pointer",
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];