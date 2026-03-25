"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  OverlayView,
  StandaloneSearchBox,
} from "@react-google-maps/api";

/* ───────────────── CONSTANTS ───────────────── */
const LIBRARIES = ["places", "geometry"];
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };

const PRICE_MAP = {
  0: 5000,
  1: 12000,
  2: 30000,
  3: 70000,
  4: 140000,
};

const CATEGORY_LIST = [
  { id: "all", label: "All", query: "event venue banquet hall" },
  { id: "wedding", label: "Wedding", query: "wedding hall" },
  { id: "birthday", label: "Birthday", query: "birthday party hall" },
  { id: "resort", label: "Resort", query: "resort party venue" },
];

const STAR_FILTERS = [0, 3, 4, 4.5];

/* ───────────────── HELPERS ───────────────── */
const getPriceLevel = (pl) =>
  typeof pl === "number" ? pl : null;

const getPrice = (pl) => PRICE_MAP[pl] ?? null;

const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const getPhoto = (p) =>
  p?.photos?.[0]?.getURI?.({ maxWidth: 500 }) ||
  `https://source.unsplash.com/500x300/?venue&sig=${p?.place_id}`;

/* ───────────────── PIN ───────────────── */
const MapPin = ({ place, selected, onClick }) => {
  const price = getPrice(place.price_level);

  return (
    <div
      onClick={onClick}
      style={{
        padding: "6px 10px",
        borderRadius: 20,
        background: selected ? "#000" : "#fff",
        color: selected ? "#fff" : "#000",
        border: "2px solid #000",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {price ? formatINR(price) : "₹?"}
    </div>
  );
};

/* ───────────────── CARD ───────────────── */
const VenueCard = ({ place, selected, onClick }) => {
  const price = getPrice(place.price_level);

  return (
    <div
      onClick={onClick}
      style={{
        border: selected ? "2px solid black" : "1px solid #ddd",
        padding: 10,
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      <img
        src={getPhoto(place)}
        style={{ width: "100%", height: 120, objectFit: "cover" }}
      />
      <h4>{place.name}</h4>
      <p>{place.formatted_address}</p>
      <b>{price ? `${formatINR(price)}/day` : "Contact"}</b>
    </div>
  );
};

/* ───────────────── MAIN ───────────────── */
export default function VenueBookingSection({
  googleMapsApiKey,
  onVenueCostChange,
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey,
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("all");
  const [rating, setRating] = useState(0);

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [viewport, setViewport] = useState({
    center: DEFAULT_CENTER,
    radius: 5000,
  });

  /* ───────── FETCH PLACES ───────── */
  const fetchPlaces = useCallback(async () => {
    if (!window.google?.maps?.places) return;

    const cat = CATEGORY_LIST.find((c) => c.id === category);

    const res = await window.google.maps.places.Place.searchByText({
      textQuery: cat.query,
      locationBias: {
        center: viewport.center,
        radius: viewport.radius,
      },
      maxResultCount: 20,
      fields: [
        "displayName",
        "formattedAddress",
        "location",
        "rating",
        "priceLevel",
        "photos",
      ],
    });

    let data = res.places.map((p) => ({
      place_id: p.id,
      name: p.displayName,
      formatted_address: p.formattedAddress,
      rating: p.rating,
      price_level: getPriceLevel(p.priceLevel),
      photos: p.photos,
      geometry: {
        location: {
          lat: () => p.location.lat,
          lng: () => p.location.lng,
        },
      },
    }));

    if (rating) data = data.filter((p) => p.rating >= rating);

    setPlaces(data);
  }, [category, rating, viewport]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  /* ───────── MAP EVENTS ───────── */
  const onIdle = () => {
    const map = mapRef.current;
    if (!map) return;

    const c = map.getCenter();
    const bounds = map.getBounds();

    const radius =
      window.google.maps.geometry.spherical.computeDistanceBetween(
        c,
        bounds.getNorthEast()
      );

    setViewport({
      center: { lat: c.lat(), lng: c.lng() },
      radius,
    });
  };

  /* ───────── SEARCH ───────── */
  const onSearch = () => {
    const res = searchRef.current.getPlaces();
    if (!res?.length) return;

    const loc = res[0].geometry.location;

    const newCenter = {
      lat: loc.lat(),
      lng: loc.lng(),
    };

    setCenter(newCenter);
    setViewport({ center: newCenter, radius: 3000 });
  };

  /* ───────── COST ───────── */
  useEffect(() => {
    if (!selected) return;

    const price = getPrice(selected.price_level) || 15000;
    onVenueCostChange?.(price);
  }, [selected]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", height: 600 }}>

      {/* LEFT LIST */}
      <div style={{ width: 350, overflowY: "auto" }}>
        {places.map((p) => (
          <VenueCard
            key={p.place_id}
            place={p}
            selected={selected?.place_id === p.place_id}
            onClick={() => setSelected(p)}
          />
        ))}
      </div>

      {/* MAP */}
      <div style={{ flex: 1 }}>
        <StandaloneSearchBox
          onLoad={(ref) => (searchRef.current = ref)}
          onPlacesChanged={onSearch}
        >
          <input placeholder="Search location..." />
        </StandaloneSearchBox>

        <GoogleMap
          center={center}
          zoom={13}
          onLoad={(map) => (mapRef.current = map)}
          onIdle={onIdle}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {places.map((p) => {
            const loc = p.geometry.location;

            return (
              <OverlayView
                key={p.place_id}
                position={{ lat: loc.lat(), lng: loc.lng() }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <MapPin
                  place={p}
                  selected={selected?.place_id === p.place_id}
                  onClick={() => setSelected(p)}
                />
              </OverlayView>
            );
          })}
        </GoogleMap>
      </div>
    </div>
  );
}