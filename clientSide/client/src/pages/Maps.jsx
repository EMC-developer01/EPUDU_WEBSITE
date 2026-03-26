import { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Maps Loader ───────────────────────────────────────────────────────
const loadGoogleMaps = (() => {
  let promise = null;
  return () => {
    if (!promise) {
      promise = new Promise((resolve, reject) => {
        if (window.google?.maps) return resolve(window.google.maps);
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return promise;
  };
})();

// ─── Event Types ─────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id: "birthday", label: "Birthday", icon: "🎂", query: "birthday party venue" },
  { id: "wedding", label: "Wedding", icon: "💍", query: "wedding venue banquet hall" },
  { id: "corporate", label: "Corporate", icon: "💼", query: "corporate event space conference hall" },
  { id: "function", label: "Function", icon: "🎊", query: "function hall event venue" },
  { id: "reception", label: "Reception", icon: "🥂", query: "reception hall banquet" },
  { id: "conference", label: "Conference", icon: "🎤", query: "conference center meeting hall" },
  { id: "concert", label: "Concert", icon: "🎵", query: "concert hall auditorium event space" },
  { id: "exhibition", label: "Exhibition", icon: "🖼️", query: "exhibition hall gallery space" },
];

const CITY_FILTERS = ["All Cities", "Hyderabad", "Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Kolkata"];
const RATING_FILTERS = ["All Ratings", "4.5+", "4.0+", "3.5+", "3.0+"];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0d0f14;
    --surface: #161a22;
    --surface2: #1e2330;
    --surface3: #252d3d;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --gold: #c9a84c;
    --gold-light: #e8c96a;
    --gold-dim: rgba(201,168,76,0.15);
    --text: #f0ede8;
    --text-muted: #8a8fa0;
    --text-dim: #5a5f70;
    --accent: #3d7bf5;
    --accent-dim: rgba(61,123,245,0.15);
    --green: #22c55e;
    --red: #ef4444;
    --radius: 14px;
    --radius-sm: 8px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --shadow-gold: 0 4px 24px rgba(201,168,76,0.2);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .vbs-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .vbs-header {
    padding: 28px 40px 20px;
    background: linear-gradient(180deg, rgba(201,168,76,0.06) 0%, transparent 100%);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .vbs-logo {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: -0.5px;
  }
  .vbs-logo span { color: var(--text); font-weight: 400; }
  .vbs-tagline {
    font-size: 13px;
    color: var(--text-muted);
    margin-left: auto;
  }

  /* ── Mode Toggle ── */
  .vbs-mode-bar {
    padding: 20px 40px 0;
    display: flex;
    gap: 12px;
  }
  .vbs-mode-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border-radius: 50px;
    border: 1.5px solid var(--border2);
    background: var(--surface);
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .vbs-mode-btn:hover { border-color: var(--gold); color: var(--text); }
  .vbs-mode-btn.active {
    background: var(--gold-dim);
    border-color: var(--gold);
    color: var(--gold);
  }
  .vbs-mode-btn svg { width: 18px; height: 18px; }

  /* ── Event Type Selector ── */
  .vbs-event-section {
    padding: 24px 40px 0;
  }
  .vbs-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 14px;
  }
  .vbs-event-grid {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .vbs-event-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 50px;
    border: 1.5px solid var(--border2);
    background: var(--surface);
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .vbs-event-chip:hover { border-color: var(--gold-light); color: var(--text); background: var(--surface2); }
  .vbs-event-chip.active {
    background: var(--gold);
    border-color: var(--gold);
    color: #0d0f14;
    font-weight: 600;
    box-shadow: var(--shadow-gold);
  }
  .vbs-event-chip .chip-icon { font-size: 16px; }

  /* ── Main Content ── */
  .vbs-main {
    flex: 1;
    display: flex;
    gap: 0;
    padding: 20px 40px 28px;
    height: calc(100vh - 240px);
    min-height: 580px;
  }

  /* ── Left Panel ── */
  .vbs-left {
    width: 400px;
    min-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-right: 20px;
  }

  /* ── Search + Filters ── */
  .vbs-search-box {
    position: relative;
  }
  .vbs-search-input {
    width: 100%;
    padding: 13px 18px 13px 46px;
    background: var(--surface2);
    border: 1.5px solid var(--border2);
    border-radius: var(--radius);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .vbs-search-input:focus { border-color: var(--gold); }
  .vbs-search-input::placeholder { color: var(--text-dim); }
  .vbs-search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    width: 18px;
    height: 18px;
  }

  .vbs-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .vbs-filter-select {
    padding: 8px 14px;
    background: var(--surface2);
    border: 1.5px solid var(--border2);
    border-radius: 50px;
    color: var(--text-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;
    padding-right: 28px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8fa0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  .vbs-filter-select:focus, .vbs-filter-select:hover { border-color: var(--gold); color: var(--text); }
  .vbs-filter-select option { background: #1e2330; }

  .vbs-results-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
  }
  .vbs-results-count {
    font-size: 12px;
    color: var(--text-muted);
  }
  .vbs-results-count strong { color: var(--gold); }
  .vbs-map-area-badge {
    font-size: 11px;
    color: var(--accent);
    background: var(--accent-dim);
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 500;
  }

  /* ── Venue List ── */
  .vbs-venue-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 4px;
  }
  .vbs-venue-list::-webkit-scrollbar { width: 4px; }
  .vbs-venue-list::-webkit-scrollbar-track { background: transparent; }
  .vbs-venue-list::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  .vbs-venue-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .vbs-venue-card:hover { border-color: var(--gold); transform: translateY(-1px); box-shadow: var(--shadow); }
  .vbs-venue-card.selected { border-color: var(--gold); background: var(--surface2); box-shadow: var(--shadow-gold); }
  .vbs-venue-card.selected::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--gold);
    border-radius: 3px 0 0 3px;
  }

  .vbs-card-photos {
    position: relative;
    height: 140px;
    overflow: hidden;
    background: var(--surface3);
  }
  .vbs-card-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.4s;
    position: absolute;
    top: 0; left: 0;
  }
  .vbs-photo-dots {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
  }
  .vbs-photo-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    cursor: pointer;
    transition: background 0.2s;
  }
  .vbs-photo-dot.active { background: white; }
  .vbs-card-badge {
    position: absolute;
    top: 10px; right: 10px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    color: var(--gold-light);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .vbs-no-photo {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim);
    font-size: 36px;
  }

  .vbs-card-body {
    padding: 12px 14px 14px;
  }
  .vbs-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vbs-card-addr {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .vbs-card-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .vbs-card-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--gold-light);
  }
  .vbs-card-reviews {
    font-size: 11px;
    color: var(--text-dim);
  }
  .vbs-card-open {
    margin-left: auto;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 500;
  }
  .vbs-card-open.open { background: rgba(34,197,94,0.15); color: #22c55e; }
  .vbs-card-open.closed { background: rgba(239,68,68,0.12); color: #ef4444; }

  /* Pricing strip on selected */
  .vbs-card-pricing {
    display: flex;
    gap: 0;
    border-top: 1px solid var(--border);
    margin-top: 10px;
    padding-top: 10px;
  }
  .vbs-pricing-item {
    flex: 1;
    text-align: center;
    padding: 0 6px;
  }
  .vbs-pricing-item + .vbs-pricing-item { border-left: 1px solid var(--border); }
  .vbs-pricing-label { font-size: 10px; color: var(--text-dim); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vbs-pricing-value { font-size: 14px; font-weight: 600; color: var(--gold); }
  .vbs-pricing-unit { font-size: 10px; color: var(--text-muted); }

  /* ── Loading / Empty states ── */
  .vbs-loading-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .vbs-skeleton {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .vbs-skeleton-img { height: 110px; background: var(--surface3); }
  .vbs-skeleton-body { padding: 12px 14px; }
  .vbs-skeleton-line { height: 10px; background: var(--surface3); border-radius: 4px; margin-bottom: 8px; }

  .vbs-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-dim);
  }
  .vbs-empty-icon { font-size: 40px; margin-bottom: 12px; }
  .vbs-empty-title { font-size: 15px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
  .vbs-empty-sub { font-size: 13px; }

  /* ── Map Panel ── */
  .vbs-map-panel {
    flex: 1;
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
    border: 1.5px solid var(--border2);
    background: var(--surface3);
  }
  .vbs-map-container {
    width: 100%;
    height: 100%;
  }

  .vbs-map-overlay-top {
    position: absolute;
    top: 14px;
    left: 14px;
    right: 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    pointer-events: none;
    z-index: 10;
  }
  .vbs-map-pill {
    pointer-events: all;
    background: rgba(13,15,20,0.85);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border2);
    border-radius: 50px;
    padding: 7px 16px;
    font-size: 12px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .vbs-map-pill-dot { width: 7px; height: 7px; border-radius: 50%; }
  .vbs-map-pill-dot.red { background: var(--red); }
  .vbs-map-pill-dot.green { background: var(--green); }

  .vbs-map-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--surface3);
    z-index: 5;
    gap: 16px;
  }
  .vbs-spinner {
    width: 36px; height: 36px;
    border: 3px solid var(--border2);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .vbs-map-loading-text { color: var(--text-muted); font-size: 13px; }

  /* ── Location Mode ── */
  .vbs-location-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .vbs-location-card {
    background: var(--surface);
    border: 1.5px solid var(--border2);
    border-radius: 20px;
    padding: 40px;
    max-width: 480px;
    width: 100%;
    text-align: center;
  }
  .vbs-location-icon { font-size: 48px; margin-bottom: 20px; }
  .vbs-location-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .vbs-location-sub {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 28px;
    line-height: 1.6;
  }
  .vbs-loc-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  .vbs-loc-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-radius: var(--radius);
    border: 1.5px solid var(--border2);
    background: var(--surface2);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  .vbs-loc-btn:hover { border-color: var(--gold); background: var(--surface3); }
  .vbs-loc-btn .loc-icon { font-size: 20px; }
  .vbs-loc-btn .loc-text { flex: 1; }
  .vbs-loc-btn .loc-sub { font-size: 11px; color: var(--text-muted); font-weight: 400; margin-top: 1px; }

  .vbs-divider { display: flex; align-items: center; gap: 12px; color: var(--text-dim); font-size: 12px; margin: 4px 0; }
  .vbs-divider::before, .vbs-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .vbs-manual-input-wrap { position: relative; }
  .vbs-manual-input {
    width: 100%;
    padding: 13px 50px 13px 18px;
    background: var(--surface2);
    border: 1.5px solid var(--border2);
    border-radius: var(--radius);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .vbs-manual-input:focus { border-color: var(--gold); }
  .vbs-manual-input::placeholder { color: var(--text-dim); }
  .vbs-manual-submit {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--gold);
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    color: #0d0f14;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .vbs-manual-submit:hover { background: var(--gold-light); }

  /* ── Event selector prompt ── */
  .vbs-prompt-overlay {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    color: var(--text-muted);
    text-align: center;
    padding: 40px;
  }
  .vbs-prompt-icon { font-size: 52px; margin-bottom: 8px; }
  .vbs-prompt-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: var(--text);
    margin-bottom: 4px;
  }
  .vbs-prompt-sub { font-size: 14px; line-height: 1.7; max-width: 360px; }

  /* ── Venue Detail Modal ── */
  .vbs-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .vbs-modal {
    background: var(--surface);
    border: 1.5px solid var(--border2);
    border-radius: 20px;
    width: 100%;
    max-width: 560px;
    max-height: 85vh;
    overflow-y: auto;
    position: relative;
  }
  .vbs-modal::-webkit-scrollbar { width: 4px; }
  .vbs-modal::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
  .vbs-modal-photos {
    height: 240px;
    position: relative;
    background: var(--surface3);
    overflow: hidden;
  }
  .vbs-modal-photo { width: 100%; height: 100%; object-fit: cover; }
  .vbs-modal-photo-nav {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
  }
  .vbs-modal-photo-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: rgba(255,255,255,0.4);
    cursor: pointer;
    transition: background 0.2s;
  }
  .vbs-modal-photo-dot.active { background: white; width: 20px; border-radius: 4px; }
  .vbs-modal-prev, .vbs-modal-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.5);
    border: none;
    color: white;
    width: 36px; height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: background 0.2s;
  }
  .vbs-modal-prev { left: 10px; }
  .vbs-modal-next { right: 10px; }
  .vbs-modal-prev:hover, .vbs-modal-next:hover { background: rgba(0,0,0,0.8); }

  .vbs-modal-body { padding: 24px; }
  .vbs-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .vbs-modal-addr {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .vbs-modal-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .vbs-modal-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-muted);
  }
  .vbs-modal-stat strong { color: var(--text); }

  .vbs-pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
  .vbs-pricing-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    text-align: center;
  }
  .vbs-pricing-box-label {
    font-size: 11px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .vbs-pricing-box-val {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--gold);
  }
  .vbs-pricing-box-unit { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .vbs-modal-close {
    position: absolute;
    top: 14px; right: 14px;
    background: rgba(0,0,0,0.5);
    border: none;
    color: white;
    width: 32px; height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    z-index: 5;
  }
  .vbs-book-btn {
    width: 100%;
    padding: 14px;
    background: var(--gold);
    border: none;
    border-radius: var(--radius);
    color: #0d0f14;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: background 0.2s, transform 0.1s;
  }
  .vbs-book-btn:hover { background: var(--gold-light); transform: translateY(-1px); }
  .vbs-book-btn:active { transform: translateY(0); }

  /* scrollbar for modal */
  .vbs-modal::-webkit-scrollbar { width: 5px; }
  .vbs-modal::-webkit-scrollbar-track { background: transparent; }
  .vbs-modal::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 5px; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const priceMap = {
  hourly: [1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000],
  daily: [15000, 20000, 25000, 35000, 50000, 75000, 100000],
};
function mockPricing(placeId) {
  const h = priceMap.hourly[(placeId.charCodeAt(3) || 0) % priceMap.hourly.length];
  const d = priceMap.daily[(placeId.charCodeAt(4) || 0) % priceMap.daily.length];
  return { hourly: h, daily: d };
}
function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}
function getRatingStars(r) {
  const full = Math.floor(r);
  return "★".repeat(full) + (r % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(r));
}

// ─── Photo Slideshow ──────────────────────────────────────────────────────────
function PhotoSlide({ photos, height = 140 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!photos?.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), 3000);
    return () => clearInterval(t);
  }, [photos]);
  if (!photos?.length) return <div className="vbs-no-photo">🏛️</div>;
  return (
    <>
      {photos.map((p, i) => (
        <img
          key={i}
          src={p}
          className="vbs-card-photo"
          style={{ opacity: i === idx ? 1 : 0 }}
          alt=""
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ))}
      {photos.length > 1 && (
        <div className="vbs-photo-dots">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`vbs-photo-dot${i === idx ? " active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Venue Detail Modal ───────────────────────────────────────────────────────
function VenueModal({ venue, onClose }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = venue.photos || [];
  const pricing = mockPricing(venue.place_id);

  return (
    <div className="vbs-modal-backdrop" onClick={onClose}>
      <div className="vbs-modal" onClick={(e) => e.stopPropagation()}>
        <button className="vbs-modal-close" onClick={onClose}>✕</button>
        <div className="vbs-modal-photos">
          {photos.length > 0 ? (
            <>
              <img src={photos[photoIdx]} className="vbs-modal-photo" alt={venue.name} onError={(e) => e.target.style.display = "none"} />
              {photos.length > 1 && (
                <>
                  <button className="vbs-modal-prev" onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}>‹</button>
                  <button className="vbs-modal-next" onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}>›</button>
                  <div className="vbs-modal-photo-nav">
                    {photos.map((_, i) => (
                      <div key={i} className={`vbs-modal-photo-dot${i === photoIdx ? " active" : ""}`} onClick={() => setPhotoIdx(i)} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 60 }}>🏛️</div>
          )}
        </div>
        <div className="vbs-modal-body">
          <div className="vbs-modal-title">{venue.name}</div>
          <div className="vbs-modal-addr">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {venue.vicinity || venue.formatted_address || "Address not available"}
          </div>
          <div className="vbs-modal-stats">
            {venue.rating && (
              <div className="vbs-modal-stat">
                <span style={{ color: "#f59e0b" }}>★</span>
                <strong>{venue.rating}</strong>
                <span>({venue.user_ratings_total?.toLocaleString() || "0"} reviews)</span>
              </div>
            )}
            <div className="vbs-modal-stat">
              <span>🕐</span>
              <span className={venue.opening_hours?.open_now ? "vbs-card-open open" : "vbs-card-open closed"}>
                {venue.opening_hours?.open_now ? "Open Now" : "Closed"}
              </span>
            </div>
            {venue.price_level && (
              <div className="vbs-modal-stat">
                <span>💰</span>
                <strong>{"₹".repeat(venue.price_level)}</strong>
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>
            Estimated Pricing
          </div>
          <div className="vbs-pricing-grid">
            <div className="vbs-pricing-box">
              <div className="vbs-pricing-box-label">Per Hour</div>
              <div className="vbs-pricing-box-val">{formatINR(pricing.hourly)}</div>
              <div className="vbs-pricing-box-unit">+ taxes</div>
            </div>
            <div className="vbs-pricing-box">
              <div className="vbs-pricing-box-label">Full Day</div>
              <div className="vbs-pricing-box-val">{formatINR(pricing.daily)}</div>
              <div className="vbs-pricing-box-unit">+ taxes</div>
            </div>
          </div>

          <button className="vbs-book-btn">Request Booking →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Venue Card ───────────────────────────────────────────────────────────────
function VenueCard({ venue, selected, onClick, mapsApi }) {
  const photos = venue.photos || [];
  const pricing = mockPricing(venue.place_id);

  return (
    <div className={`vbs-venue-card${selected ? " selected" : ""}`} onClick={onClick}>
      <div className="vbs-card-photos">
        <PhotoSlide photos={photos} />
        {venue.rating && (
          <div className="vbs-card-badge">
            ★ {venue.rating}
          </div>
        )}
      </div>
      <div className="vbs-card-body">
        <div className="vbs-card-name">{venue.name}</div>
        <div className="vbs-card-addr">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {venue.vicinity || "—"}
        </div>
        <div className="vbs-card-meta">
          {venue.rating && (
            <div className="vbs-card-rating">
              ★ {venue.rating}
              <span className="vbs-card-reviews">({venue.user_ratings_total?.toLocaleString() || "0"})</span>
            </div>
          )}
          {venue.opening_hours && (
            <div className={`vbs-card-open ${venue.opening_hours.open_now ? "open" : "closed"}`}>
              {venue.opening_hours.open_now ? "Open" : "Closed"}
            </div>
          )}
        </div>
        {selected && (
          <div className="vbs-card-pricing">
            <div className="vbs-pricing-item">
              <div className="vbs-pricing-label">Hourly</div>
              <div className="vbs-pricing-value">{formatINR(pricing.hourly)}</div>
              <div className="vbs-pricing-unit">+ taxes</div>
            </div>
            <div className="vbs-pricing-item">
              <div className="vbs-pricing-label">Full Day</div>
              <div className="vbs-pricing-value">{formatINR(pricing.daily)}</div>
              <div className="vbs-pricing-unit">+ taxes</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="vbs-skeleton">
      <div className="vbs-skeleton-img" />
      <div className="vbs-skeleton-body">
        <div className="vbs-skeleton-line" style={{ width: "70%" }} />
        <div className="vbs-skeleton-line" style={{ width: "90%" }} />
        <div className="vbs-skeleton-line" style={{ width: "50%" }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VenueBookingSection() {
  const [mode, setMode] = useState("browse"); // "browse" | "location"
  const [eventType, setEventType] = useState(null);
  const eventTypeRef = useRef(null); // ref so map listeners can read current value
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [modalVenue, setModalVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapAreaName, setMapAreaName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [locStatus, setLocStatus] = useState("idle"); // "idle"|"loading"|"done"|"error"

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const mapsApiRef = useRef(null);
  const mapMoveDebounceRef = useRef(null);
  const lastSearchKeyRef = useRef(""); // tracks last searched location+eventType to prevent duplication
  const isFetchingRef = useRef(false);
  const currentLocationRef = useRef({ lat: 17.385, lng: 78.4867 }); // Hyderabad default

  // ── Init Maps ──
  useEffect(() => {
    if (!mapRef.current) return;
    setMapLoading(true);
    loadGoogleMaps().then((maps) => {
      mapsApiRef.current = maps;
      const map = new maps.Map(mapRef.current, {
        center: currentLocationRef.current,
        zoom: 13,
        mapTypeId: "roadmap",
        styles: darkMapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapInstanceRef.current = map;
      placesServiceRef.current = new maps.places.PlacesService(map);
      geocoderRef.current = new maps.Geocoder();

      // Only re-fetch on dragend (user explicitly moved map), not on every idle
      map.addListener("dragend", () => {
        const center = map.getCenter();
        if (!center) return;
        const latlng = { lat: center.lat(), lng: center.lng() };
        clearTimeout(mapMoveDebounceRef.current);
        mapMoveDebounceRef.current = setTimeout(() => {
          currentLocationRef.current = latlng;
          reverseGeocode(latlng);
          // Use the current eventType from the ref so closure isn't stale
          if (eventTypeRef.current) {
            doFetchVenues(eventTypeRef.current, latlng, true);
          }
        }, 500);
      });

      // Also re-fetch when zoom changes significantly
      let lastZoom = 13;
      map.addListener("zoom_changed", () => {
        clearTimeout(mapMoveDebounceRef.current);
        mapMoveDebounceRef.current = setTimeout(() => {
          const newZoom = map.getZoom();
          if (Math.abs(newZoom - lastZoom) >= 1) {
            lastZoom = newZoom;
            const center = map.getCenter();
            if (center && eventTypeRef.current) {
              const latlng = { lat: center.lat(), lng: center.lng() };
              currentLocationRef.current = latlng;
              doFetchVenues(eventTypeRef.current, latlng, true);
            }
          }
        }, 700);
      });

      setMapLoading(false);
    }).catch(() => setMapLoading(false));
  }, [mapRef.current]);

  // ── Reverse Geocode for area name ──
  const reverseGeocode = useCallback((latlng) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const comp = results[0].address_components.find(c => c.types.includes("sublocality") || c.types.includes("locality"));
        if (comp) setMapAreaName(comp.long_name);
      }
    });
  }, []);

  // ── Core fetch — ONE call, no pagination loop, guarded by key ──
  const doFetchVenues = useCallback((evType, location, replace = false) => {
    if (!placesServiceRef.current || !evType) return;

    // Build a key — only re-fetch if location changed by >0.01 deg OR evType changed
    const key = `${evType}|${location.lat.toFixed(2)}|${location.lng.toFixed(2)}`;
    if (key === lastSearchKeyRef.current && !replace) return;
    if (isFetchingRef.current) return;

    lastSearchKeyRef.current = key;
    isFetchingRef.current = true;
    setLoading(true);

    const eventObj = EVENT_TYPES.find(e => e.id === evType);
    const keyword = eventObj?.query || "event venue hall";

    const request = {
      location: new mapsApiRef.current.LatLng(location.lat, location.lng),
      radius: 8000,
      keyword,
      type: ["establishment"],
    };

    placesServiceRef.current.nearbySearch(request, (results, status, pagination) => {
      isFetchingRef.current = false;
      setLoading(false);

      if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
        const enriched = results.map((place) => ({
          ...place,
          photos: place.photos
            ? place.photos.slice(0, 5).map(p => p.getUrl({ maxWidth: 600, maxHeight: 400 }))
            : [],
        }));

        if (replace) {
          setVenues(enriched.slice(0, 20));
        } else {
          setVenues(prev => {
            const seen = new Set(prev.map(v => v.place_id));
            const fresh = enriched.filter(v => !seen.has(v.place_id));
            return [...prev, ...fresh].slice(0, 20);
          });
        }

        // Fetch one more page only if we still have fewer than 20 — but only once
        if (pagination?.hasNextPage) {
          setVenues(current => {
            if (current.length < 20) {
              setTimeout(() => {
                pagination.nextPage();
              }, 1500);
            }
            return current;
          });
        }
      }
    });
  }, []);

  // ── When event type changes, fetch new venues ──
  useEffect(() => {
    eventTypeRef.current = eventType;
    if (eventType && placesServiceRef.current) {
      setVenues([]);
      setSelectedVenue(null);
      lastSearchKeyRef.current = ""; // reset key so fresh fetch happens
      doFetchVenues(eventType, currentLocationRef.current, true);
      reverseGeocode(currentLocationRef.current);
    }
  }, [eventType]);

  // ── Filter venues based on search + filters ──
  useEffect(() => {
    let list = [...venues];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.vicinity?.toLowerCase().includes(q)
      );
    }

    if (cityFilter !== "All Cities") {
      list = list.filter(v => v.vicinity?.toLowerCase().includes(cityFilter.toLowerCase()));
    }

    if (ratingFilter !== "All Ratings") {
      const minRating = parseFloat(ratingFilter);
      list = list.filter(v => (v.rating || 0) >= minRating);
    }

    setFilteredVenues(list);
  }, [venues, searchQuery, cityFilter, ratingFilter]);

  // ── Update map markers when filtered venues change ──
  useEffect(() => {
    if (!mapInstanceRef.current || !mapsApiRef.current) return;
    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    filteredVenues.forEach((venue) => {
      const isSelected = selectedVenue?.place_id === venue.place_id;
      const loc = venue.geometry?.location;
      if (!loc) return;

      // Custom teardrop pin SVG — medium sized
      const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 24 14 24S28 24.5 28 14C28 6.27 21.73 0 14 0z"
            fill="${isSelected ? '#22c55e' : '#ef4444'}"
            stroke="${isSelected ? '#15803d' : '#b91c1c'}"
            stroke-width="1.5"/>
          <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.9"/>
        </svg>`;

      const marker = new mapsApiRef.current.Marker({
        position: { lat: loc.lat(), lng: loc.lng() },
        map: mapInstanceRef.current,
        title: venue.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
          scaledSize: new mapsApiRef.current.Size(28, 38),
          anchor: new mapsApiRef.current.Point(14, 38),
        },
        animation: isSelected ? mapsApiRef.current.Animation.BOUNCE : null,
        zIndex: isSelected ? 100 : 1,
      });

      marker.addListener("click", () => {
        setSelectedVenue(venue);
        setModalVenue(venue);
      });

      markersRef.current.push(marker);
    });
  }, [filteredVenues, selectedVenue]);

  // ── Pan map to selected venue ──
  useEffect(() => {
    if (selectedVenue && mapInstanceRef.current) {
      const loc = selectedVenue.geometry?.location;
      if (loc) {
        mapInstanceRef.current.panTo({ lat: loc.lat(), lng: loc.lng() });
        mapInstanceRef.current.setZoom(15);
      }
    }
  }, [selectedVenue]);

  // ── Get current GPS location ──
  const handleCurrentLocation = () => {
    setLocStatus("loading");
    if (!navigator.geolocation) { setLocStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        currentLocationRef.current = latlng;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(latlng);
          mapInstanceRef.current.setZoom(13);
        }
        lastSearchKeyRef.current = "";
        if (eventType) doFetchVenues(eventType, latlng, true);
        reverseGeocode(latlng);
        setLocStatus("done");
        setMode("browse");
      },
      () => setLocStatus("error")
    );
  };

  // ── Manual address search ──
  const handleManualAddress = () => {
    if (!manualAddress.trim() || !geocoderRef.current) return;
    geocoderRef.current.geocode({ address: manualAddress }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        const latlng = { lat: loc.lat(), lng: loc.lng() };
        currentLocationRef.current = latlng;
        mapInstanceRef.current?.setCenter(latlng);
        mapInstanceRef.current?.setZoom(13);
        lastSearchKeyRef.current = "";
        if (eventType) doFetchVenues(eventType, latlng, true);
        reverseGeocode(latlng);
        setMode("browse");
        setManualAddress("");
      }
    });
  };

  const minRatingVal = ratingFilter !== "All Ratings" ? parseFloat(ratingFilter) : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="vbs-root">
        {/* Header */}
        <div className="vbs-header">
          <div className="vbs-logo">Venue<span>Finder</span></div>
          <div className="vbs-tagline">Discover extraordinary spaces for every occasion</div>
        </div>

        {/* Mode Toggle */}
        <div className="vbs-mode-bar">
          <button
            className={`vbs-mode-btn${mode === "browse" ? " active" : ""}`}
            onClick={() => setMode("browse")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            Browse Venues
          </button>
          <button
            className={`vbs-mode-btn${mode === "location" ? " active" : ""}`}
            onClick={() => setMode("location")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Pin Location
          </button>
        </div>

        {/* Event Type Picker */}
        <div className="vbs-event-section">
          <div className="vbs-section-label">Select Event Type</div>
          <div className="vbs-event-grid">
            {EVENT_TYPES.map((ev) => (
              <button
                key={ev.id}
                className={`vbs-event-chip${eventType === ev.id ? " active" : ""}`}
                onClick={() => setEventType(ev.id)}
              >
                <span className="chip-icon">{ev.icon}</span>
                {ev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="vbs-main">
          {mode === "browse" ? (
            <>
              {/* Left Panel */}
              <div className="vbs-left">
                {eventType ? (
                  <>
                    {/* Search */}
                    <div className="vbs-search-box">
                      <svg className="vbs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                      </svg>
                      <input
                        className="vbs-search-input"
                        placeholder="Search by name or area…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Filters */}
                    <div className="vbs-filters">
                      <select className="vbs-filter-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                        {CITY_FILTERS.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <select className="vbs-filter-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                        {RATING_FILTERS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>

                    {/* Results meta */}
                    <div className="vbs-results-meta">
                      <div className="vbs-results-count">
                        <strong>{filteredVenues.length}</strong> venues found
                        {loading && <span style={{ color: "var(--gold)", marginLeft: 8 }}>• Searching…</span>}
                      </div>
                      {mapAreaName && (
                        <div className="vbs-map-area-badge">📍 {mapAreaName}</div>
                      )}
                    </div>

                    {/* Venue List */}
                    <div className="vbs-venue-list">
                      {loading && filteredVenues.length === 0 ? (
                        <div className="vbs-loading-cards">
                          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                        </div>
                      ) : filteredVenues.length === 0 ? (
                        <div className="vbs-empty">
                          <div className="vbs-empty-icon">🔍</div>
                          <div className="vbs-empty-title">No venues found</div>
                          <div className="vbs-empty-sub">Try adjusting your filters or moving the map to explore a different area</div>
                        </div>
                      ) : (
                        filteredVenues.map((venue) => (
                          <VenueCard
                            key={venue.place_id}
                            venue={venue}
                            selected={selectedVenue?.place_id === venue.place_id}
                            onClick={() => {
                              setSelectedVenue(venue);
                              setModalVenue(venue);
                            }}
                            mapsApi={mapsApiRef.current}
                          />
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="vbs-prompt-overlay">
                    <div className="vbs-prompt-icon">🎪</div>
                    <div className="vbs-prompt-title">Choose Your Event Type</div>
                    <div className="vbs-prompt-sub">
                      Select the type of event above to discover the perfect venues near you, complete with photos, ratings, and pricing.
                    </div>
                  </div>
                )}
              </div>

              {/* Map Panel */}
              <div className="vbs-map-panel">
                {mapLoading && (
                  <div className="vbs-map-loading">
                    <div className="vbs-spinner" />
                    <div className="vbs-map-loading-text">Loading map…</div>
                  </div>
                )}
                <div className="vbs-map-overlay-top">
                  <div className="vbs-map-pill">
                    <div className="vbs-map-pill-dot red" />
                    Available venues
                    <div className="vbs-map-pill-dot green" style={{ marginLeft: 8 }} />
                    Selected
                  </div>
                  {filteredVenues.length > 0 && (
                    <div className="vbs-map-pill">{filteredVenues.length} pins visible</div>
                  )}
                </div>
                <div ref={mapRef} className="vbs-map-container" />
              </div>
            </>
          ) : (
            /* Location Mode */
            <div className="vbs-location-panel">
              <div className="vbs-location-card">
                <div className="vbs-location-icon">📍</div>
                <div className="vbs-location-title">Set Your Location</div>
                <div className="vbs-location-sub">
                  Use your current GPS location or type an address to find venues nearby.
                </div>
                <div className="vbs-loc-options">
                  <button className="vbs-loc-btn" onClick={handleCurrentLocation} disabled={locStatus === "loading"}>
                    <span className="loc-icon">🎯</span>
                    <div className="loc-text">
                      <div>{locStatus === "loading" ? "Detecting location…" : locStatus === "done" ? "✓ Location detected" : "Use My Current Location"}</div>
                      <div className="loc-sub">Automatically detect via GPS</div>
                    </div>
                  </button>
                </div>
                <div className="vbs-divider">or enter manually</div>
                <div className="vbs-manual-input-wrap" style={{ marginTop: 16 }}>
                  <input
                    className="vbs-manual-input"
                    placeholder="e.g. Jubilee Hills, Hyderabad"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualAddress()}
                  />
                  <button className="vbs-manual-submit" onClick={handleManualAddress}>Go</button>
                </div>
                {locStatus === "error" && (
                  <div style={{ marginTop: 12, color: "var(--red)", fontSize: 13 }}>
                    ⚠ Could not detect location. Please allow location access or enter manually.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Venue Detail Modal */}
        {modalVenue && (
          <VenueModal venue={modalVenue} onClose={() => setModalVenue(null)} />
        )}
      </div>
    </>
  );
}

// ─── Dark Map Styles ──────────────────────────────────────────────────────────
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1f2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1f2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7a8299" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#c9a84c" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8a8fa0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e2d1e" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3a5a3a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a3042" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1f2e" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6a7080" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a4060" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1a2040" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#a0a8c0" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2a3042" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#c9a84c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1520" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a5a7a" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#0d1520" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
];
