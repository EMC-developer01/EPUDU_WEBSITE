/**
 * VenueBookingSection.jsx
 * Airbnb / Booking.com-inspired venue discovery UI
 * Uses: @react-google-maps/api  (npm i @react-google-maps/api)
 * APIs: Maps JavaScript API · Places API (New) · Geocoding API
 *
 * Usage:
 *   <VenueBookingSection
 *     googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
 *     onVenueCostChange={(cost) => setVenueCost(cost)}
 *   />
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  OverlayView,
  StandaloneSearchBox,
} from "@react-google-maps/api";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const LIBRARIES = ["places"];
const DEFAULT_CTR = { lat: 17.385, lng: 78.4867 };

const PRICE_PER_DAY = { 0: 8000, 1: 15000, 2: 35000, 3: 75000, 4: 150000 };
const PRICE_PER_HOUR = { 0: 1200, 1: 2500, 2: 5500, 3: 11000, 4: 22000 };
const PRICE_TAG = ["Free", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];
const PRICE_LABEL = ["Free", "Budget", "Moderate", "Upscale", "Luxury"];

const EVENT_TYPES = [
  { id: "all", label: "All Venues", icon: "🏛️", query: "event venue banquet hall" },
  { id: "birthday", label: "Birthday", icon: "🎂", query: "birthday party venue hall" },
  { id: "wedding", label: "Wedding", icon: "💍", query: "wedding banquet hall" },
  { id: "function", label: "Function", icon: "🎊", query: "function hall event space" },
  { id: "reception", label: "Reception", icon: "🥂", query: "reception hall banquet" },
  { id: "outdoor", label: "Outdoor", icon: "🌿", query: "outdoor event lawn garden venue" },
  { id: "resort", label: "Resort", icon: "🏨", query: "resort event venue party" },
  { id: "rooftop", label: "Rooftop", icon: "🌆", query: "rooftop venue terrace party" },
  { id: "corporate", label: "Corporate", icon: "💼", query: "corporate conference event hall" },
  { id: "concert", label: "Concert", icon: "🎵", query: "auditorium concert hall event" },
];

const CITIES = [
  { label: "Hyderabad", center: { lat: 17.385, lng: 78.4867 } },
  { label: "Bangalore", center: { lat: 12.9716, lng: 77.5946 } },
  { label: "Mumbai", center: { lat: 19.076, lng: 72.8777 } },
  { label: "Chennai", center: { lat: 13.0827, lng: 80.2707 } },
  { label: "Delhi", center: { lat: 28.7041, lng: 77.1025 } },
  { label: "Pune", center: { lat: 18.5204, lng: 73.8567 } },
  { label: "Kolkata", center: { lat: 22.5726, lng: 88.3639 } },
];

const RATING_OPTS = [
  { label: "Any", min: 0 },
  { label: "3.0+", min: 3.0 },
  { label: "4.0+", min: 4.0 },
  { label: "4.5+", min: 4.5 },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const parsePriceLevel = (pl) => {
  if (typeof pl === "number") return Math.min(pl, 4);
  return ({
    PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4
  }[pl] ?? 1);
};

const getPhotoUrl = (place, w = 500) => {
  try {
    if (place?._photo?.getURI) return place._photo.getURI({ maxWidth: w });
    if (place?.photos?.[0]?.getUrl) return place.photos[0].getUrl({ maxWidth: w });
  } catch (_) { }
  return `https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=${w}&q=80`;
};

const fmtINR = (n) => "₹" + Number(n).toLocaleString("en-IN");

/* ─── Injected styles ────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@500;600;700&display=swap');

.vbs * { box-sizing: border-box; margin: 0; padding: 0; }
.vbs {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #fff;
  color: #1a1a2e;
  border-radius: 16px;
  border: 1.5px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(0,0,0,0.07);
}

/* TOP BAR */
.vbs-top {
  background: #fff;
  border-bottom: 1.5px solid #f1f5f9;
  padding: 18px 20px 0;
}
.vbs-logo-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
}
.vbs-logo-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #1a1a2e, #2d3a6e);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.vbs-logo-text {
  font-family: 'Lora', serif; font-size: 18px; font-weight: 700;
  color: #1a1a2e; letter-spacing: -0.3px;
}
.vbs-logo-text span { color: #e07b39; }
.vbs-logo-sub { font-size: 11px; color: #9ca3af; margin-left: auto; font-weight: 400; }

/* Mode buttons */
.vbs-modes { display: flex; gap: 6px; margin-bottom: 14px; }
.vbs-mode-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 50px;
  border: 1.5px solid #e5e7eb;
  background: #fff; color: #6b7280;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.18s;
}
.vbs-mode-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
.vbs-mode-btn.active { background: #1a1a2e; border-color: #1a1a2e; color: #fff; }
.vbs-mode-icon { font-size: 15px; }

/* Event chips */
.vbs-ev-label {
  font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
  text-transform: uppercase; color: #9ca3af; margin-bottom: 8px;
}
.vbs-ev-chips {
  display: flex; gap: 6px; overflow-x: auto;
  padding-bottom: 12px; scrollbar-width: none;
}
.vbs-ev-chips::-webkit-scrollbar { display: none; }
.vbs-ev-chip {
  flex-shrink: 0; display: flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 50px;
  border: 1.5px solid #e5e7eb;
  background: #fff; color: #374151;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.vbs-ev-chip:hover { border-color: #1a1a2e; color: #1a1a2e; }
.vbs-ev-chip.active { background: #1a1a2e; border-color: #1a1a2e; color: #fff; font-weight: 700; }

/* Filter row */
.vbs-filter-row {
  display: flex; gap: 8px; padding-bottom: 14px; flex-wrap: wrap; align-items: center;
}
.vbs-search-wrap { position: relative; flex: 1; min-width: 180px; }
.vbs-search-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%); color: #9ca3af; pointer-events: none; font-size: 14px;
}
.vbs-search-input {
  width: 100%; padding: 9px 14px 9px 36px;
  border-radius: 10px; border: 1.5px solid #e5e7eb;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; color: #1a1a2e; background: #f9fafb;
  outline: none; transition: border-color 0.18s;
}
.vbs-search-input:focus { border-color: #1a1a2e; background: #fff; }
.vbs-search-input::placeholder { color: #c4c9d4; }
.vbs-search-input:disabled { opacity: 0.5; cursor: not-allowed; }
.vbs-select {
  padding: 9px 12px; border-radius: 10px; border: 1.5px solid #e5e7eb;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px; color: #374151; background: #fff;
  cursor: pointer; outline: none; font-weight: 500;
  transition: border-color 0.18s;
}
.vbs-select:focus, .vbs-select:hover { border-color: #1a1a2e; }
.vbs-select:disabled { opacity: 0.5; cursor: not-allowed; }
.vbs-select option { background: #fff; }
.vbs-rating-btns { display: flex; gap: 4px; }
.vbs-rating-btn {
  padding: 8px 11px; border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  background: #fff; color: #6b7280;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11px; font-weight: 600; cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.vbs-rating-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
.vbs-rating-btn.active { background: #1a1a2e; border-color: #1a1a2e; color: #e2b96f; }
.vbs-rating-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* BODY */
.vbs-body { display: flex; height: 600px; }

/* Venue list */
.vbs-list {
  width: 380px; flex-shrink: 0; overflow-y: auto;
  background: #fff; border-right: 1.5px solid #f1f5f9; padding: 10px 12px;
}
.vbs-list::-webkit-scrollbar { width: 4px; }
.vbs-list::-webkit-scrollbar-track { background: transparent; }
.vbs-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
.vbs-list-meta {
  font-size: 11px; color: #9ca3af; padding: 2px 0 10px;
  display: flex; align-items: center; justify-content: space-between;
}
.vbs-list-meta strong { color: #1a1a2e; }
.vbs-area-tag {
  background: #eff6ff; color: #1d4ed8; border-radius: 20px;
  padding: 2px 10px; font-size: 10px; font-weight: 600;
}

/* Venue card */
.vbs-card {
  display: flex; gap: 0; border-radius: 12px; overflow: hidden;
  border: 1.5px solid #f1f5f9; margin-bottom: 8px; cursor: pointer;
  background: #fff; transition: all 0.17s; position: relative;
}
.vbs-card:hover { border-color: #d1d5db; box-shadow: 0 2px 14px rgba(0,0,0,0.07); }
.vbs-card.selected { border-color: #1a1a2e; box-shadow: 0 4px 20px rgba(26,26,46,0.12); }
.vbs-card-selected-bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: #e07b39; border-radius: 3px 0 0 3px; z-index: 1;
}
.vbs-card-img-overflow { overflow: hidden; width: 112px; height: 112px; flex-shrink: 0; position: relative; }
.vbs-card-img { width: 112px; height: 112px; object-fit: cover; display: block; transition: transform 0.3s; }
.vbs-card:hover .vbs-card-img { transform: scale(1.05); }
.vbs-card-badge {
  position: absolute; top: 7px; left: 7px;
  background: rgba(26,26,46,0.78); color: #e2b96f;
  font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px;
  backdrop-filter: blur(4px);
}
.vbs-card-body {
  padding: 10px 12px; flex: 1; min-width: 0;
  display: flex; flex-direction: column; justify-content: space-between;
}
.vbs-card-name {
  font-size: 13px; font-weight: 700; color: #1a1a2e; line-height: 1.35; margin-bottom: 3px;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.vbs-card-addr {
  font-size: 11px; color: #9ca3af;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;
}
.vbs-card-row { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-bottom: 3px; }
.vbs-rating-badge {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 800;
}
.vbs-rating-badge.high { background: #dcfce7; color: #15803d; }
.vbs-rating-badge.med  { background: #fef9c3; color: #92400e; }
.vbs-rating-badge.low  { background: #fee2e2; color: #991b1b; }
.vbs-reviews { font-size: 10px; color: #9ca3af; }
.vbs-open-tag { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 5px; }
.vbs-open-tag.open   { background: #dcfce7; color: #15803d; }
.vbs-open-tag.closed { background: #fee2e2; color: #991b1b; }
.vbs-card-price { font-size: 12px; font-weight: 700; color: #1a1a2e; display: flex; align-items: center; gap: 4px; }
.vbs-card-price span { color: #9ca3af; font-weight: 400; }

/* Skeletons */
.vbs-skeleton {
  border-radius: 12px; overflow: hidden; border: 1.5px solid #f1f5f9;
  margin-bottom: 8px; display: flex; animation: vbsPulse 1.4s ease-in-out infinite;
}
@keyframes vbsPulse { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
.vbs-sk-img { width: 112px; height: 112px; background: #f3f4f6; flex-shrink: 0; }
.vbs-sk-body { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.vbs-sk-line { border-radius: 4px; background: #f3f4f6; }

/* Empty */
.vbs-empty { text-align: center; padding: 48px 20px; color: #9ca3af; }
.vbs-empty-icon { font-size: 36px; margin-bottom: 10px; }
.vbs-empty-title { font-size: 14px; font-weight: 700; color: #374151; margin-bottom: 4px; }
.vbs-empty-sub { font-size: 12px; line-height: 1.7; }

/* MAP PANEL */
.vbs-map-panel { flex: 1; position: relative; background: #f3f4f6; }
.vbs-map-wrap { width: 100%; height: 100%; }

/* Map legend */
.vbs-map-legend {
  position: absolute; top: 14px; left: 14px;
  background: rgba(255,255,255,0.96); border: 1px solid #e5e7eb; border-radius: 10px;
  padding: 8px 14px; font-size: 11px; color: #374151;
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1); pointer-events: none; font-weight: 500;
}
.vbs-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* Map Pin */
.vbs-pin-wrap {
  position: relative; cursor: pointer;
  transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), opacity 0.2s ease;
  transform-origin: bottom center;
}
.vbs-pin-bubble {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 11px; border-radius: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11px; font-weight: 800; white-space: nowrap; line-height: 1;
}
.vbs-pin-tail {
  width: 0; height: 0;
  border-left: 5px solid transparent; border-right: 5px solid transparent;
  margin: 0 auto; margin-top: -1px;
}
.vbs-pin-pulse {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -62%);
  width: 48px; height: 28px; border-radius: 14px;
  border: 2.5px solid rgba(224,123,57,0.5);
  pointer-events: none;
  animation: vbsMapPulse 1.8s ease-out infinite;
}
@keyframes vbsMapPulse {
  0%   { transform: translate(-50%,-62%) scale(1);   opacity: 0.8; }
  70%  { transform: translate(-50%,-62%) scale(1.75); opacity: 0; }
  100% { transform: translate(-50%,-62%) scale(1.75); opacity: 0; }
}

/* DETAIL PANEL */
.vbs-detail {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: clamp(280px, 36%, 360px);
  background: #fff; box-shadow: -6px 0 32px rgba(26,26,46,0.12);
  display: flex; flex-direction: column; z-index: 20;
  border-radius: 0 0 14px 0; overflow: hidden;
}
.vbs-detail-hero { position: relative; flex-shrink: 0; }
.vbs-detail-hero img { width: 100%; height: 190px; object-fit: cover; display: block; }
.vbs-detail-close {
  position: absolute; top: 10px; left: 10px;
  background: rgba(0,0,0,0.55); border: none; border-radius: 50%;
  width: 30px; height: 30px; color: #fff; font-size: 17px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.vbs-detail-hero-badge {
  position: absolute; bottom: 10px; left: 10px;
  background: rgba(26,26,46,0.75); color: #e2b96f;
  padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;
  backdrop-filter: blur(4px);
}
.vbs-detail-body { flex: 1; overflow-y: auto; padding: 16px; }
.vbs-detail-body::-webkit-scrollbar { width: 3px; }
.vbs-detail-body::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
.vbs-detail-name {
  font-family: 'Lora', serif; font-size: 17px; font-weight: 700;
  color: #1a1a2e; line-height: 1.3; margin-bottom: 5px;
}
.vbs-detail-addr {
  display: flex; gap: 5px; align-items: flex-start;
  font-size: 11px; color: #6b7280; margin-bottom: 10px; line-height: 1.55;
}
.vbs-detail-stats { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; flex-wrap: wrap; }
.vbs-divider { border: none; border-top: 1.5px solid #f1f5f9; margin: 12px 0; }
.vbs-detail-section-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: #9ca3af; margin-bottom: 10px;
}
.vbs-booking-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.vbs-booking-tab {
  flex: 1; padding: 9px; border-radius: 10px;
  border: 1.5px solid #e5e7eb; background: #fff;
  color: #6b7280; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px; font-weight: 700; cursor: pointer;
  transition: all 0.15s; text-align: center;
}
.vbs-booking-tab:hover { border-color: #1a1a2e; color: #1a1a2e; }
.vbs-booking-tab.active { background: #1a1a2e; border-color: #1a1a2e; color: #e2b96f; }
.vbs-duration-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
.vbs-dur-chip {
  padding: 6px 12px; border-radius: 8px;
  border: 1.5px solid #e5e7eb; background: #fff;
  color: #6b7280; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;
}
.vbs-dur-chip:hover { border-color: #374151; color: #1a1a2e; }
.vbs-dur-chip.active { background: #f8fafc; border-color: #1a1a2e; color: #1a1a2e; font-weight: 700; }
.vbs-cost-box {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d3a6e 100%);
  border-radius: 12px; padding: 14px 16px;
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
}
.vbs-cost-label { color: rgba(255,255,255,0.55); font-size: 10px; margin-bottom: 3px; }
.vbs-cost-breakdown { color: rgba(255,255,255,0.7); font-size: 10px; }
.vbs-cost-value { color: #fff; font-size: 22px; font-weight: 800; font-family: 'Lora', serif; }
.vbs-cost-sub { color: #e2b96f; font-size: 10px; margin-top: 1px; }
.vbs-book-btn {
  width: 100%; padding: 13px; background: #e07b39; border: none; border-radius: 10px;
  color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; font-weight: 800; cursor: pointer;
  letter-spacing: 0.2px; transition: background 0.18s, transform 0.1s;
}
.vbs-book-btn:hover { background: #c96a28; transform: translateY(-1px); }
.vbs-book-btn:active { transform: translateY(0); }

/* Location mode */
.vbs-loc-panel {
  width: 380px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  background: #f9fafb; border-right: 1.5px solid #f1f5f9; padding: 20px;
}
.vbs-loc-card {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 16px;
  padding: 28px 24px; width: 100%; text-align: center;
}
.vbs-loc-card-icon { font-size: 42px; margin-bottom: 14px; }
.vbs-loc-card-title {
  font-family: 'Lora', serif; font-size: 18px; font-weight: 700;
  color: #1a1a2e; margin-bottom: 6px;
}
.vbs-loc-card-sub { font-size: 13px; color: #6b7280; line-height: 1.65; margin-bottom: 20px; }
.vbs-gps-btn {
  width: 100%; padding: 12px; background: #1a1a2e; border: none; border-radius: 10px;
  color: #e2b96f; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background 0.18s; margin-bottom: 10px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.vbs-gps-btn:hover { background: #2d3a6e; }
.vbs-gps-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.vbs-loc-divider {
  display: flex; align-items: center; gap: 10px;
  color: #d1d5db; font-size: 11px; margin: 8px 0 10px;
}
.vbs-loc-divider::before, .vbs-loc-divider::after {
  content: ''; flex: 1; height: 1px; background: #f1f5f9;
}
.vbs-loc-input-wrap { position: relative; }
.vbs-loc-input {
  width: 100%; padding: 12px 56px 12px 14px;
  border-radius: 10px; border: 1.5px solid #e5e7eb;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #1a1a2e;
  outline: none; transition: border-color 0.18s; background: #f9fafb;
}
.vbs-loc-input:focus { border-color: #1a1a2e; background: #fff; }
.vbs-loc-input::placeholder { color: #c4c9d4; }
.vbs-loc-go {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: #1a1a2e; color: #e2b96f; border: none; border-radius: 7px;
  padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.15s;
}
.vbs-loc-go:hover { background: #2d3a6e; }
.vbs-loc-success {
  margin-top: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
  padding: 9px 12px; font-size: 12px; color: #15803d; text-align: left;
  display: flex; gap: 7px; align-items: flex-start; line-height: 1.5;
}
.vbs-loc-error { margin-top: 8px; font-size: 12px; color: #dc2626; }

/* Preferred pin */
.vbs-pref-pin {
  width: 24px; height: 24px; background: #e07b39; border: 3px solid #1a1a2e;
  border-radius: 50% 50% 50% 0; transform: rotate(-45deg) translate(-50%,-50%);
  box-shadow: 0 3px 12px rgba(224,123,57,0.5);
}
.vbs-pref-cost-badge {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  background: #1a1a2e; color: #e2b96f; padding: 9px 20px; border-radius: 50px;
  font-size: 12px; font-weight: 800; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  white-space: nowrap;
}
.vbs-map-hint {
  position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
  background: rgba(26,26,46,0.88); color: #fff; padding: 8px 20px; border-radius: 50px;
  font-size: 12px; font-weight: 600; pointer-events: none; white-space: nowrap;
}

/* Prompt */
.vbs-prompt {
  width: 380px; flex-shrink: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 32px; text-align: center;
  background: #f9fafb; border-right: 1.5px solid #f1f5f9;
}
.vbs-prompt-icon { font-size: 52px; margin-bottom: 14px; }
.vbs-prompt-title {
  font-family: 'Lora', serif; font-size: 19px; font-weight: 700;
  color: #1a1a2e; margin-bottom: 6px;
}
.vbs-prompt-sub { font-size: 13px; color: #9ca3af; line-height: 1.7; }

/* SB wrap */
.vbs-sb-outer { position: relative; padding: 0 0 14px; }
.vbs-sb-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-60%);
  pointer-events: none; font-size: 13px; z-index: 1;
}
.vbs-sb-input {
  width: 100%; padding: 10px 14px 10px 36px;
  border-radius: 10px; border: 1.5px solid #e5e7eb;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; color: #1a1a2e; outline: none; background: #f9fafb;
}
.vbs-sb-input:focus { border-color: #1a1a2e; background: #fff; }
`;

/* ─── Rating Badge ───────────────────────────────────────────────────────── */
function RatingBadge({ rating }) {
  if (!rating) return null;
  const cls = rating >= 4 ? "high" : rating >= 3 ? "med" : "low";
  return <span className={`vbs-rating-badge ${cls}`}>★ {rating.toFixed(1)}</span>;
}

/* ─── Map Pin ────────────────────────────────────────────────────────────── */
function MapPin({ place, isSelected, isHovered, isDimmed, onClick }) {
  const pl = parsePriceLevel(place.price_level);
  const label = PRICE_TAG[pl] || "₹";
  const bg = isSelected ? "#16a34a" : "#ef4444"; // green / red
  const fg = "#fff";
  const border = isSelected ? "#15803d" : "#dc2626";

  return (
    <div
      className="vbs-pin-wrap"
      onClick={onClick}
      style={{
        transform: `scale(${isSelected ? 1.35 : isHovered ? 1.1 : 1}) translateY(${isSelected ? -5 : 0}px)`,
        opacity: isDimmed ? 0.2 : 1,
        zIndex: isSelected ? 100 : isHovered ? 50 : 1,
      }}
    >
      {isSelected && <div className="vbs-pin-pulse" />}
      <div
        className="vbs-pin-bubble"
        style={{
          background: bg, color: fg, border: `2px solid ${border}`,
          boxShadow: isSelected
            ? "0 6px 22px rgba(224,123,57,0.45)"
            : isHovered ? "0 3px 12px rgba(26,26,46,0.2)" : "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        {isSelected && <span style={{ fontSize: 9 }}>●</span>}
        {label}
      </div>
      <div className="vbs-pin-tail" style={{ borderTop: `6px solid ${border}` }} />
    </div>
  );
}

/* ─── Venue Card ─────────────────────────────────────────────────────────── */
function VenueCard({ place, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave }) {
  const pl = parsePriceLevel(place.price_level);
  const isOpen = place.opening_hours?.isOpen?.() ?? null;
  return (
    <div
      className={`vbs-card${isSelected ? " selected" : ""}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-id={place.place_id}
    >
      {isSelected && <div className="vbs-card-selected-bar" />}
      <div className="vbs-card-img-overflow">
        <img
          className="vbs-card-img"
          src={getPhotoUrl(place, 300)}
          alt={place.name}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300&q=80"; }}
        />
        <div className="vbs-card-badge">{PRICE_TAG[pl]}</div>
      </div>
      <div className="vbs-card-body">
        <div className="vbs-card-name">{place.name}</div>
        <div className="vbs-card-addr">📍 {place.formatted_address || place.vicinity || "—"}</div>
        <div className="vbs-card-row">
          <RatingBadge rating={place.rating} />
          {place.user_ratings_total && (
            <span className="vbs-reviews">({place.user_ratings_total.toLocaleString("en-IN")})</span>
          )}
          {place.opening_hours != null && (
            <span className={`vbs-open-tag ${isOpen ? "open" : "closed"}`}>
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>
        <div className="vbs-card-price">
          {fmtINR(PRICE_PER_DAY[pl] ?? 15000)}<span>/ day</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="vbs-skeleton">
      <div className="vbs-sk-img" />
      <div className="vbs-sk-body">
        <div className="vbs-sk-line" style={{ height: 13, width: "72%" }} />
        <div className="vbs-sk-line" style={{ height: 10, width: "88%" }} />
        <div className="vbs-sk-line" style={{ height: 10, width: "52%" }} />
        <div className="vbs-sk-line" style={{ height: 11, width: "38%" }} />
      </div>
    </div>
  );
}

/* ─── Detail Panel ───────────────────────────────────────────────────────── */
function DetailPanel({ place, onClose, onBook, bookingType, setBookingType, hours, setHours, days, setDays }) {
  if (!place) return null;
  const pl = parsePriceLevel(place.price_level);
  const dayRate = PRICE_PER_DAY[pl] ?? 15000;
  const hrRate = PRICE_PER_HOUR[pl] ?? 2500;
  const isOpen = place.opening_hours?.isOpen?.();
  const cost = bookingType === "day" ? dayRate * days : hrRate * hours;

  return (
    <div className="vbs-detail">
      <div className="vbs-detail-hero">
        <img
          src={getPhotoUrl(place, 800)}
          alt={place.name}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"; }}
        />
        <button className="vbs-detail-close" onClick={onClose}>‹</button>
        <div className="vbs-detail-hero-badge">{PRICE_TAG[pl]} · {PRICE_LABEL[pl]}</div>
      </div>
      <div className="vbs-detail-body">
        <div className="vbs-detail-name">{place.name}</div>
        <div className="vbs-detail-addr">
          <span>📍</span>
          <span>{place.formatted_address || place.vicinity || "Address unavailable"}</span>
        </div>
        <div className="vbs-detail-stats">
          <RatingBadge rating={place.rating} />
          {place.user_ratings_total && (
            <span className="vbs-reviews">{place.user_ratings_total.toLocaleString("en-IN")} reviews</span>
          )}
          {place.opening_hours != null && (
            <span className={`vbs-open-tag ${isOpen ? "open" : "closed"}`}>
              {isOpen ? "Open now" : "Closed"}
            </span>
          )}
        </div>

        <hr className="vbs-divider" />
        <div className="vbs-detail-section-label">Booking Duration</div>

        <div className="vbs-booking-tabs">
          {[{ key: "hour", label: "⏱ Hourly" }, { key: "day", label: "📅 Full Day" }].map((t) => (
            <button
              key={t.key}
              className={`vbs-booking-tab${bookingType === t.key ? " active" : ""}`}
              onClick={() => setBookingType(t.key)}
            >{t.label}</button>
          ))}
        </div>

        {bookingType === "hour" && (
          <div className="vbs-duration-chips">
            {[2, 4, 6, 8, 12].map(h => (
              <button key={h} className={`vbs-dur-chip${hours === h ? " active" : ""}`} onClick={() => setHours(h)}>{h}h</button>
            ))}
          </div>
        )}
        {bookingType === "day" && (
          <div className="vbs-duration-chips">
            {[1, 2, 3, 5, 7].map(d => (
              <button key={d} className={`vbs-dur-chip${days === d ? " active" : ""}`} onClick={() => setDays(d)}>{d}d</button>
            ))}
          </div>
        )}

        <div className="vbs-cost-box">
          <div>
            <div className="vbs-cost-label">Estimated cost</div>
            <div className="vbs-cost-breakdown">
              {bookingType === "day"
                ? `${days} day${days > 1 ? "s" : ""} × ${fmtINR(dayRate)}`
                : `${hours} hr${hours > 1 ? "s" : ""} × ${fmtINR(hrRate)}`}
            </div>
          </div>
          <div>
            <div className="vbs-cost-value">{fmtINR(cost)}</div>
            <div className="vbs-cost-sub">+ taxes</div>
          </div>
        </div>

        <button className="vbs-book-btn" onClick={() => onBook(place, cost)}>
          Request to Book →
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function VenueBookingSection({ googleMapsApiKey, onVenueCostChange }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || "",
    libraries: LIBRARIES,
  });

  const [mode, setMode] = useState("browse");
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [minRating, setMinRating] = useState(0);
  const [searchText, setSearchText] = useState("");

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CTR);
  const [mapZoom, setMapZoom] = useState(12);
  const [areaName, setAreaName] = useState("");

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const [bookingType, setBookingType] = useState("day");
  const [hours, setHours] = useState(4);
  const [days, setDays] = useState(1);

  const [sbRef, setSbRef] = useState(null);
  const [prefPin, setPrefPin] = useState(null);
  const [prefAddress, setPrefAddress] = useState("");
  const [locStatus, setLocStatus] = useState("idle");
  const [manualAddr, setManualAddr] = useState("");

  const mapRef = useRef(null);
  const listRef = useRef(null);
  const isFetching = useRef(false);

  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  /* Cost */
  const venueCost = (() => {
    if (mode === "location" && prefPin) return 3000;
    if (!selectedPlace) return 0;
    const pl = parsePriceLevel(selectedPlace.price_level);
    return bookingType === "day"
      ? (PRICE_PER_DAY[pl] ?? 15000) * days
      : (PRICE_PER_HOUR[pl] ?? 2500) * hours;
  })();
  useEffect(() => {
    onVenueCostChange?.(venueCost);
  }, [venueCost, onVenueCostChange]);

  useEffect(() => {
    if (activeEvent && mapRef.current) {
      mapRef.current.panTo(activeCity.center);
      mapRef.current.setZoom(12);
    }
  }, [activeEvent]);

  /* Reverse geocode */
  const reverseGeocode = useCallback((latlng) => {
    if (!window.google?.maps) return;
    new window.google.maps.Geocoder().geocode({ location: latlng }, (res, st) => {
      if (st === "OK" && res[0]) {
        const c = res[0].address_components.find(x =>
          x.types.includes("sublocality") || x.types.includes("locality")
        );
        if (c) setAreaName(c.long_name);
      }
    });
  }, []);

  /* Fetch venues — Places API New */
  const fetchPlacesByBounds = useCallback(async () => {
    if (!window.google?.maps?.places?.Place || !mapRef.current || isFetching.current) return;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const ev = EVENT_TYPES.find(e => e.id === activeEvent) || EVENT_TYPES[0];
    const query = [searchText, ev.query].filter(Boolean).join(" ");

    isFetching.current = true;
    setLoading(true);

    try {
      const { places: raw } = await window.google.maps.places.Place.searchByText({
        textQuery: query,
        fields: [
          "id", "displayName", "formattedAddress",
          "location", "rating", "userRatingCount",
          "priceLevel", "photos", "regularOpeningHours"
        ],
        locationRestriction: {
          rectangle: {
            low: { lat: sw.lat(), lng: sw.lng() },
            high: { lat: ne.lat(), lng: ne.lng() }
          }
        },
        maxResultCount: 30
      });

      let list = (raw || []).map(p => ({
        place_id: p.id,
        name: p.displayName || "Unknown",
        formatted_address: p.formattedAddress || "",
        rating: p.rating || 0,
        user_ratings_total: p.userRatingCount || 0,
        price_level: parsePriceLevel(p.priceLevel ?? ""),
        photos: p.photos || [],
        opening_hours: p.regularOpeningHours || null,
        _photo: p.photos?.[0] ?? null,
        geometry: {
          location: {
            lat: () => p.location?.lat ?? 0,
            lng: () => p.location?.lng ?? 0,
          },
        },
      }));

      if (minRating > 0) {
        list = list.filter(p => (p.rating || 0) >= minRating);
      }

      setPlaces(list);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [activeEvent, searchText, minRating]);

  // useEffect(() => {
  //   if (mode !== "browse" || !isLoaded || !activeEvent) return;

  //   const t = setTimeout(() => {
  //     fetchPlacesByBounds(); // ✅ FIXED
  //   }, 350);

  //   return () => clearTimeout(t);
  // }, [activeEvent, activeCity, minRating, searchText, mode, isLoaded, fetchPlacesByBounds]);

  /* GPS */
  const handleGPS = () => {
    setLocStatus("loading");
    if (!navigator.geolocation) { setLocStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPrefPin(latlng); setMapCenter(latlng); setMapZoom(15);
        new window.google.maps.Geocoder().geocode({ location: latlng }, (res, st) => {
          setPrefAddress(st === "OK" && res[0] ? res[0].formatted_address : `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
        });
        setLocStatus("done");
      },
      () => setLocStatus("error")
    );
  };

  /* Manual address */
  const handleManualAddr = () => {
    if (!manualAddr.trim() || !window.google) return;
    new window.google.maps.Geocoder().geocode({ address: manualAddr }, (res, st) => {
      if (st === "OK" && res[0]) {
        const loc = res[0].geometry.location;
        const latlng = { lat: loc.lat(), lng: loc.lng() };
        setPrefPin(latlng); setMapCenter(latlng); setMapZoom(15);
        setPrefAddress(res[0].formatted_address); setLocStatus("done"); setManualAddr("");
      }
    });
  };

  /* Map click pin */
  const handleMapClick = (e) => {
    if (mode !== "location") return;
    const lat = e.latLng.lat(), lng = e.latLng.lng();
    setPrefPin({ lat, lng });
    new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (res, st) => {
      setPrefAddress(st === "OK" && res[0] ? res[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setLocStatus("done");
    });
  };

  /* StandaloneSearchBox */
  const onSBLoad = (r) => setSbRef(r);
  const onSBChanged = () => {
    if (!sbRef) return;
    const r = sbRef.getPlaces();
    if (r?.length) {
      const p = r[0], lat = p.geometry.location.lat(), lng = p.geometry.location.lng();
      setPrefPin({ lat, lng }); setMapCenter({ lat, lng }); setMapZoom(15);
      setPrefAddress(p.formatted_address); setLocStatus("done");
    }
  };

  /* Scroll card into view */
  useEffect(() => {
    if (!selectedPlace || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selectedPlace.place_id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedPlace]);

  const handleBook = (place, cost) => {
    onVenueCostChange?.(cost);
    console.log("Booked:", place.name, fmtINR(cost));
  };

  if (loadError) return (
    <div style={{ padding: 40, textAlign: "center", color: "#ef4444", fontFamily: "sans-serif" }}>
      ❌ Maps failed to load. Check API key and enable billing.
    </div>
  );
  if (!isLoaded) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>🗺️</div>Loading map…
    </div>
  );

  const showPrompt = mode === "browse" && !activeEvent;

  return (
    <>
      <style>{CSS}</style>
      <div className="vbs">

        {/* ── TOP BAR ── */}
        <div className="vbs-top">
          <div className="vbs-logo-row">
            <div className="vbs-logo-icon">🏛️</div>
            <div className="vbs-logo-text">Venue<span>Scout</span></div>
            <div className="vbs-logo-sub">Discover & book extraordinary spaces</div>
          </div>

          <div className="vbs-modes">
            <button className={`vbs-mode-btn${mode === "browse" ? " active" : ""}`}
              onClick={() => { setMode("browse"); setSelectedPlace(null); }}>
              <span className="vbs-mode-icon">🏛️</span> Browse Venues
            </button>
            <button className={`vbs-mode-btn${mode === "location" ? " active" : ""}`}
              onClick={() => { setMode("location"); setSelectedPlace(null); }}>
              <span className="vbs-mode-icon">📍</span> Pin My Location
            </button>
          </div>

          {mode === "browse" && (<>
            <div className="vbs-ev-label">Select Event Type</div>
            <div className="vbs-ev-chips">
              {EVENT_TYPES.map(ev => (
                <button key={ev.id}
                  className={`vbs-ev-chip${activeEvent === ev.id ? " active" : ""}`}
                  onClick={() => setActiveEvent(ev.id)}>
                  <span>{ev.icon}</span>{ev.label}
                </button>
              ))}
            </div>
            <div className="vbs-filter-row">
              <div className="vbs-search-wrap">
                <span className="vbs-search-icon">🔍</span>
                <input className="vbs-search-input" type="text" value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Search by name, place or area…"
                  disabled={!activeEvent} />
              </div>
              <select className="vbs-select" value={activeCity.label}
                onChange={e => { const c = CITIES.find(x => x.label === e.target.value); if (c) setActiveCity(c); }}
                disabled={!activeEvent}>
                {CITIES.map(c => <option key={c.label}>{c.label}</option>)}
              </select>
              <div className="vbs-rating-btns">
                {RATING_OPTS.map(r => (
                  <button key={r.min}
                    className={`vbs-rating-btn${minRating === r.min ? " active" : ""}`}
                    onClick={() => setMinRating(r.min)}
                    disabled={!activeEvent}>
                    {r.label === "Any" ? "Any ★" : `★ ${r.label}`}
                  </button>
                ))}
              </div>
            </div>
          </>)}

          {mode === "location" && (
            <div className="vbs-sb-outer">
              <span className="vbs-sb-icon">🔍</span>
              <StandaloneSearchBox onLoad={onSBLoad} onPlacesChanged={onSBChanged}>
                <input className="vbs-sb-input" type="text"
                  placeholder="Search and pin your event location…" />
              </StandaloneSearchBox>
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="vbs-body">

          {/* Left: list */}
          {mode === "browse" && !showPrompt && (
            <div className="vbs-list" ref={listRef}>
              <div className="vbs-list-meta">
                <span>
                  {loading ? "Searching…"
                    : <><strong>{places.length}</strong> venue{places.length !== 1 ? "s" : ""} found</>}
                </span>
                {areaName && <span className="vbs-area-tag">📍 {areaName}</span>}
              </div>
              {loading && [1, 2, 3, 4, 5].map(i => <Skeleton key={i} />)}
              {!loading && places.length === 0 && (
                <div className="vbs-empty">
                  <div className="vbs-empty-icon">🔍</div>
                  <div className="vbs-empty-title">No venues found</div>
                  <div className="vbs-empty-sub">Try a different event type, city, or clear the rating filter.</div>
                </div>
              )}
              {!loading && places.map(place => (
                <VenueCard key={place.place_id} place={place}
                  isSelected={selectedPlace?.place_id === place.place_id}
                  isHovered={hoveredId === place.place_id}
                  onClick={() => {
                    if (selectedPlace?.place_id === place.place_id) {
                      setSelectedPlace(null);
                    } else {
                      setSelectedPlace(place);
                      const loc = place.geometry?.location;
                      if (loc) { setMapCenter({ lat: loc.lat(), lng: loc.lng() }); setMapZoom(15); }
                    }
                  }}
                  onMouseEnter={() => setHoveredId(place.place_id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              ))}
            </div>
          )}

          {/* Left: event prompt */}
          {showPrompt && (
            <div className="vbs-prompt">
              <div className="vbs-prompt-icon">🎪</div>
              <div className="vbs-prompt-title">What's the occasion?</div>
              <div className="vbs-prompt-sub">
                Pick an event type above to discover perfect venues near you — with real photos, ratings and pricing.
              </div>
            </div>
          )}

          {/* Left: location */}
          {mode === "location" && (
            <div className="vbs-loc-panel">
              <div className="vbs-loc-card">
                <div className="vbs-loc-card-icon">📍</div>
                <div className="vbs-loc-card-title">Set Your Location</div>
                <div className="vbs-loc-card-sub">
                  Auto-detect with GPS, type an address, or click the map to drop a pin.
                </div>
                <button className="vbs-gps-btn" onClick={handleGPS} disabled={locStatus === "loading"}>
                  <span>🎯</span>
                  {locStatus === "loading" ? "Detecting…" : "Use My Current Location"}
                </button>
                <div className="vbs-loc-divider">or type manually</div>
                <div className="vbs-loc-input-wrap">
                  <input className="vbs-loc-input" type="text" value={manualAddr}
                    onChange={e => setManualAddr(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleManualAddr()}
                    placeholder="e.g. Jubilee Hills, Hyderabad" />
                  <button className="vbs-loc-go" onClick={handleManualAddr}>Go</button>
                </div>
                {locStatus === "done" && prefAddress && (
                  <div className="vbs-loc-success">
                    <span>✅</span>
                    <span><strong>Pinned:</strong> {prefAddress}<br />Flat fee: <strong>₹3,000</strong></span>
                  </div>
                )}
                {locStatus === "error" && (
                  <div className="vbs-loc-error">⚠ Location denied. Please type your address above.</div>
                )}
              </div>
            </div>
          )}

          {/* Right: map */}
          <div className="vbs-map-panel">
            <GoogleMap
              zoom={mapZoom}
              center={mapCenter}
              onLoad={onMapLoad}
              onIdle={() => {
                if (!isFetching.current) {
                  fetchPlacesByBounds();
                  reverseGeocode(mapRef.current.getCenter().toJSON());
                }
              }}
              onClick={mode === "location" ? handleMapClick : undefined}
              mapContainerClassName="vbs-map-wrap"
              options={{
                styles: MAP_STYLE,
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                clickableIcons: false,
              }}
            >
              {/* Venue pins */}
              {mode === "browse" && places.map(place => {
                const loc = place.geometry?.location;
                if (!loc) return null;
                const isSelected = selectedPlace?.place_id === place.place_id;
                const isDimmed = !!selectedPlace && !isSelected;
                return (
                  <OverlayView key={place.place_id}
                    position={{ lat: loc.lat(), lng: loc.lng() }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                    <MapPin place={place} isSelected={isSelected}
                      isHovered={hoveredId === place.place_id} isDimmed={isDimmed}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPlace(null); setMapCenter(activeCity.center); setMapZoom(12);
                        } else {
                          setSelectedPlace(place);
                          setMapCenter({ lat: loc.lat(), lng: loc.lng() }); setMapZoom(15);
                        }
                      }} />
                  </OverlayView>
                );
              })}

              {/* Preferred pin */}
              {mode === "location" && prefPin && (
                <OverlayView position={prefPin} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                  <div className="vbs-pref-pin" />
                </OverlayView>
              )}
            </GoogleMap>

            {/* Map legend */}
            {mode === "browse" && places.length > 0 && (
              <div className="vbs-map-legend">
                <div className="vbs-legend-dot" style={{ background: "#1a1a2e" }} />
                <span>Available</span>
                <div className="vbs-legend-dot" style={{ background: "#e07b39", marginLeft: 4 }} />
                <span>Selected</span>
                <span style={{ marginLeft: 6, color: "#d1d5db" }}>·</span>
                <span style={{ color: "#9ca3af" }}>{places.length} pins</span>
              </div>
            )}

            {mode === "location" && !prefPin && <div className="vbs-map-hint">📍 Click anywhere to pin your location</div>}
            {mode === "location" && prefPin && <div className="vbs-pref-cost-badge">📍 Preferred Location · ₹3,000 flat fee</div>}

            {/* Detail panel */}
            {mode === "browse" && selectedPlace && (
              <DetailPanel place={selectedPlace}
                onClose={() => { setSelectedPlace(null); setMapCenter(activeCity.center); setMapZoom(12); }}
                onBook={handleBook}
                bookingType={bookingType} setBookingType={setBookingType}
                hours={hours} setHours={setHours}
                days={days} setDays={setDays} />
            )}

            <style>{`
              @keyframes vbsMapPulse {
                0%   { transform: translate(-50%,-62%) scale(1);    opacity: 0.75; }
                70%  { transform: translate(-50%,-62%) scale(1.8);  opacity: 0;   }
                100% { transform: translate(-50%,-62%) scale(1.8);  opacity: 0;   }
              }
            `}</style>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Clean Map Style ────────────────────────────────────────────────────── */
const MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#adb5bd" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#f4f5f7" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e9ecef" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#868e96" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c8dff4" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8f9fa" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e9f5ec" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#dee2e6" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#495057" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#1a1a2e" }] },
];