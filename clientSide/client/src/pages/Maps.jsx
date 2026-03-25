"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  OverlayView,
  StandaloneSearchBox,
} from "@react-google-maps/api";

/* ── Constants ───────────────────────────────── */
const LIBRARIES = ["places", "geometry"];
const DEFAULT_CTR = { lat: 17.385, lng: 78.4867 };

const PRICE_MAP = {
  0: 5000,
  1: 12000,
  2: 30000,
  3: 70000,
  4: 140000,
};

const STAR_FILTERS = [
  { label: "Any", min: 0 },
  { label: "3.0+", min: 3 },
  { label: "4.0+", min: 4 },
  { label: "4.5+", min: 4.5 },
];

/* ── Helpers ───────────────────────────────── */
const fmtINR = (n) => "₹" + n.toLocaleString("en-IN");

const getRate = (pl) => PRICE_MAP[pl] ?? null;

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

/* ── Map Pin ───────────────────────────────── */
const MapPin = ({ place, isSelected, isHovered, isDimmed, onClick }) => {
  const pl = parsePriceLevel(place.price_level);
  const rate = getRate(pl);

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        transform: `scale(${isSelected ? 1.3 : isHovered ? 1.1 : 1})`,
        opacity: isDimmed ? 0.3 : 1,
      }}
    >
      <div
        style={{
          background: isSelected ? "#000" : "#fff",
          color: isSelected ? "#fff" : "#000",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: 11,
          fontWeight: 700,
          border: "2px solid #000",
        }}
      >
        {rate ? "₹" : "₹?"}
      </div>
    </div>
  );
};

/* ── Venue Card ───────────────────────────────── */
const VenueCard = ({ place, isSelected, onClick }) => {
  const pl = parsePriceLevel(place.price_level);
  const rate = getRate(pl);

  return (
    <div
      onClick={onClick}
      style={{
        border: isSelected ? "2px solid black" : "1px solid #ddd",
        padding: 10,
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 700 }}>{place.name}</div>
      <div style={{ fontSize: 12 }}>{place.vicinity}</div>
      <div style={{ fontSize: 12 }}>
        {rate ? `${fmtINR(rate)}/day` : "Contact"}
      </div>
    </div>
  );
};

/* ── Main Component ───────────────────────────────── */
export default function VenueBookingSection({ googleMapsApiKey }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey,
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const [mapCenter, setMapCenter] = useState(DEFAULT_CTR);
  const [mapZoom, setMapZoom] = useState(12);

  const [viewportCenter, setViewportCenter] = useState(DEFAULT_CTR);
  const [viewportRadius, setViewportRadius] = useState(5000);

  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [sbRef, setSbRef] = useState(null);

  /* ── Fetch Places ───────────────── */
  const fetchPlaces = useCallback(async (center, radius) => {
    if (!window.google?.maps?.places?.Place) return;

    try {
      const queries = ["banquet hall", "wedding venue", "resort"];

      let results = [];

      for (const q of queries) {
        const res = await window.google.maps.places.Place.searchByText({
          textQuery: searchQuery ? `${searchQuery} ${q}` : q,
          locationBias: { center, radius },
          maxResultCount: 20,
        });

        results.push(...(res.places || []));
      }

      const unique = Array.from(
        new Map(results.map((p) => [p.id, p])).values()
      );

      const mapped = unique.map((p) => ({
        place_id: p.id,
        name: p.displayName,
        vicinity: p.formattedAddress,
        rating: p.rating,
        price_level: parsePriceLevel(p.priceLevel),
        geometry: {
          location: {
            lat: () => p.location.lat,
            lng: () => p.location.lng,
          },
        },
      }));

      setPlaces(
        minRating
          ? mapped.filter((p) => (p.rating || 0) >= minRating)
          : mapped
      );
    } catch (e) {
      console.error(e);
    }
  }, [searchQuery, minRating]);

  /* ── Trigger Fetch ───────────────── */
  useEffect(() => {
    if (!isLoaded) return;

    const t = setTimeout(() => {
      fetchPlaces(viewportCenter, viewportRadius);
    }, 400);

    return () => clearTimeout(t);
  }, [viewportCenter, viewportRadius, fetchPlaces, isLoaded]);

  /* ── Map Idle ───────────────── */
  const onMapIdle = () => {
    const map = mapRef.current;
    if (!map) return;

    const c = map.getCenter();
    setViewportCenter({ lat: c.lat(), lng: c.lng() });
  };

  /* ── Search Box ───────────────── */
  const onSBChanged = () => {
    const res = sbRef.getPlaces();
    if (!res?.length) return;

    const loc = res[0].geometry.location;

    const center = { lat: loc.lat(), lng: loc.lng() };

    setMapCenter(center);
    setViewportCenter(center);
    setMapZoom(14);
  };

  if (!isLoaded) return <div>Loading...</div>;

  /* ── UI ───────────────── */
  return (
    <div style={{ display: "flex", height: "600px" }}>

      {/* LEFT LIST */}
      <div style={{ width: 350, overflowY: "auto", padding: 10 }}>
        <input
          placeholder="Search..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {STAR_FILTERS.map((f) => (
          <button key={f.min} onClick={() => setMinRating(f.min)}>
            {f.label}
          </button>
        ))}

        {places.map((place) => (
          <VenueCard
            key={place.place_id}
            place={place}
            isSelected={selectedPlace?.place_id === place.place_id}
            onClick={() => {
              setSelectedPlace(place);
              const loc = place.geometry.location;
              setMapCenter({ lat: loc.lat(), lng: loc.lng() });
              setMapZoom(16);
            }}
          />
        ))}
      </div>

      {/* MAP */}
      <GoogleMap
        center={mapCenter}
        zoom={mapZoom}
        onLoad={(m) => (mapRef.current = m)}
        onIdle={onMapIdle}
        mapContainerStyle={{ flex: 1 }}
      >
        {places.map((place) => {
          const loc = place.geometry.location;
          const isSelected =
            selectedPlace?.place_id === place.place_id;

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
                isDimmed={selectedPlace && !isSelected}
                onClick={() => setSelectedPlace(place)}
              />
            </OverlayView>
          );
        })}
      </GoogleMap>
    </div>
  );
}