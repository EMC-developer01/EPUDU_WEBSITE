import { useState, useEffect, useRef, useCallback } from "react";

// ─── Static Venue Data (Google Maps integrated) ───────────────────────────────
const STATIC_VENUES = [
  {
    id: 1,
    name: "The Grand Pavilion",
    type: ["wedding", "function", "corporate"],
    city: "Hyderabad",
    area: "Banjara Hills",
    rating: 4.8,
    reviews: 312,
    lat: 17.4126,
    lng: 78.4482,
    address: "Road No. 12, Banjara Hills, Hyderabad, Telangana 500034",
    photos: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80",
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&q=80",
    ],
    capacity: 800,
    pricePerHour: 15000,
    pricePerDay: 95000,
    amenities: ["Parking", "Catering", "AC", "Stage", "Garden"],
    description: "Luxurious banquet hall with panoramic city views and world-class facilities.",
  },
  {
    id: 2,
    name: "Serene Garden Resort",
    type: ["wedding", "birthday", "reception"],
    city: "Hyderabad",
    area: "Jubilee Hills",
    rating: 4.6,
    reviews: 187,
    lat: 17.4315,
    lng: 78.4085,
    address: "Plot 45, Jubilee Hills Check Post, Hyderabad, Telangana 500033",
    photos: [
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&q=80",
      "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80",
    ],
    capacity: 400,
    pricePerHour: 8000,
    pricePerDay: 55000,
    amenities: ["Garden", "Parking", "DJ", "Decor", "Catering"],
    description: "Elegant garden venue perfect for intimate celebrations and outdoor weddings.",
  },
  {
    id: 3,
    name: "Skyline Convention Center",
    type: ["corporate", "function", "seminar"],
    city: "Hyderabad",
    area: "HITEC City",
    rating: 4.5,
    reviews: 425,
    lat: 17.4477,
    lng: 78.3803,
    address: "Cyber Towers, HITEC City, Hyderabad, Telangana 500081",
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    ],
    capacity: 1200,
    pricePerHour: 25000,
    pricePerDay: 150000,
    amenities: ["AV System", "WiFi", "Catering", "Parking", "Breakout Rooms"],
    description: "State-of-the-art convention center for large-scale corporate events.",
  },
  {
    id: 4,
    name: "Bloom Terrace",
    type: ["birthday", "reception", "party"],
    city: "Hyderabad",
    area: "Kondapur",
    rating: 4.3,
    reviews: 98,
    lat: 17.4598,
    lng: 78.3568,
    address: "Survey No. 78, Kondapur Main Road, Hyderabad, Telangana 500084",
    photos: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80",
    ],
    capacity: 200,
    pricePerHour: 5000,
    pricePerDay: 32000,
    amenities: ["Rooftop", "DJ", "Bar", "Catering", "Photo Booth"],
    description: "Chic rooftop venue with stunning sunset views for parties and celebrations.",
  },
  {
    id: 5,
    name: "The Heritage Hall",
    type: ["wedding", "function", "cultural"],
    city: "Hyderabad",
    area: "Secunderabad",
    rating: 4.7,
    reviews: 234,
    lat: 17.4402,
    lng: 78.4979,
    address: "MG Road, Secunderabad, Hyderabad, Telangana 500003",
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80",
    ],
    capacity: 600,
    pricePerHour: 12000,
    pricePerDay: 75000,
    amenities: ["Heritage Architecture", "Parking", "Catering", "Stage", "Dressing Rooms"],
    description: "Colonial-era heritage building offering timeless elegance for grand celebrations.",
  },
  {
    id: 6,
    name: "Fusion Fiesta",
    type: ["birthday", "party", "reception"],
    city: "Hyderabad",
    area: "Gachibowli",
    rating: 4.4,
    reviews: 156,
    lat: 17.4401,
    lng: 78.3489,
    address: "DLF Cyber City, Gachibowli, Hyderabad, Telangana 500032",
    photos: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
      "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&q=80",
    ],
    capacity: 300,
    pricePerHour: 7000,
    pricePerDay: 45000,
    amenities: ["LED Stage", "DJ", "Bar", "Catering", "VIP Lounge"],
    description: "Modern entertainment venue with cutting-edge sound and lighting systems.",
  },
];

const EVENT_TYPES = [
  { id: "wedding", label: "Wedding", icon: "💍" },
  { id: "birthday", label: "Birthday", icon: "🎂" },
  { id: "function", label: "Function", icon: "🎉" },
  { id: "corporate", label: "Corporate", icon: "💼" },
  { id: "reception", label: "Reception", icon: "🥂" },
  { id: "party", label: "Party", icon: "🎊" },
  { id: "cultural", label: "Cultural", icon: "🎭" },
  { id: "seminar", label: "Seminar", icon: "📋" },
];

const CITIES = ["All Cities", "Hyderabad", "Mumbai", "Delhi", "Bangalore", "Chennai"];

// ─── Google Maps Loader ────────────────────────────────────────────────────────
let mapsLoaded = false;
let mapsLoading = false;
const mapsCallbacks = [];

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (mapsLoaded && window.google?.maps) { resolve(window.google.maps); return; }
    mapsCallbacks.push({ resolve, reject });
    if (mapsLoading) return;
    mapsLoading = true;
    window.__googleMapsReady = () => {
      mapsLoaded = true;
      mapsLoading = false;
      mapsCallbacks.forEach((cb) => cb.resolve(window.google.maps));
      mapsCallbacks.length = 0;
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googleMapsReady`;
    script.async = true;
    script.onerror = () => {
      mapsLoading = false;
      mapsCallbacks.forEach((cb) => cb.reject(new Error("Maps failed to load")));
      mapsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db", fontSize: 12 }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 3 }}>{rating}</span>
    </div>
  );
}

function PhotoSlider({ photos, name }) {
  const [idx, setIdx] = useState(0);
  return (
    <div style={{ position: "relative", width: "100%", height: 160, borderRadius: "12px 12px 0 0", overflow: "hidden", background: "#f3f4f6" }}>
      <img
        src={photos[idx]}
        alt={name}
        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }}
        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80"; }}
      />
      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + photos.length) % photos.length); }}
            style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % photos.length); }}
            style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
            {photos.map((_, i) => (
              <div key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, background: i === idx ? "#fff" : "rgba(255,255,255,0.5)", transition: "all 0.2s", cursor: "pointer" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function VenueCard({ venue, selected, onClick }) {
  return (
    <div onClick={() => onClick(venue)}
      style={{
        background: "#fff", borderRadius: 14, overflow: "hidden", cursor: "pointer",
        border: selected ? "2px solid #6366f1" : "2px solid transparent",
        boxShadow: selected ? "0 0 0 3px rgba(99,102,241,0.15), 0 4px 20px rgba(0,0,0,0.1)" : "0 2px 12px rgba(0,0,0,0.07)",
        transition: "all 0.2s", marginBottom: 12,
        transform: selected ? "scale(1.01)" : "scale(1)",
      }}>
      <PhotoSlider photos={venue.photos} name={venue.name} />
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'Playfair Display', serif" }}>{venue.name}</h3>
          <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>★ {venue.rating}</span>
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6b7280" }}>📍 {venue.area}, {venue.city}</p>
        <StarRating rating={venue.rating} />
        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>{venue.reviews} reviews • Up to {venue.capacity} guests</p>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <div style={{ flex: 1, background: "#f8faff", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Per Hour</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>₹{(venue.pricePerHour / 1000).toFixed(0)}K</div>
          </div>
          <div style={{ flex: 1, background: "#f8faff", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Per Day</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}>₹{(venue.pricePerDay / 1000).toFixed(0)}K</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
          {venue.amenities.slice(0, 3).map((a) => (
            <span key={a} style={{ fontSize: 10, background: "#f3f4f6", color: "#374151", padding: "2px 7px", borderRadius: 20 }}>{a}</span>
          ))}
          {venue.amenities.length > 3 && <span style={{ fontSize: 10, color: "#9ca3af" }}>+{venue.amenities.length - 3} more</span>}
        </div>
      </div>
    </div>
  );
}

function VenueDetailModal({ venue, onClose }) {
  const [activeTab, setActiveTab] = useState("hourly");
  const hours = [2, 4, 6, 8, 12];
  if (!venue) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}
        onClick={(e) => e.stopPropagation()}>
        <PhotoSlider photos={venue.photos} name={venue.name} />
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#111827" }}>{venue.name}</h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>📍 {venue.address}</p>
            </div>
            <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, color: "#374151" }}>×</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
            <StarRating rating={venue.rating} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{venue.reviews} reviews</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>• {venue.capacity} guests max</span>
          </div>
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, margin: "0 0 16px" }}>{venue.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {venue.amenities.map((a) => (
              <span key={a} style={{ fontSize: 12, background: "#eef2ff", color: "#6366f1", padding: "4px 10px", borderRadius: 20, fontWeight: 500 }}>{a}</span>
            ))}
          </div>

          {/* Pricing Tabs */}
          <div style={{ background: "#f9fafb", borderRadius: 14, padding: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#111827" }}>💰 Venue Pricing</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["hourly", "daily"].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={{
                    flex: 1, padding: "8px 0", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13,
                    background: activeTab === t ? "#6366f1" : "#e5e7eb", color: activeTab === t ? "#fff" : "#6b7280", transition: "all 0.2s"
                  }}>
                  {t === "hourly" ? "⏱ Hourly" : "📅 Daily"}
                </button>
              ))}
            </div>
            {activeTab === "hourly" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {hours.map((h) => (
                  <div key={h} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{h} Hours</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#6366f1" }}>₹{((venue.pricePerHour * h) / 1000).toFixed(0)}K</div>
                    <div style={{ fontSize: 11, color: "#d1d5db" }}>₹{venue.pricePerHour.toLocaleString()}/hr</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[1, 2, 3, 7].map((d) => (
                  <div key={d} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{d} {d === 1 ? "Day" : "Days"}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#6366f1" }}>₹{((venue.pricePerDay * d) / 1000).toFixed(0)}K</div>
                    <div style={{ fontSize: 11, color: "#d1d5db" }}>₹{venue.pricePerDay.toLocaleString()}/day</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button style={{ width: "100%", marginTop: 16, padding: "14px 0", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
            Book This Venue →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Map Component ─────────────────────────────────────────────────────────────
function GoogleMapView({ venues, selectedVenue, onVenueSelect, centerLat, centerLng, apiKey }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(apiKey).then((maps) => {
      if (cancelled || !mapRef.current) return;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new maps.Map(mapRef.current, {
          center: { lat: centerLat || 17.4126, lng: centerLng || 78.4482 },
          zoom: 12,
          mapTypeId: "roadmap",
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "simplified" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { elementType: "labels.icon", featureType: "poi", stylers: [{ visibility: "off" }] },
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
      } else if (centerLat && centerLng) {
        mapInstanceRef.current.setCenter({ lat: centerLat, lng: centerLng });
        mapInstanceRef.current.setZoom(14);
      }

      // Clear old markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) { infoWindowRef.current.close(); }
      infoWindowRef.current = new maps.InfoWindow();

      venues.forEach((venue) => {
        const isSelected = selectedVenue?.id === venue.id;
        const marker = new maps.Marker({
          position: { lat: venue.lat, lng: venue.lng },
          map: mapInstanceRef.current,
          title: venue.name,
          animation: isSelected ? maps.Animation.BOUNCE : null,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: isSelected ? 14 : 10,
            fillColor: isSelected ? "#6366f1" : "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          onVenueSelect(venue);
          infoWindowRef.current.setContent(`
            <div style="font-family:'Segoe UI',sans-serif;padding:8px 4px;min-width:160px">
              <b style="font-size:14px;color:#111">${venue.name}</b><br/>
              <span style="font-size:12px;color:#6b7280">📍 ${venue.area}</span><br/>
              <span style="font-size:12px;color:#f59e0b">★ ${venue.rating}</span>
              <span style="font-size:12px;color:#9ca3af"> • ${venue.reviews} reviews</span><br/>
              <span style="font-size:13px;font-weight:700;color:#6366f1">₹${(venue.pricePerHour / 1000).toFixed(0)}K/hr</span>
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      });

      if (selectedVenue) {
        mapInstanceRef.current.panTo({ lat: selectedVenue.lat, lng: selectedVenue.lng });
      }
    }).catch(() => { });

    return () => { cancelled = true; };
  }, [venues, selectedVenue, centerLat, centerLng, apiKey]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: 16 }} />
  );
}

// ─── Location Tab ──────────────────────────────────────────────────────────────
function LocationTab({ apiKey }) {
  const [mode, setMode] = useState("current"); // "current" | "pin" | "manual"
  const [address, setAddress] = useState("");
  const [pinLat, setPinLat] = useState(17.4126);
  const [pinLng, setPinLng] = useState(78.4482);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const pinMapRef = useRef(null);
  const pinMapInstance = useRef(null);
  const pinMarkerRef = useRef(null);

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setPinLat(pos.coords.latitude); setPinLng(pos.coords.longitude); setConfirmed(true); setLoading(false); },
      () => { setLoading(false); alert("Could not get location. Please allow location access."); }
    );
  };

  useEffect(() => {
    if (mode !== "pin" || !pinMapRef.current) return;
    loadGoogleMaps(apiKey).then((maps) => {
      if (!pinMapInstance.current) {
        pinMapInstance.current = new maps.Map(pinMapRef.current, {
          center: { lat: pinLat, lng: pinLng }, zoom: 14,
          mapTypeControl: false, streetViewControl: false,
        });
        pinMarkerRef.current = new maps.Marker({
          position: { lat: pinLat, lng: pinLng },
          map: pinMapInstance.current, draggable: true,
          title: "Drag to set your location",
        });
        pinMapInstance.current.addListener("click", (e) => {
          pinMarkerRef.current.setPosition(e.latLng);
          setPinLat(e.latLng.lat()); setPinLng(e.latLng.lng());
        });
        pinMarkerRef.current.addListener("dragend", (e) => {
          setPinLat(e.latLng.lat()); setPinLng(e.latLng.lng());
        });
      }
    });
  }, [mode, apiKey]);

  return (
    <div style={{ padding: "0 4px" }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>Set Your Location</h3>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Find venues near you — use GPS, pin on map, or type an address.</p>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "current", label: "📍 Use GPS", desc: "Auto-detect" },
          { id: "pin", label: "📌 Pin on Map", desc: "Click to pin" },
          { id: "manual", label: "✏️ Type Address", desc: "Manual entry" },
        ].map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setConfirmed(false); }}
            style={{
              flex: 1, padding: "12px 8px", border: `2px solid ${mode === m.id ? "#6366f1" : "#e5e7eb"}`,
              borderRadius: 12, background: mode === m.id ? "#eef2ff" : "#fff", cursor: "pointer", transition: "all 0.2s", textAlign: "center"
            }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: mode === m.id ? "#6366f1" : "#374151" }}>{m.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {mode === "current" && (
        <div style={{ textAlign: "center", padding: "30px 20px", background: "#f9fafb", borderRadius: 14, border: "2px dashed #e5e7eb" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <p style={{ fontSize: 14, color: "#374151", margin: "0 0 16px" }}>We'll use your device GPS to find venues nearby.</p>
          <button onClick={getCurrentLocation} disabled={loading}
            style={{ padding: "12px 28px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Detecting…" : "📡 Detect My Location"}
          </button>
          {confirmed && (
            <div style={{ marginTop: 16, padding: "10px 16px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0", display: "inline-block" }}>
              <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✅ Location found! {pinLat.toFixed(4)}, {pinLng.toFixed(4)}</span>
            </div>
          )}
        </div>
      )}

      {mode === "pin" && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px" }}>Click anywhere on the map or drag the marker to set your location.</p>
          <div ref={pinMapRef} style={{ width: "100%", height: 300, borderRadius: 14, border: "2px solid #e5e7eb", overflow: "hidden" }} />
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd" }}>
            <span style={{ fontSize: 12, color: "#0369a1" }}>📌 Pinned: {pinLat.toFixed(5)}, {pinLng.toFixed(5)}</span>
          </div>
          <button onClick={() => setConfirmed(true)}
            style={{ marginTop: 12, width: "100%", padding: "12px 0", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Confirm This Location →
          </button>
        </div>
      )}

      {mode === "manual" && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Enter Full Address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Road No. 12, Banjara Hills, Hyderabad, Telangana 500034"
            style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 14, resize: "vertical", minHeight: 80, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Latitude (optional)</label>
              <input type="number" placeholder="17.4126" value={pinLat} onChange={(e) => setPinLat(parseFloat(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>Longitude (optional)</label>
              <input type="number" placeholder="78.4482" value={pinLng} onChange={(e) => setPinLng(parseFloat(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <button onClick={() => setConfirmed(!!address)} disabled={!address}
            style={{ marginTop: 12, width: "100%", padding: "12px 0", background: address ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#e5e7eb", color: address ? "#fff" : "#9ca3af", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: address ? "pointer" : "not-allowed" }}>
            Confirm Address →
          </button>
        </div>
      )}

      {confirmed && (
        <div style={{ marginTop: 20, padding: "16px 20px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 14, border: "1px solid #bbf7d0" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#15803d" }}>✅ Location Confirmed!</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#16a34a" }}>
            {mode === "manual" ? address : `Coordinates: ${pinLat.toFixed(5)}, ${pinLng.toFixed(5)}`}
          </p>
          <button style={{ marginTop: 12, padding: "10px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            🔍 Find Nearby Venues
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Browse Tab ────────────────────────────────────────────────────────────────
function BrowseTab({ apiKey }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [minRating, setMinRating] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [detailVenue, setDetailVenue] = useState(null);

  const filteredVenues = STATIC_VENUES.filter((v) => {
    const matchesEvent = !selectedEvent || v.type.includes(selectedEvent);
    const matchesSearch = !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.area.toLowerCase().includes(searchQuery.toLowerCase()) || v.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "All Cities" || v.city === selectedCity;
    const matchesRating = v.rating >= minRating;
    return matchesEvent && matchesSearch && matchesCity && matchesRating;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Event Type Selection */}
      {!selectedEvent && (
        <div style={{ padding: "16px 0 20px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>What's the Occasion?</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 14px" }}>Select an event type to discover the perfect venues.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {EVENT_TYPES.map((e) => (
              <button key={e.id} onClick={() => setSelectedEvent(e.id)}
                style={{ padding: "12px 6px", background: "#fff", border: "2px solid #e5e7eb", borderRadius: 12, cursor: "pointer", textAlign: "center", transition: "all 0.18s" }}
                onMouseEnter={(el) => { el.target.style.borderColor = "#6366f1"; el.target.style.background = "#eef2ff"; }}
                onMouseLeave={(el) => { el.target.style.borderColor = "#e5e7eb"; el.target.style.background = "#fff"; }}>
                <div style={{ fontSize: 22 }}>{e.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginTop: 4 }}>{e.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedEvent && (
        <>
          {/* Header with back */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, borderBottom: "1px solid #f3f4f6", marginBottom: 14 }}>
            <button onClick={() => setSelectedEvent(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 13, color: "#374151" }}>← Back</button>
            <div style={{ display: "flex", gap: 6 }}>
              {EVENT_TYPES.map((e) => (
                <button key={e.id} onClick={() => setSelectedEvent(e.id)}
                  style={{ padding: "6px 12px", background: selectedEvent === e.id ? "#6366f1" : "#f3f4f6", color: selectedEvent === e.id ? "#fff" : "#6b7280", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {e.icon} {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px", position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, area, city…"
                style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
              style={{ padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, background: "#fff", cursor: "pointer", outline: "none" }}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}
              style={{ padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 13, background: "#fff", cursor: "pointer", outline: "none" }}>
              <option value={0}>All Ratings</option>
              <option value={4}>4★ & above</option>
              <option value={4.5}>4.5★ & above</option>
            </select>
          </div>

          {/* Two-column layout: list + map */}
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0, height: "calc(100vh - 320px)", maxHeight: 620 }}>
            {/* Venue List */}
            <div style={{ width: 320, overflowY: "auto", paddingRight: 4, flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, fontWeight: 600 }}>
                {filteredVenues.length} VENUES FOUND
              </div>
              {filteredVenues.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🏛️</div>
                  <p style={{ fontSize: 14 }}>No venues match your filters.</p>
                </div>
              ) : (
                filteredVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} selected={selectedVenue?.id === venue.id}
                    onClick={(v) => { setSelectedVenue(v); setDetailVenue(v); }} />
                ))
              )}
            </div>

            {/* Map */}
            <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", border: "2px solid #e5e7eb", position: "relative", minWidth: 0 }}>
              <GoogleMapView
                venues={filteredVenues}
                selectedVenue={selectedVenue}
                onVenueSelect={(v) => { setSelectedVenue(v); setDetailVenue(v); }}
                apiKey={apiKey}
              />
              <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.95)", borderRadius: 10, padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontSize: 12, color: "#374151", backdropFilter: "blur(8px)" }}>
                🟡 Venue • 🔵 Selected
              </div>
            </div>
          </div>
        </>
      )}

      {detailVenue && <VenueDetailModal venue={detailVenue} onClose={() => setDetailVenue(null)} />}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VenueBookingSection() {
  const [activeTab, setActiveTab] = useState("browse");
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "linear-gradient(135deg, #f8faff 0%, #faf5ff 50%, #f0f9ff 100%)",
        minHeight: "100vh",
        padding: "32px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eef2ff", borderRadius: 30, padding: "6px 16px", marginBottom: 12 }}>
              <span style={{ fontSize: 14 }}>🏛️</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: 1, textTransform: "uppercase" }}>Venue Discovery</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.2 }}>
              Find Your Perfect <span style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Venue</span>
            </h1>
            <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>Discover stunning venues for every occasion — from intimate birthdays to grand weddings.</p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: "flex", background: "#fff", borderRadius: 16, padding: 6, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: 480, margin: "0 auto 24px" }}>
            {[
              { id: "browse", icon: "🗺️", label: "Browse Venues" },
              { id: "location", icon: "📍", label: "My Location" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: "12px 20px", border: "none", borderRadius: 12,
                  background: activeTab === tab.id ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                  color: activeTab === tab.id ? "#fff" : "#6b7280",
                  fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.25s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: activeTab === tab.id ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
                }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{
            background: "#fff", borderRadius: 20, padding: "24px 24px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid rgba(99,102,241,0.08)",
          }}>
            {activeTab === "browse" ? <BrowseTab apiKey={apiKey} /> : <LocationTab apiKey={apiKey} />}
          </div>
        </div>
      </div>
    </>
  );
}