/**
 * VenueBookingSection.jsx — Google Maps "Restaurants" style
 *
 * Usage inside Birthday.jsx:
 *   <div className="flex flex-col lg:flex-row gap-6">
 *     <VenueBookingSection
 *       googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
 *       onVenueCostChange={(cost) => { ... }}
 *     />
 *   </div>
 *
 * Requires:  @react-google-maps/api   (already in your project)
 * APIs needed: Maps JavaScript API, Places API (New), Geocoding API
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap, useLoadScript, OverlayView, StandaloneSearchBox,
} from "@react-google-maps/api";

const LIBRARIES   = ["places"];
const PREF_COST   = 3000;
const DEFAULT_CTR = { lat: 17.385, lng: 78.4867 };

const PRICE_PER_DAY = { 0: 8000, 1: 15000, 2: 35000, 3: 75000, 4: 150000 };
const RUPEE_SIGN    = ["", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];
const PRICE_LABELS  = ["Free", "Budget", "Moderate", "Upscale", "Luxury"];

const CATEGORIES = [
  { id: "all",       label: "All Venues", icon: "🏛️", query: "event venue hall" },
  { id: "birthday",  label: "Birthday",   icon: "🎂", query: "birthday party venue hall" },
  { id: "wedding",   label: "Wedding",    icon: "💍", query: "wedding banquet hall" },
  { id: "outdoor",   label: "Outdoor",    icon: "🌿", query: "outdoor event garden venue" },
  { id: "resort",    label: "Resorts",    icon: "🏨", query: "resort event venue" },
  { id: "corporate", label: "Corporate",  icon: "💼", query: "corporate event conference hall" },
  { id: "rooftop",   label: "Rooftop",    icon: "🌆", query: "rooftop party venue terrace" },
];

const CITIES = [
  { label: "Hyderabad", center: { lat: 17.385,  lng: 78.4867 } },
  { label: "Bangalore", center: { lat: 12.9716, lng: 77.5946 } },
  { label: "Mumbai",    center: { lat: 19.076,  lng: 72.8777 } },
  { label: "Chennai",   center: { lat: 13.0827, lng: 80.2707 } },
  { label: "Delhi",     center: { lat: 28.7041, lng: 77.1025 } },
  { label: "Pune",      center: { lat: 18.5204, lng: 73.8567 } },
];

const STAR_FILTERS = [
  { label: "Any",  min: 0   },
  { label: "3.0+", min: 3.0 },
  { label: "4.0+", min: 4.0 },
  { label: "4.5+", min: 4.5 },
];

const parsePriceLevel = (pl) => {
  if (typeof pl === "number") return pl;
  return {
    PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }[pl] ?? 1;
};

const getPhotoUrl = (p, w = 500) => {
  try {
    if (p?._photo?.getURI)       return p._photo.getURI({ maxWidth: w });
    if (p?.photos?.[0]?.getUrl)  return p.photos[0].getUrl({ maxWidth: w });
  } catch (_) {}
  return `https://source.unsplash.com/500x320/?event,venue,hall&sig=${p?.place_id}`;
};

const fmtINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

const ratingBar = (r) => {
  if (!r) return null;
  const pct = ((r - 1) / 4) * 100;
  const color = r >= 4 ? "#1a7340" : r >= 3 ? "#e67e22" : "#c0392b";
  return (
    <span style={{
      background: color, color: "#fff",
      fontSize: "11px", fontWeight: 700,
      padding: "2px 7px", borderRadius: "4px",
      letterSpacing: "0.2px",
    }}>
      {r.toFixed(1)} ★
    </span>
  );
};

/* ── Map Pin ─────────────────────────────────────────────────────────────── */
// States:
//   isSelected → large gold bubble (only one at a time)
//   isHovered  → dark fill, slightly enlarged
//   isDimmed   → faded to 0.18 opacity (another pin is selected)
//   default    → white bubble, dark border, full opacity — ALL pins visible
function MapPin({ place, isSelected, isHovered, isDimmed, onClick }) {
  const pl    = parsePriceLevel(place.price_level);
  const label = RUPEE_SIGN[pl] || "₹";

  const bg     = isSelected ? "#e2b96f" : isHovered ? "#1a1a2e" : "#fff";
  const fg     = isSelected ? "#1a1a2e" : isHovered ? "#e2b96f" : "#1a1a2e";
  const border = isSelected ? "#1a1a2e" : isHovered ? "#e2b96f" : "#1a1a2e";

  const scale  = isSelected ? 1.4 : isHovered ? 1.15 : 1;
  const yShift = isSelected ? -6  : isHovered ? -3   : 0;

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        userSelect: "none",
        position: "relative",
        transform: `scale(${scale}) translateY(${yShift}px)`,
        transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease",
        transformOrigin: "bottom center",
        opacity: isDimmed ? 0.18 : 1,
        zIndex: isSelected ? 100 : isHovered ? 50 : 1,
      }}
    >
      {/* Pulse ring — only when selected */}
      {isSelected && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: "46px", height: "30px",
          borderRadius: "15px",
          border: "2.5px solid rgba(226,185,111,0.55)",
          pointerEvents: "none",
          animation: "pinPulse 1.8s ease-out infinite",
        }}/>
      )}
      {/* Bubble */}
      <div style={{
        background: bg,
        color: fg,
        border: `2.5px solid ${border}`,
        borderRadius: "18px",
        padding: "5px 11px",
        fontSize: "11px",
        fontWeight: 800,
        whiteSpace: "nowrap",
        lineHeight: 1,
        boxShadow: isSelected
          ? "0 8px 24px rgba(226,185,111,0.6)"
          : isHovered
            ? "0 4px 14px rgba(26,26,46,0.28)"
            : "0 2px 8px rgba(0,0,0,0.22)",
      }}>
        {label}
      </div>
      {/* Tail */}
      <div style={{
        width: 0, height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: `7px solid ${border}`,
        margin: "0 auto",
        marginTop: "-1px",
      }}/>
    </div>
  );
}

/* ── Venue List Card ─────────────────────────────────────────────────────── */
function VenueCard({ place, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave }) {
  const pl = parsePriceLevel(place.price_level);
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex", gap: 0, flexShrink: 0,
        borderRadius: "10px", overflow: "hidden",
        border: `1.5px solid ${isSelected ? "#1a1a2e" : isHovered ? "#94a3b8" : "#e5e7eb"}`,
        cursor: "pointer",
        background: isSelected ? "#f8fafc" : "#fff",
        boxShadow: isSelected
          ? "0 4px 18px rgba(26,26,46,0.13)"
          : isHovered ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
        transition: "all 0.15s ease",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={getPhotoUrl(place, 300)}
          alt={place.name}
          style={{ width: "108px", height: "108px", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.src = `https://source.unsplash.com/300x300/?venue&sig=${place.place_id}`; }}
        />
        {isSelected && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            background: "#1a1a2e", color: "#e2b96f",
            borderRadius: "50%", width: 20, height: 20,
            fontSize: "11px", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✓</div>
        )}
      </div>

      {/* Details */}
      <div style={{
        padding: "10px 12px", flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{
          fontSize: "13px", fontWeight: 700, color: "#1a1a2e",
          lineHeight: 1.35, marginBottom: "4px",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{place.name}</div>

        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px", flexWrap: "wrap" }}>
          {ratingBar(place.rating)}
          {place.user_ratings_total && (
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              ({place.user_ratings_total.toLocaleString("en-IN")})
            </span>
          )}
          {place.opening_hours && (
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "1px 5px", borderRadius: "5px",
              color: place.opening_hours.isOpen?.() ? "#065f46" : "#991b1b",
              background: place.opening_hours.isOpen?.() ? "#ecfdf5" : "#fef2f2",
            }}>
              {place.opening_hours.isOpen?.() ? "Open" : "Closed"}
            </span>
          )}
        </div>

        <div style={{
          fontSize: "11px", color: "#6b7280",
          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          marginBottom: "5px",
        }}>{place.formatted_address || place.vicinity}</div>

        <div style={{ fontSize: "11px", color: "#374151", fontWeight: 700 }}>
          {RUPEE_SIGN[pl] || "₹"} · {fmtINR(PRICE_PER_DAY[pl] ?? 15000)}/day
        </div>
      </div>
    </div>
  );
}

/* ── Detail Side Panel ───────────────────────────────────────────────────── */
function DetailPanel({ place, onClose, onBook, bookingType, setBookingType,
                       hours, setHours, days, setDays }) {
  if (!place) return null;
  const pl      = parsePriceLevel(place.price_level);
  const dayRate = PRICE_PER_DAY[pl] ?? 15000;
  const cost    = bookingType === "day"
    ? dayRate * days
    : Math.round((dayRate / 8) * hours);

  return (
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: "clamp(270px,38%,370px)", height: "100%",
      background: "#fff",
      boxShadow: "-6px 0 28px rgba(0,0,0,0.14)",
      zIndex: 20, display: "flex", flexDirection: "column",
      overflow: "hidden", borderRadius: "0 0 14px 0",
    }}>
      {/* Hero */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={getPhotoUrl(place, 800)}
          alt={place.name}
          style={{ width: "100%", height: "175px", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.src = `https://source.unsplash.com/800x400/?venue&sig=${place.place_id}`; }}
        />
        <button onClick={onClose} style={{
          position: "absolute", top: 10, left: 10,
          background: "rgba(0,0,0,0.55)", border: "none",
          borderRadius: "50%", width: 30, height: 30,
          color: "#fff", fontSize: "17px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>‹</button>
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: "rgba(0,0,0,0.62)", color: "#fff",
          padding: "3px 10px", borderRadius: "10px",
          fontSize: "11px", fontWeight: 700,
        }}>{RUPEE_SIGN[pl] || "₹"} · {PRICE_LABELS[pl]}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        <h3 style={{ margin: "0 0 5px", fontSize: "15px", fontWeight: 800, color: "#1a1a2e" }}>
          {place.name}
        </h3>

        {/* Rating */}
        {place.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            {ratingBar(place.rating)}
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {place.user_ratings_total
                ? `${place.user_ratings_total.toLocaleString("en-IN")} reviews`
                : ""}
            </span>
          </div>
        )}

        {/* Address */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", flexShrink: 0 }}>📍</span>
          <span style={{ fontSize: "11px", color: "#4b5563", lineHeight: 1.55 }}>
            {place.formatted_address || place.vicinity}
          </span>
        </div>

        {/* Open status */}
        {place.opening_hours && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "3px 10px", borderRadius: "10px", marginBottom: "12px",
            background: place.opening_hours.isOpen?.() ? "#ecfdf5" : "#fef2f2",
            color: place.opening_hours.isOpen?.() ? "#065f46" : "#991b1b",
            fontSize: "11px", fontWeight: 700,
          }}>
            <span style={{ fontSize: "7px" }}>●</span>
            {place.opening_hours.isOpen?.() ? "Open now" : "Closed now"}
          </div>
        )}

        <div style={{ borderTop: "1px solid #f1f5f9", margin: "0 0 12px" }}/>

        {/* Booking type */}
        <p style={{
          fontSize: "11px", fontWeight: 700, color: "#374151",
          marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px",
        }}>Booking Duration</p>

        <div style={{ display: "flex", gap: "7px", marginBottom: "10px" }}>
          {["hour", "day"].map((t) => (
            <button key={t} onClick={() => setBookingType(t)} style={{
              flex: 1, padding: "8px", borderRadius: "8px",
              border: `2px solid ${bookingType === t ? "#1a1a2e" : "#e5e7eb"}`,
              background: bookingType === t ? "#1a1a2e" : "#fff",
              color: bookingType === t ? "#e2b96f" : "#6b7280",
              fontWeight: 700, fontSize: "12px", cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {t === "hour" ? "⏱ Hourly" : "📅 Full Day"}
            </button>
          ))}
        </div>

        {/* Hours / Days selector */}
        {bookingType === "hour" && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {[2, 4, 6, 8, 12].map((h) => (
              <button key={h} onClick={() => setHours(h)} style={{
                padding: "5px 10px", borderRadius: "6px",
                border: `1.5px solid ${hours === h ? "#1a1a2e" : "#e5e7eb"}`,
                background: hours === h ? "#1a1a2e" : "#fff",
                color: hours === h ? "#e2b96f" : "#6b7280",
                fontSize: "11px", fontWeight: hours === h ? 800 : 400, cursor: "pointer",
              }}>{h}h</button>
            ))}
          </div>
        )}

        {bookingType === "day" && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {[1, 2, 3, 5, 7].map((d) => (
              <button key={d} onClick={() => setDays(d)} style={{
                padding: "5px 10px", borderRadius: "6px",
                border: `1.5px solid ${days === d ? "#1a1a2e" : "#e5e7eb"}`,
                background: days === d ? "#1a1a2e" : "#fff",
                color: days === d ? "#e2b96f" : "#6b7280",
                fontSize: "11px", fontWeight: days === d ? 800 : 400, cursor: "pointer",
              }}>{d}d</button>
            ))}
          </div>
        )}

        {/* Cost */}
        <div style={{
          background: "linear-gradient(135deg,#1a1a2e,#0f3460)",
          borderRadius: "10px", padding: "13px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "10px",
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", marginBottom: "2px" }}>
              Estimated cost
            </div>
            <div style={{ color: "#e2b96f", fontSize: "10px" }}>
              {bookingType === "day"
                ? `${days} day${days > 1 ? "s" : ""} × ${fmtINR(dayRate)}/day`
                : `${hours} hr${hours > 1 ? "s" : ""} × ${fmtINR(Math.round(dayRate / 8))}/hr`}
            </div>
          </div>
          <div style={{ color: "#fff", fontSize: "20px", fontWeight: 900 }}>
            {fmtINR(cost)}
          </div>
        </div>

        <button
          onClick={() => onBook(place, cost)}
          style={{
            width: "100%", padding: "12px",
            background: "#e2b96f", color: "#1a1a2e",
            border: "none", borderRadius: "9px",
            fontSize: "13px", fontWeight: 900, cursor: "pointer",
            letterSpacing: "0.3px", transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          Book This Venue
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function VenueBookingSection({ googleMapsApiKey, onVenueCostChange }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || "",
    libraries: LIBRARIES,
  });

  const [mode,           setMode]           = useState("select");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeCity,     setActiveCity]     = useState(CITIES[0]);
  const [minRating,      setMinRating]      = useState(0);
  const [searchText,     setSearchText]     = useState("");

  const [sbRef,       setSbRef]       = useState(null);
  const [prefPin,     setPrefPin]     = useState(null);
  const [prefAddress, setPrefAddress] = useState("");

  const [places,    setPlaces]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CTR);
  const [mapZoom,   setMapZoom]   = useState(12);

  const [selectedPlace,  setSelectedPlace]  = useState(null);
  const [hoveredId,      setHoveredId]      = useState(null);

  const [bookingType, setBookingType] = useState("day");
  const [hours,       setHours]       = useState(4);
  const [days,        setDays]        = useState(1);

  const mapRef  = useRef(null);
  const listRef = useRef(null);

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  // Cost
  const venueCost = (() => {
    if (mode === "preferred") return PREF_COST;
    if (!selectedPlace) return 0;
    const pl = parsePriceLevel(selectedPlace.price_level);
    const dr = PRICE_PER_DAY[pl] ?? 15000;
    return bookingType === "day" ? dr * days : Math.round((dr / 8) * hours);
  })();
  useEffect(() => { onVenueCostChange?.(venueCost); }, [venueCost]);

  // Fetch
  const fetchPlaces = useCallback(async () => {
    if (!window.google?.maps?.places?.Place) return;
    const cat   = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
    const query = [searchText || cat.query, activeCity.label].filter(Boolean).join(" ");
    setLoading(true);
    try {
      const { places: raw } = await window.google.maps.places.Place.searchByText({
        textQuery:   query,
        fields:      ["id","displayName","formattedAddress","location","rating",
                      "userRatingCount","priceLevel","photos","regularOpeningHours"],
        locationBias:{ center: activeCity.center, radius: 25000 },
        maxResultCount: 20,
      });
      let list = (raw || []).map((p) => ({
        place_id:           p.id,
        name:               p.displayName,
        formatted_address:  p.formattedAddress,
        vicinity:           p.formattedAddress,
        rating:             p.rating,
        user_ratings_total: p.userRatingCount,
        price_level:        parsePriceLevel(p.priceLevel),
        photos:             p.photos,
        opening_hours:      p.regularOpeningHours,
        _photo:             p.photos?.[0] ?? null,
        geometry: {
          location: {
            lat: () => p.location?.lat ?? activeCity.center.lat,
            lng: () => p.location?.lng ?? activeCity.center.lng,
          },
        },
      }));
      if (minRating > 0) list = list.filter((p) => (p.rating || 0) >= minRating);
      setPlaces(list);
      setMapCenter(activeCity.center);
      setMapZoom(12);
      setSelectedPlace(null);
    } catch (err) {
      console.error("Places error:", err);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeCity, minRating, searchText]);

  useEffect(() => {
    if (mode !== "select" || !isLoaded) return;
    const t = setTimeout(fetchPlaces, 400);
    return () => clearTimeout(t);
  }, [activeCategory, activeCity, minRating, searchText, mode, isLoaded]);

  // Preferred pin
  const handleMapClick = (e) => {
    if (mode !== "preferred") return;
    const lat = e.latLng.lat(), lng = e.latLng.lng();
    setPrefPin({ lat, lng });
    setMapCenter({ lat, lng });
    new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (res, st) => {
      setPrefAddress(st === "OK" && res[0] ? res[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });
  };

  const onSBLoad    = (r) => setSbRef(r);
  const onSBChanged = () => {
    if (!sbRef) return;
    const r = sbRef.getPlaces();
    if (r?.length) {
      const p = r[0], lat = p.geometry.location.lat(), lng = p.geometry.location.lng();
      setPrefPin({ lat, lng }); setMapCenter({ lat, lng }); setMapZoom(15);
      setPrefAddress(p.formatted_address);
    }
  };

  // Scroll selected into view
  useEffect(() => {
    if (!selectedPlace || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selectedPlace.place_id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedPlace]);

  const handleBook = (place, cost) => {
    // Wire to your formData here if needed
    console.log("📌 Venue booked:", place.name, "Cost:", cost);
  };

  if (loadError) return (
    <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
      ❌ Maps failed to load. Enable billing & check API key.
    </div>
  );
  if (!isLoaded) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
  );

  /* ── render ── */
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>

      {/* ─ TOP BAR ─ */}
      <div style={{
        background: "#fff", borderRadius: "14px 14px 0 0",
        border: "1.5px solid #e5e7eb", borderBottom: "none",
        padding: "14px 16px 0",
      }}>
        {/* Mode buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[
            { key: "select",    icon: "🏛️", label: "Browse Venues"   },
            { key: "preferred", icon: "📍", label: "My Location"     },
          ].map((m) => (
            <button key={m.key} onClick={() => {
              setMode(m.key); setSelectedPlace(null);
              setPrefPin(null); setPrefAddress("");
            }} style={{
              padding: "8px 16px", borderRadius: 8,
              border: `2px solid ${mode === m.key ? "#1a1a2e" : "#e5e7eb"}`,
              background: mode === m.key ? "#1a1a2e" : "#fff",
              color: mode === m.key ? "#e2b96f" : "#6b7280",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 14 }}>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>

        {/* Browse filters */}
        {mode === "select" && (<>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <span style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none",
            }}>🔍</span>
            <input
              type="text" value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search venues, halls, resorts…"
              style={{
                width: "100%", padding: "9px 14px 9px 36px",
                borderRadius: 8, border: "1.5px solid #e5e7eb",
                fontSize: 13, outline: "none", boxSizing: "border-box",
                color: "#1a1a2e", background: "#f8fafc",
              }}
            />
          </div>

          {/* Category chips */}
          <div style={{
            display: "flex", gap: 6, overflowX: "auto",
            paddingBottom: 10, scrollbarWidth: "none",
          }}>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                flexShrink: 0, padding: "6px 12px", borderRadius: 20,
                border: `1.5px solid ${activeCategory === cat.id ? "#1a1a2e" : "#e5e7eb"}`,
                background: activeCategory === cat.id ? "#1a1a2e" : "#fff",
                color: activeCategory === cat.id ? "#e2b96f" : "#374151",
                fontSize: 12, fontWeight: activeCategory === cat.id ? 700 : 400,
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: 4, whiteSpace: "nowrap", transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 13 }}>{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>

          {/* City + rating */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 12, flexWrap: "wrap" }}>
            <select
              value={activeCity.label}
              onChange={(e) => { const c = CITIES.find((x) => x.label === e.target.value); if (c) setActiveCity(c); }}
              style={{
                padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                fontSize: 12, background: "#fff", color: "#374151", cursor: "pointer", outline: "none",
              }}
            >
              {CITIES.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
            </select>

            {STAR_FILTERS.map((s) => (
              <button key={s.min} onClick={() => setMinRating(s.min)} style={{
                padding: "6px 10px", borderRadius: 8,
                border: `1.5px solid ${minRating === s.min ? "#1a1a2e" : "#e5e7eb"}`,
                background: minRating === s.min ? "#1a1a2e" : "#fff",
                color: minRating === s.min ? "#e2b96f" : "#374151",
                fontSize: 12, fontWeight: minRating === s.min ? 700 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {s.label === "Any" ? s.label : `★ ${s.label}`}
              </button>
            ))}
          </div>
        </>)}

        {/* Preferred search */}
        {mode === "preferred" && (
          <div style={{ paddingBottom: 12 }}>
            <StandaloneSearchBox onLoad={onSBLoad} onPlacesChanged={onSBChanged}>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none",
                }}>📍</span>
                <input
                  type="text"
                  placeholder="Search your event location…"
                  style={{
                    width: "100%", padding: "9px 14px 9px 36px",
                    borderRadius: 8, border: "1.5px solid #e5e7eb",
                    fontSize: 13, outline: "none", boxSizing: "border-box",
                    background: "#f8fafc",
                  }}
                />
              </div>
            </StandaloneSearchBox>
            {prefAddress && (
              <div style={{
                marginTop: 8, background: "#f0fdf4", border: "1px solid #86efac",
                borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#166534",
                display: "flex", gap: 6,
              }}>
                <span>✅</span>
                <span>{prefAddress} — <strong>₹3,000</strong> flat fee</span>
              </div>
            )}
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>
              Or click anywhere on the map to drop a pin
            </p>
          </div>
        )}
      </div>

      {/* ─ BODY ─ */}
      <div style={{
        display: "flex", height: "580px",
        border: "1.5px solid #e5e7eb", borderTop: "none",
        borderRadius: "0 0 14px 14px", overflow: "hidden",
      }}>

        {/* List */}
        {mode === "select" && (
          <div
            ref={listRef}
            style={{
              width: "370px", flexShrink: 0, overflowY: "auto",
              padding: 12, display: "flex", flexDirection: "column",
              gap: 8, background: "#fff", borderRight: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: 11, color: "#9ca3af", padding: "2px 0 4px" }}>
              {loading ? "Searching venues…" : `${places.length} venue${places.length !== 1 ? "s" : ""} found`}
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
                🔍 Finding venues…
              </div>
            )}
            {!loading && places.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
                No venues found. Try another category or city.
              </div>
            )}

            {places.map((place) => (
              <div key={place.place_id} data-id={place.place_id}>
                <VenueCard
                  place={place}
                  isSelected={selectedPlace?.place_id === place.place_id}
                  isHovered={hoveredId === place.place_id}
                  onClick={() => {
                    if (selectedPlace?.place_id === place.place_id) {
                      // Deselect — zoom back out to show all pins
                      setSelectedPlace(null);
                      setMapCenter(activeCity.center);
                      setMapZoom(12);
                    } else {
                      setSelectedPlace(place);
                      const loc = place.geometry?.location;
                      if (loc) { setMapCenter({ lat: loc.lat(), lng: loc.lng() }); setMapZoom(15); }
                    }
                  }}
                  onMouseEnter={() => setHoveredId(place.place_id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <GoogleMap
            zoom={mapZoom}
            center={mapCenter}
            onLoad={onMapLoad}
            onClick={mode === "preferred" ? handleMapClick : undefined}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              styles: CLEAN_MAP_STYLE,
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              clickableIcons: false,
            }}
          >
            {/* Venue pins — ALL shown; dimmed when another is selected */}
            {mode === "select" && places.map((place) => {
              const loc = place.geometry?.location;
              if (!loc) return null;
              const isSelected = selectedPlace?.place_id === place.place_id;
              const isDimmed   = !!selectedPlace && !isSelected;
              return (
                <OverlayView
                  key={place.place_id}
                  position={{ lat: loc.lat(), lng: loc.lng() }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <MapPin
                    place={place}
                    isSelected={isSelected}
                    isHovered={hoveredId === place.place_id}
                    isDimmed={isDimmed}
                    onClick={() => {
                      if (isSelected) {
                        // Deselect → all pins come back
                        setSelectedPlace(null);
                        setMapCenter(activeCity.center);
                        setMapZoom(12);
                      } else {
                        setSelectedPlace(place);
                        setMapCenter({ lat: loc.lat(), lng: loc.lng() });
                        setMapZoom(15);
                      }
                    }}
                  />
                </OverlayView>
              );
            })}

            {/* Preferred pin */}
            {mode === "preferred" && prefPin && (
              <OverlayView
                position={prefPin}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div style={{
                  width: 26, height: 26,
                  background: "#e2b96f", border: "3px solid #1a1a2e",
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg) translate(-50%,-50%)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                }}/>
              </OverlayView>
            )}

            {/* Map hint */}
            {mode === "preferred" && !prefPin && (
              <div style={{
                position: "absolute", top: 16, left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(26,26,46,0.88)", color: "#fff",
                padding: "7px 18px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, pointerEvents: "none",
                whiteSpace: "nowrap",
              }}>📍 Click on the map to pin your location</div>
            )}
          </GoogleMap>

          {/* Detail panel — close restores all pins */}
          {mode === "select" && selectedPlace && (
            <DetailPanel
              place={selectedPlace}
              onClose={() => {
                setSelectedPlace(null);
                setMapCenter(activeCity.center);
                setMapZoom(12);
              }}
              onBook={handleBook}
              bookingType={bookingType} setBookingType={setBookingType}
              hours={hours} setHours={setHours}
              days={days}  setDays={setDays}
            />
          )}

          {/* Pulse keyframe injected once */}
          <style>{`
            @keyframes pinPulse {
              0%   { transform: translate(-50%,-60%) scale(1);   opacity: 0.7; }
              70%  { transform: translate(-50%,-60%) scale(1.7); opacity: 0;   }
              100% { transform: translate(-50%,-60%) scale(1.7); opacity: 0;   }
            }
          `}</style>

          {/* Preferred cost badge */}
          {mode === "preferred" && prefPin && (
            <div style={{
              position: "absolute", bottom: 16, left: "50%",
              transform: "translateX(-50%)",
              background: "#1a1a2e", color: "#e2b96f",
              padding: "10px 20px", borderRadius: 24,
              fontSize: 13, fontWeight: 800,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
            }}>
              📍 Preferred Location · ₹3,000 flat fee
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CLEAN_MAP_STYLE = [
  { featureType: "poi",              elementType: "labels",          stylers: [{ visibility: "off" }] },
  { featureType: "poi.business",     elementType: "all",             stylers: [{ visibility: "off" }] },
  { featureType: "transit",          elementType: "labels",          stylers: [{ visibility: "off" }] },
  { featureType: "road",             elementType: "geometry",        stylers: [{ color: "#ffffff" }] },
  { featureType: "road",             elementType: "labels.text.fill",stylers: [{ color: "#9ca3af" }] },
  { featureType: "road.arterial",    elementType: "geometry",        stylers: [{ color: "#f3f4f6" }] },
  { featureType: "road.highway",     elementType: "geometry",        stylers: [{ color: "#e5e7eb" }] },
  { featureType: "water",            elementType: "geometry",        stylers: [{ color: "#bfdbfe" }] },
  { featureType: "landscape",        elementType: "geometry",        stylers: [{ color: "#f9fafb" }] },
  { featureType: "landscape.natural",elementType: "geometry",        stylers: [{ color: "#d1fae5" }] },
  { featureType: "administrative",   elementType: "geometry.stroke", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "administrative",   elementType: "labels.text.fill",stylers: [{ color: "#374151" }] },
];