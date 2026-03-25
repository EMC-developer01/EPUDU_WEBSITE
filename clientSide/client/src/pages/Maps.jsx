/**
 * VenueBookingSection.jsx — Location-based venue search (Google Maps style)
 *
 * Key changes:
 *  - Search any location (Madhapur, Miyapur, etc.) → map zooms there
 *  - Fetches real venues near that location with map pins
 *  - Zoom in/out triggers re-fetch for current map viewport
 *  - Prices sourced from Google Places priceLevel (no hardcoded overrides)
 *  - Fully dynamic: all pins rendered from live Places API results
 *
 * Usage:
 *   <VenueBookingSection
 *     googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
 *     onVenueCostChange={(cost) => { ... }}
 *   />
 *
 * APIs needed: Maps JavaScript API, Places API (New), Geocoding API
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  OverlayView,
  StandaloneSearchBox,
} from "@react-google-maps/api";

/* ── Constants ──────────────────────────────────────────────────────────── */
const LIBRARIES = ["places", "geometry"];
const DEFAULT_CTR = { lat: 17.385, lng: 78.4867 };

/* Price level → estimated day rate (fallback if Places doesn't give one) */
const PRICE_PER_DAY_FALLBACK = { 0: 5000, 1: 12000, 2: 30000, 3: 70000, 4: 140000 };
const RUPEE_SIGN = ["Free", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];
const PRICE_LABELS = ["Free", "Budget", "Moderate", "Upscale", "Luxury"];

// const CATEGORIES = [
//   { id: "all", label: "All Venues", icon: "🏛️", query: "party hall event venue" },
//   { id: "birthday", label: "Birthday", icon: "🎂", query: "birthday party hall" },
//   { id: "wedding", label: "Wedding", icon: "💍", query: "wedding banquet hall" },
//   { id: "outdoor", label: "Outdoor", icon: "🌿", query: "outdoor garden party venue" },
//   { id: "resort", label: "Resorts", icon: "🏨", query: "resort event venue party" },
//   { id: "rooftop", label: "Rooftop", icon: "🌆", query: "rooftop party terrace venue" },
//   { id: "community", label: "Community", icon: "🏘️", query: "community hall kalyana mandapam" },
// ];

const STAR_FILTERS = [
  { label: "Any", min: 0 },
  { label: "3.0+", min: 3.0 },
  { label: "4.0+", min: 4.0 },
  { label: "4.5+", min: 4.5 },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */
const parsePriceLevel = (pl) => {
  if (typeof pl === "number") return pl;
  return {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }[pl] ?? null;
};

const getPhotoUrl = (place, w = 500) => {
  try {
    if (place?._photo?.getURI) return place._photo.getURI({ maxWidth: w });
    if (place?.photos?.[0]?.getUrl) return place.photos[0].getUrl({ maxWidth: w });
  } catch (_) { }
  return `https://source.unsplash.com/${w}x${Math.round(w * 0.65)}/?event,hall,venue&sig=${place?.place_id}`;
};

const fmtINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

const RatingBadge = ({ rating }) => {
  if (!rating) return null;
  const color = rating >= 4 ? "#1a7340" : rating >= 3 ? "#c27d0e" : "#c0392b";
  return (
    <span style={{
      background: color, color: "#fff",
      fontSize: "11px", fontWeight: 700,
      padding: "2px 7px", borderRadius: "4px",
    }}>
      {rating.toFixed(1)} ★
    </span>
  );
};

/* Day rate derived from price level; if null → show "Contact for price" */
const getDayRate = (pl) => {
  if (pl === null || pl === undefined) return null;
  return PRICE_PER_DAY_FALLBACK[pl] ?? null;
};

const priceDisplay = (place) => {
  const pl = parsePriceLevel(place.price_level);
  const dr = getDayRate(pl);
  if (dr === null) return { symbol: "₹?", label: "Contact for price", rate: null };
  return {
    symbol: RUPEE_SIGN[pl] || "₹",
    label: PRICE_LABELS[pl] || "Moderate",
    rate: dr,
  };
};

/* ── Map Pin ─────────────────────────────────────────────────────────────── */
function MapPin({ place, isSelected, isHovered, isDimmed, onClick }) {
  const { symbol } = priceDisplay(place);
  const bg = isSelected ? "#e2b96f" : isHovered ? "#1a1a2e" : "#fff";
  const fg = isSelected ? "#1a1a2e" : isHovered ? "#e2b96f" : "#1a1a2e";
  const border = isSelected ? "#c8964a" : isHovered ? "#e2b96f" : "#1a1a2e";
  const scale = isSelected ? 1.35 : isHovered ? 1.12 : 1;
  const yShift = isSelected ? -5 : isHovered ? -2 : 0;

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer", userSelect: "none",
        position: "relative",
        transform: `scale(${scale}) translateY(${yShift}px)`,
        transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1), opacity 0.22s ease",
        transformOrigin: "bottom center",
        opacity: isDimmed ? 0.2 : 1,
        zIndex: isSelected ? 100 : isHovered ? 50 : 1,
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: "44px", height: "28px",
          borderRadius: "14px",
          border: "2.5px solid rgba(226,185,111,0.5)",
          pointerEvents: "none",
          animation: "pinPulse 1.8s ease-out infinite",
        }} />
      )}
      <div style={{
        background: bg, color: fg,
        border: `2.5px solid ${border}`,
        borderRadius: "18px", padding: "5px 10px",
        fontSize: "11px", fontWeight: 800,
        whiteSpace: "nowrap", lineHeight: 1,
        boxShadow: isSelected
          ? "0 6px 20px rgba(226,185,111,0.55)"
          : isHovered ? "0 4px 12px rgba(26,26,46,0.25)"
            : "0 2px 8px rgba(0,0,0,0.2)",
      }}>
        {symbol}
      </div>
      <div style={{
        width: 0, height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: `7px solid ${border}`,
        margin: "0 auto", marginTop: "-1px",
      }} />
    </div>
  );
}

/* ── Venue List Card ─────────────────────────────────────────────────────── */
function VenueCard({ place, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave }) {
  const { symbol, label, rate } = priceDisplay(place);
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
          ? "0 4px 18px rgba(26,26,46,0.12)"
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
          onError={(e) => { e.target.src = `https://source.unsplash.com/300x300/?hall,venue&sig=${place.place_id}`; }}
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

      {/* Info */}
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
          <RatingBadge rating={place.rating} />
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
        }}>
          {place.formatted_address || place.vicinity}
        </div>

        <div style={{ fontSize: "11px", color: "#374151", fontWeight: 700 }}>
          {symbol} · {rate ? `${fmtINR(rate)}/day (est.)` : label}
        </div>
      </div>
    </div>
  );
}

/* ── Detail Side Panel ───────────────────────────────────────────────────── */
function DetailPanel({ place, onClose, onBook, bookingType, setBookingType, hours, setHours, days, setDays }) {
  if (!place) return null;
  const { symbol, label, rate } = priceDisplay(place);
  const dayRate = rate ?? 15000;
  const cost = bookingType === "day"
    ? dayRate * days
    : Math.round((dayRate / 8) * hours);

  return (
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: "clamp(270px,38%,360px)", height: "100%",
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
          style={{ width: "100%", height: "170px", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.src = `https://source.unsplash.com/800x400/?venue,hall&sig=${place.place_id}`; }}
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
        }}>{symbol} · {label}</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        <h3 style={{ margin: "0 0 5px", fontSize: "15px", fontWeight: 800, color: "#1a1a2e" }}>
          {place.name}
        </h3>

        {place.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <RatingBadge rating={place.rating} />
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {place.user_ratings_total
                ? `${place.user_ratings_total.toLocaleString("en-IN")} reviews`
                : ""}
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", flexShrink: 0 }}>📍</span>
          <span style={{ fontSize: "11px", color: "#4b5563", lineHeight: 1.55 }}>
            {place.formatted_address || place.vicinity}
          </span>
        </div>

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

        {place.website && (
          <div style={{ marginBottom: "12px" }}>
            <a
              href={place.website}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none" }}
            >
              🌐 {place.website.replace(/^https?:\/\//, "").split("/")[0]}
            </a>
          </div>
        )}

        {place.formatted_phone_number && (
          <div style={{ marginBottom: "12px", fontSize: "11px", color: "#374151" }}>
            📞 {place.formatted_phone_number}
          </div>
        )}

        <div style={{ borderTop: "1px solid #f1f5f9", margin: "0 0 12px" }} />

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
              fontWeight: 700, fontSize: "12px", cursor: "pointer", transition: "all 0.15s",
            }}>
              {t === "hour" ? "⏱ Hourly" : "📅 Full Day"}
            </button>
          ))}
        </div>

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

        {/* Cost estimate */}
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
            {!rate && (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", marginTop: 3 }}>
                * Estimate based on venue tier. Confirm with venue.
              </div>
            )}
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

  // const [activeCategory, setActiveCategory] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");       // free-text filter
  const [searchCenter, setSearchCenter] = useState(null);    // geocoded location pin

  const [sbRef, setSbRef] = useState(null);

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mapCenter, setMapCenter] = useState(DEFAULT_CTR);
  const [mapZoom, setMapZoom] = useState(12);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const [bookingType, setBookingType] = useState("day");
  const [hours, setHours] = useState(4);
  const [days, setDays] = useState(1);

  // Track map viewport for "zoom-based re-fetch"
  const [viewportCenter, setViewportCenter] = useState(DEFAULT_CTR);
  const [viewportRadius, setViewportRadius] = useState(5000); // metres

  const mapRef = useRef(null);
  const listRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  /* ── Fetch venues near a center within radius ── */
  const fetchPlaces = useCallback(async (center, radiusMetres) => {
    if (!window.google?.maps?.places?.Place) return;

    const queries = [
      "banquet hall",
      "wedding venue",
      "resort",
      "hotel event venue",
      "party hall",
      "function hall",
      "garden venue",
    ];

    setLoading(true);

    try {
      let allResults = [];

      for (const q of queries) {
        const { places: raw } =
          await window.google.maps.places.Place.searchByText({
            textQuery: searchQuery ? `${searchQuery} ${q}` : q,
            fields: [
              "id", "displayName", "formattedAddress", "location", "rating",
              "userRatingCount", "priceLevel", "photos", "regularOpeningHours",
              "websiteURI", "nationalPhoneNumber",
            ],
            locationBias: {
              center,
              radius: Math.min(radiusMetres * 2, 50000),
            },
            maxResultCount: 20,
          });

        allResults.push(...(raw || []));
      }

      // ✅ REMOVE DUPLICATES
      const unique = Array.from(
        new Map(allResults.map(p => [p.id, p])).values()
      );

      let list = unique.map((p) => ({
        place_id: p.id,
        name: p.displayName,
        formatted_address: p.formattedAddress,
        vicinity: p.formattedAddress,
        rating: p.rating,
        user_ratings_total: p.userRatingCount,
        price_level: parsePriceLevel(p.priceLevel),
        photos: p.photos,
        opening_hours: p.regularOpeningHours,
        website: p.websiteURI,
        formatted_phone_number: p.nationalPhoneNumber,
        _photo: p.photos?.[0] ?? null,
        geometry: {
          location: {
            lat: () => p.location?.lat ?? center.lat,
            lng: () => p.location?.lng ?? center.lng,
          },
        },
      }));

      if (minRating > 0) {
        list = list.filter((p) => (p.rating || 0) >= minRating);
      }

      setPlaces(list);
      setSelectedPlace(null);
    } catch (err) {
      console.error(err);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, minRating]);

  /* Trigger fetch whenever relevant state changes */
  useEffect(() => {
    if (!isLoaded) return;
    const t = setTimeout(() => {
      fetchPlaces(viewportCenter, viewportRadius);
    }, 500);
    return () => clearTimeout(t);
  }, [activeCategory, minRating, searchQuery, viewportCenter, viewportRadius, isLoaded, fetchPlaces]);

  /* ── When map idles (user pans/zooms) → update viewport, re-fetch ── */
  const onMapIdle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    if (!c) return;
    const center = { lat: c.lat(), lng: c.lng() };

    // Estimate visible radius from bounds
    const bounds = map.getBounds();
    let radius = 5000;
    if (bounds && window.google?.maps?.geometry?.spherical) {
      const ne = bounds.getNorthEast();
      radius = Math.round(
        window.google.maps.geometry.spherical.computeDistanceBetween(c, ne)
      );
    }

    setViewportCenter(center);
    setViewportRadius(radius);
  }, []);

  /* ── Location search box ── */
  const onSBLoad = (r) => setSbRef(r);
  const onSBChanged = () => {
    if (!sbRef) return;
    const results = sbRef.getPlaces();
    if (results?.length) {
      const p = results[0];
      const lat = p.geometry.location.lat();
      const lng = p.geometry.location.lng();
      const center = { lat, lng };
      setSearchCenter(center);
      setMapCenter(center);
      setMapZoom(14);
      setViewportCenter(center);
      setViewportRadius(3000);
    }
  };

  /* ── Scroll selected card into view ── */
  useEffect(() => {
    if (!selectedPlace || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selectedPlace.place_id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedPlace]);

  /* ── Venue cost ── */
  const venueCost = (() => {
    if (!selectedPlace) return 0;
    const { rate } = priceDisplay(selectedPlace);
    const dr = rate ?? 15000;
    return bookingType === "day" ? dr * days : Math.round((dr / 8) * hours);
  })();
  useEffect(() => { onVenueCostChange?.(venueCost); }, [venueCost]);

  const handleBook = (place, cost) => {
    console.log("📌 Venue booked:", place.name, "Cost:", cost);
  };

  /* ── Loading / error states ── */
  if (loadError) return (
    <div style={{ padding: 40, textAlign: "center", color: "#ef4444", fontSize: 14 }}>
      ❌ Maps failed to load. Check your API key and enable billing.
    </div>
  );
  if (!isLoaded) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
      Loading map…
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI',sans-serif" }}>

      {/* ─── TOP BAR ─── */}
      <div style={{
        background: "#fff",
        borderRadius: "14px 14px 0 0",
        border: "1.5px solid #e5e7eb", borderBottom: "none",
        padding: "14px 16px 0",
      }}>
        {/* Location search */}
        <StandaloneSearchBox onLoad={onSBLoad} onPlacesChanged={onSBChanged}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <span style={{
              position: "absolute", left: 12, top: "50%",
              transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none",
            }}>📍</span>
            <input
              type="text"
              placeholder="Search location: Madhapur, Miyapur, Banjara Hills…"
              style={{
                width: "100%", padding: "10px 14px 10px 38px",
                borderRadius: 9, border: "1.5px solid #e5e7eb",
                fontSize: 13, outline: "none", boxSizing: "border-box",
                background: "#f8fafc", color: "#1a1a2e",
              }}
            />
          </div>
        </StandaloneSearchBox>

        {/* Keyword filter */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter: kalyana mandapam, banquet, resort…"
            style={{
              width: "100%", padding: "8px 14px 8px 36px",
              borderRadius: 8, border: "1.5px solid #e5e7eb",
              fontSize: 12, outline: "none", boxSizing: "border-box",
              background: "#fff", color: "#374151",
            }}
          />
        </div>

        {/* Category chips */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          paddingBottom: 10, scrollbarWidth: "none",
        }}>
          {/* {CATEGORIES.map((cat) => (
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
          ))} */}
        </div>

        {/* Rating filters */}
        <div style={{ display: "flex", gap: 8, paddingBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 2 }}>Min rating:</span>
          {STAR_FILTERS.map((s) => (
            <button key={s.min} onClick={() => setMinRating(s.min)} style={{
              padding: "5px 10px", borderRadius: 8,
              border: `1.5px solid ${minRating === s.min ? "#1a1a2e" : "#e5e7eb"}`,
              background: minRating === s.min ? "#1a1a2e" : "#fff",
              color: minRating === s.min ? "#e2b96f" : "#374151",
              fontSize: 11, fontWeight: minRating === s.min ? 700 : 400,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {s.label === "Any" ? s.label : `★ ${s.label}`}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>
            Pan/zoom the map to refresh results
          </span>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div style={{
        display: "flex", height: "580px",
        border: "1.5px solid #e5e7eb", borderTop: "none",
        borderRadius: "0 0 14px 14px", overflow: "hidden",
      }}>

        {/* ── Venue list ── */}
        <div
          ref={listRef}
          style={{
            width: "370px", flexShrink: 0, overflowY: "auto",
            padding: 12, display: "flex", flexDirection: "column",
            gap: 8, background: "#fff", borderRight: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: 11, color: "#9ca3af", padding: "2px 0 4px" }}>
            {loading
              ? "🔍 Searching venues…"
              : `${places.length} venue${places.length !== 1 ? "s" : ""} found`}
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
              Finding venues near you…
            </div>
          )}

          {!loading && places.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>
              No venues found. Try a different category or location.
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
                    setSelectedPlace(null);
                    setMapCenter(viewportCenter);
                    setMapZoom(13);
                  } else {
                    setSelectedPlace(place);
                    const loc = place.geometry?.location;
                    if (loc) {
                      setMapCenter({ lat: loc.lat(), lng: loc.lng() });
                      setMapZoom(16);
                    }
                  }
                }}
                onMouseEnter={() => setHoveredId(place.place_id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </div>
          ))}
        </div>

        {/* ── Map ── */}
        <div style={{ flex: 1, position: "relative" }}>
          <GoogleMap
            zoom={mapZoom}
            center={mapCenter}
            onLoad={onMapLoad}
            onIdle={onMapIdle}
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
            {/* Venue pins — ALL shown; dim others when one is selected */}
            {places.map((place) => {
              const loc = place.geometry?.location;
              if (!loc) return null;
              const isSelected = selectedPlace?.place_id === place.place_id;
              const isDimmed = !!selectedPlace && !isSelected;
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
                        setSelectedPlace(null);
                        setMapCenter(viewportCenter);
                        setMapZoom(13);
                      } else {
                        setSelectedPlace(place);
                        setMapCenter({ lat: loc.lat(), lng: loc.lng() });
                        setMapZoom(16);
                      }
                    }}
                  />
                </OverlayView>
              );
            })}

            {/* Searched-location pin (gold dot) */}
            {searchCenter && (
              <OverlayView
                position={searchCenter}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div style={{
                  width: 16, height: 16,
                  background: "#e2b96f",
                  border: "3px solid #1a1a2e",
                  borderRadius: "50%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  transform: "translate(-50%,-50%)",
                }} title="Your searched location" />
              </OverlayView>
            )}

            {/* Map hint when no results yet */}
            {places.length === 0 && !loading && (
              <div style={{
                position: "absolute", top: 16, left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(26,26,46,0.88)", color: "#fff",
                padding: "7px 18px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, pointerEvents: "none",
                whiteSpace: "nowrap",
              }}>
                📍 Search a location above or pan the map
              </div>
            )}
          </GoogleMap>

          {/* Detail panel */}
          {selectedPlace && (
            <DetailPanel
              place={selectedPlace}
              onClose={() => {
                setSelectedPlace(null);
                setMapCenter(viewportCenter);
                setMapZoom(13);
              }}
              onBook={handleBook}
              bookingType={bookingType} setBookingType={setBookingType}
              hours={hours} setHours={setHours}
              days={days} setDays={setDays}
            />
          )}

          {/* Loading overlay on map */}
          {loading && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "#fff", borderRadius: 20, padding: "5px 14px",
              fontSize: 12, color: "#374151", fontWeight: 600,
              boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                border: "2px solid #e2b96f",
                borderTopColor: "#1a1a2e",
                animation: "spin 0.7s linear infinite",
                display: "inline-block",
              }} />
              Searching…
            </div>
          )}

          {/* Keyframes */}
          <style>{`
            @keyframes pinPulse {
              0%   { transform: translate(-50%,-60%) scale(1);   opacity: 0.7; }
              70%  { transform: translate(-50%,-60%) scale(1.7); opacity: 0;   }
              100% { transform: translate(-50%,-60%) scale(1.7); opacity: 0;   }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

/* ── Clean map style ─────────────────────────────────────────────────────── */
const CLEAN_MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bfdbfe" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f9fafb" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#d1fae5" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#374151" }] },
];