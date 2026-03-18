import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];

export default function VenueSearch() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const sessionTokenRef = useRef(null);

  // Search
  const [keyword, setKeyword] = useState("");
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [showKeywordDropdown, setShowKeywordDropdown] = useState(false);

  // City
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Area
  const [areaInput, setAreaInput] = useState("");
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  // Rating
  const [filterRating, setFilterRating] = useState("");

  // Results
  const [places, setPlaces] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 17.385, lng: 78.4867 });

  // ── Init autocomplete service once map loads ──────────────────────────────
  useEffect(() => {
    if (isLoaded) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      sessionTokenRef.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  // ── Generic autocomplete fetcher ─────────────────────────────────────────
  const fetchSuggestions = useCallback((input, types, locationBias, callback) => {
    if (!autocompleteServiceRef.current || !input.trim()) {
      callback([]);
      return;
    }
    const req = {
      input,
      sessionToken: sessionTokenRef.current,
      types,
    };
    if (locationBias) req.locationBias = locationBias;

    autocompleteServiceRef.current.getPlacePredictions(req, (preds, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) {
        callback(preds);
      } else {
        callback([]);
      }
    });
  }, []);

  // ── Keyword suggestions ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !keyword.trim()) { setKeywordSuggestions([]); return; }
    const bias = selectedArea?.lat
      ? { center: { lat: selectedArea.lat, lng: selectedArea.lng }, radius: 5000 }
      : selectedCity?.lat
      ? { center: { lat: selectedCity.lat, lng: selectedCity.lng }, radius: 20000 }
      : { center: mapCenter, radius: 10000 };
    fetchSuggestions(keyword, ["establishment"], bias, setKeywordSuggestions);
  }, [keyword, isLoaded, selectedCity, selectedArea, mapCenter, fetchSuggestions]);

  // ── City suggestions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !cityInput.trim()) { setCitySuggestions([]); return; }
    fetchSuggestions(cityInput, ["(cities)"], null, setCitySuggestions);
  }, [cityInput, isLoaded, fetchSuggestions]);

  // ── Area suggestions (biased to selected city) ────────────────────────────
  useEffect(() => {
    if (!isLoaded || !areaInput.trim() || !selectedCity) { setAreaSuggestions([]); return; }
    const bias = selectedCity.lat
      ? { center: { lat: selectedCity.lat, lng: selectedCity.lng }, radius: 50000 }
      : null;
    fetchSuggestions(areaInput, ["sublocality", "neighborhood"], bias, setAreaSuggestions);
  }, [areaInput, isLoaded, selectedCity, fetchSuggestions]);

  // ── Resolve place_id → lat/lng ────────────────────────────────────────────
  const resolvePlace = (placeId, callback) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        callback({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  };

  // ── Select city from dropdown ─────────────────────────────────────────────
  const handleSelectCity = (pred) => {
    const name = pred.structured_formatting.main_text;
    setCityInput(name);
    setShowCityDropdown(false);
    setCitySuggestions([]);
    setSelectedArea(null);
    setAreaInput("");
    resolvePlace(pred.place_id, (coords) => {
      setSelectedCity({ name, placeId: pred.place_id, ...coords });
      setMapCenter(coords);
    });
  };

  // ── Select area from dropdown ─────────────────────────────────────────────
  const handleSelectArea = (pred) => {
    const name = pred.structured_formatting.main_text;
    setAreaInput(name);
    setShowAreaDropdown(false);
    setAreaSuggestions([]);
    resolvePlace(pred.place_id, (coords) => {
      setSelectedArea({ name, placeId: pred.place_id, ...coords });
      setMapCenter(coords);
    });
  };

  // ── Get current GPS location ──────────────────────────────────────────────
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setMapCenter(coords);
      setSelectedCity(null);
      setSelectedArea(null);
      setCityInput("");
      setAreaInput("");
    });
  };

  // ── Main search via Places nearbySearch ───────────────────────────────────
  const searchPlaces = () => {
    if (!mapRef.current) return;
    setIsSearching(true);
    setPlaces([]);
    setSelectedVenue(null);

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const center =
      selectedArea?.lat
        ? { lat: selectedArea.lat, lng: selectedArea.lng }
        : selectedCity?.lat
        ? { lat: selectedCity.lat, lng: selectedCity.lng }
        : mapCenter;

    const request = {
      location: new window.google.maps.LatLng(center.lat, center.lng),
      radius: selectedArea ? 3000 : selectedCity ? 10000 : 5000,
      keyword: keyword || "hotel resort banquet hall restaurant",
    };

    service.nearbySearch(request, (results, status) => {
      setIsSearching(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const formatted = results.map((place) => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          rating: place.rating || 0,
          ratingCount: place.user_ratings_total || 0,
          stars: Math.round(place.rating || 0),
          address: place.vicinity || "",
          area: place.vicinity?.split(",")[0] || "",
          types: place.types || [],
          openNow: place.opening_hours?.open_now,
          priceLevel: place.price_level,
          image: place.photos?.length
            ? place.photos[0].getUrl({ maxWidth: 320, maxHeight: 220 })
            : null,
        }));
        setPlaces(formatted);
        setMapCenter(center);
      }
    });
  };

  // ── Filter by rating ──────────────────────────────────────────────────────
  const filteredVenues = places.filter((p) =>
    filterRating ? p.rating >= Number(filterRating) : true
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const priceDisplay = (level) => (level != null ? "₹".repeat(level + 1) : null);

  const typeLabel = (types = []) => {
    const map = {
      lodging: "Hotel", restaurant: "Restaurant", food: "Food", bar: "Bar",
      cafe: "Café", spa: "Spa", gym: "Gym", night_club: "Night Club",
      tourist_attraction: "Attraction", event_venue: "Event Venue",
    };
    for (const t of types) if (map[t]) return map[t];
    return "Venue";
  };

  if (!isLoaded)
    return (
      <div style={s.loaderWrap}>
        <div style={s.spinner} />
        <span style={s.loaderTxt}>Initializing Maps…</span>
      </div>
    );

  return (
    <div style={s.root}>
      {/* HEADER */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}><span style={s.accent}>Venue</span> Finder</h1>
          <p style={s.sub}>100% live data from Google Maps — no hardcoded lists</p>
        </div>
      </div>

      <div style={s.body}>
        {/* ══ LEFT PANEL ══ */}
        <div style={s.panel}>

          {/* Keyword */}
          <div style={s.section}>
            <label style={s.label}>What are you looking for?</label>
            <div style={s.inputWrap}>
              <input
                style={s.input}
                placeholder="Hotels, restaurants, resorts, banquet halls…"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setShowKeywordDropdown(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setShowKeywordDropdown(false); searchPlaces(); } }}
                onBlur={() => setTimeout(() => setShowKeywordDropdown(false), 160)}
                onFocus={() => keyword && setShowKeywordDropdown(true)}
              />
              {showKeywordDropdown && keywordSuggestions.length > 0 && (
                <div style={s.dropdown}>
                  {keywordSuggestions.map((p) => (
                    <div key={p.place_id} style={s.dropItem}
                      onMouseDown={() => { setKeyword(p.structured_formatting.main_text); setShowKeywordDropdown(false); }}>
                      <span style={s.dropMain}>{p.structured_formatting.main_text}</span>
                      <span style={s.dropSub}>{p.structured_formatting.secondary_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* City */}
          <div style={s.section}>
            <label style={s.label}>City</label>
            <div style={s.inputWrap}>
              <input
                style={s.input}
                placeholder="Type any city…"
                value={cityInput}
                onChange={(e) => { setCityInput(e.target.value); setShowCityDropdown(true); if (!e.target.value) setSelectedCity(null); }}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 160)}
                onFocus={() => cityInput && setShowCityDropdown(true)}
              />
              {showCityDropdown && citySuggestions.length > 0 && (
                <div style={s.dropdown}>
                  {citySuggestions.map((p) => (
                    <div key={p.place_id} style={s.dropItem} onMouseDown={() => handleSelectCity(p)}>
                      <span style={s.dropMain}>{p.structured_formatting.main_text}</span>
                      <span style={s.dropSub}>{p.structured_formatting.secondary_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Area */}
          <div style={s.section}>
            <label style={{ ...s.label, opacity: selectedCity ? 1 : 0.4 }}>
              Area / Neighbourhood
            </label>
            <div style={s.inputWrap}>
              <input
                style={{ ...s.input, opacity: selectedCity ? 1 : 0.45, cursor: selectedCity ? "text" : "not-allowed" }}
                placeholder={selectedCity ? `Type area in ${selectedCity.name}…` : "Select a city first"}
                value={areaInput}
                disabled={!selectedCity}
                onChange={(e) => { setAreaInput(e.target.value); setShowAreaDropdown(true); if (!e.target.value) setSelectedArea(null); }}
                onBlur={() => setTimeout(() => setShowAreaDropdown(false), 160)}
                onFocus={() => areaInput && setShowAreaDropdown(true)}
              />
              {showAreaDropdown && areaSuggestions.length > 0 && (
                <div style={s.dropdown}>
                  {areaSuggestions.map((p) => (
                    <div key={p.place_id} style={s.dropItem} onMouseDown={() => handleSelectArea(p)}>
                      <span style={s.dropMain}>{p.structured_formatting.main_text}</span>
                      <span style={s.dropSub}>{p.structured_formatting.secondary_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          <div style={s.section}>
            <label style={s.label}>Minimum Rating</label>
            <div style={s.ratingRow}>
              {[["", "All"], ["3", "3★+"], ["4", "4★+"], ["4.5", "4.5★+"]].map(([val, lbl]) => (
                <button key={val}
                  style={{ ...s.ratingBtn, ...(filterRating === val ? s.ratingBtnActive : {}) }}
                  onClick={() => setFilterRating(val)}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={s.actionRow}>
            <button style={s.locBtn} onClick={getCurrentLocation}>📍 Near Me</button>
            <button
              style={{ ...s.searchBtn, opacity: isSearching ? 0.65 : 1 }}
              onClick={searchPlaces}
              disabled={isSearching}>
              {isSearching ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Active filter chips */}
          {(keyword || selectedCity || selectedArea || filterRating) && (
            <div style={s.chips}>
              {keyword && <span style={s.chip}>🔍 {keyword}</span>}
              {selectedCity && <span style={s.chip}>🏙 {selectedCity.name}</span>}
              {selectedArea && <span style={s.chip}>📌 {selectedArea.name}</span>}
              {filterRating && <span style={s.chip}>⭐ {filterRating}+</span>}
            </div>
          )}

          {/* Count */}
          {(isSearching || places.length > 0) && (
            <div style={s.countBar}>
              <span style={s.countTxt}>
                {isSearching
                  ? "Fetching from Google Maps…"
                  : `${filteredVenues.length} of ${places.length} venues`}
              </span>
            </div>
          )}

          {/* List */}
          <div style={s.list}>
            {!isSearching && filteredVenues.length === 0 && (
              <div style={s.empty}>
                <div style={s.emptyIcon}>🏨</div>
                <p style={s.emptyTxt}>
                  {places.length > 0
                    ? "No venues match your rating filter"
                    : "Search to discover live venues from Google Maps"}
                </p>
              </div>
            )}

            {filteredVenues.map((venue) => (
              <div key={venue.id}
                style={{ ...s.card, ...(selectedVenue?.id === venue.id ? s.cardActive : {}) }}
                onClick={() => { setSelectedVenue(venue); setMapCenter({ lat: venue.lat, lng: venue.lng }); }}>

                <div style={s.cardImgWrap}>
                  {venue.image
                    ? <img src={venue.image} alt={venue.name} style={s.cardImg} />
                    : <div style={s.cardImgPlaceholder}>{venue.name.charAt(0)}</div>
                  }
                  {venue.openNow != null && (
                    <span style={{ ...s.openBadge, background: venue.openNow ? "#16a34a" : "#dc2626" }}>
                      {venue.openNow ? "Open" : "Closed"}
                    </span>
                  )}
                </div>

                <div style={s.cardInfo}>
                  <div style={s.cardName}>{venue.name}</div>
                  <div style={s.cardMeta}>
                    <span style={s.typeBadge}>{typeLabel(venue.types)}</span>
                    {venue.priceLevel != null && <span style={s.priceTag}>{priceDisplay(venue.priceLevel)}</span>}
                  </div>
                  <div style={s.starsRow}>
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} style={{ fontSize: 12, color: i <= venue.stars ? "#f59e0b" : "#2a2a4a" }}>★</span>
                    ))}
                    {venue.rating > 0 && <span style={s.ratingVal}>{venue.rating.toFixed(1)}</span>}
                    {venue.ratingCount > 0 && <span style={s.ratingCount}>({venue.ratingCount.toLocaleString()})</span>}
                  </div>
                  <div style={s.cardAddr}>{venue.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ MAP ══ */}
        <div style={s.mapWrap}>
          <GoogleMap
            zoom={selectedArea ? 14 : selectedCity ? 12 : 13}
            center={mapCenter}
            onLoad={(m) => (mapRef.current = m)}
            mapContainerStyle={s.map}
            options={{ styles: darkMap, streetViewControl: false, mapTypeControl: false }}
          >
            {filteredVenues.map((venue) => (
              <Marker key={venue.id}
                position={{ lat: venue.lat, lng: venue.lng }}
                onClick={() => { setSelectedVenue(venue); setMapCenter({ lat: venue.lat, lng: venue.lng }); }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: selectedVenue?.id === venue.id ? 11 : 7,
                  fillColor: selectedVenue?.id === venue.id ? "#f59e0b" : "#7c6af7",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                }}
              />
            ))}

            {selectedVenue && (
              <InfoWindow
                position={{ lat: selectedVenue.lat, lng: selectedVenue.lng }}
                onCloseClick={() => setSelectedVenue(null)}>
                <div style={iw.wrap}>
                  {selectedVenue.image && <img src={selectedVenue.image} alt={selectedVenue.name} style={iw.img} />}
                  <div style={iw.name}>{selectedVenue.name}</div>
                  <div style={iw.type}>{typeLabel(selectedVenue.types)}</div>
                  <div style={iw.starsRow}>
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} style={{ color: i <= selectedVenue.stars ? "#f59e0b" : "#ccc", fontSize: 13 }}>★</span>
                    ))}
                    {selectedVenue.rating > 0 && <span style={iw.ratingTxt}>{selectedVenue.rating.toFixed(1)}</span>}
                  </div>
                  <div style={iw.addr}>{selectedVenue.address}</div>
                  {selectedVenue.openNow != null && (
                    <div style={{ ...iw.open, color: selectedVenue.openNow ? "#16a34a" : "#dc2626" }}>
                      {selectedVenue.openNow ? "✓ Open Now" : "✗ Closed"}
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0c0c1d", minHeight: "100vh", color: "#e2e2f0", display: "flex", flexDirection: "column" },
  loaderWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: "100vh", background: "#0c0c1d", flexDirection: "column" },
  spinner: { width: 30, height: 30, border: "3px solid #1e1e3a", borderTop: "3px solid #7c6af7", borderRadius: "50%" },
  loaderTxt: { color: "#5a5a8a", fontSize: 13 },
  header: { padding: "18px 24px", borderBottom: "1px solid #1a1a30" },
  title: { margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px" },
  accent: { color: "#f59e0b" },
  sub: { margin: "3px 0 0", fontSize: 11, color: "#4a4a7a" },
  body: { display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 67px)" },
  panel: { width: 360, minWidth: 320, display: "flex", flexDirection: "column", borderRight: "1px solid #1a1a30", overflowY: "auto", padding: "16px 14px", gap: 0 },
  section: { marginBottom: 14, position: "relative" },
  label: { display: "block", fontSize: 10, fontWeight: 700, color: "#4a4a7a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 },
  inputWrap: { position: "relative" },
  input: { width: "100%", background: "#13132a", border: "1px solid #22223a", borderRadius: 8, padding: "9px 12px", color: "#e2e2f0", fontSize: 13, outline: "none", boxSizing: "border-box" },
  dropdown: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#13132a", border: "1px solid #22223a", borderRadius: 8, zIndex: 999, boxShadow: "0 8px 28px rgba(0,0,0,0.6)", overflow: "hidden", maxHeight: 230, overflowY: "auto" },
  dropItem: { padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #1a1a30", display: "flex", flexDirection: "column", gap: 1 },
  dropMain: { fontSize: 13, color: "#e2e2f0", fontWeight: 500 },
  dropSub: { fontSize: 11, color: "#4a4a7a" },
  ratingRow: { display: "flex", gap: 6 },
  ratingBtn: { flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid #22223a", background: "#13132a", color: "#5a5a8a", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  ratingBtnActive: { background: "#f59e0b", borderColor: "#f59e0b", color: "#000" },
  actionRow: { display: "flex", gap: 8, marginBottom: 12 },
  locBtn: { flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #22223a", background: "#13132a", color: "#7c6af7", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  searchBtn: { flex: 2, padding: "9px 0", borderRadius: 8, border: "none", background: "#7c6af7", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip: { fontSize: 11, background: "#1a1a32", border: "1px solid #2a2a50", borderRadius: 20, padding: "3px 10px", color: "#7070b0" },
  countBar: { marginBottom: 8 },
  countTxt: { fontSize: 11, color: "#4a4a7a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" },
  list: { display: "flex", flexDirection: "column", gap: 8, paddingBottom: 20 },
  empty: { textAlign: "center", marginTop: 50 },
  emptyIcon: { fontSize: 34, marginBottom: 8 },
  emptyTxt: { fontSize: 12, color: "#2e2e5e" },
  card: { display: "flex", gap: 10, padding: 11, borderRadius: 12, border: "1px solid #1a1a30", background: "#111128", cursor: "pointer", transition: "all 0.15s" },
  cardActive: { border: "1px solid #7c6af7", background: "#181836", boxShadow: "0 0 0 3px rgba(124,106,247,0.1)" },
  cardImgWrap: { position: "relative", flexShrink: 0 },
  cardImg: { width: 74, height: 74, borderRadius: 8, objectFit: "cover", display: "block" },
  cardImgPlaceholder: { width: 74, height: 74, borderRadius: 8, background: "#1e1e3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#7c6af7", fontWeight: 700 },
  openBadge: { position: "absolute", bottom: 4, left: 4, fontSize: 9, fontWeight: 700, color: "#fff", borderRadius: 4, padding: "2px 5px", textTransform: "uppercase", letterSpacing: "0.3px" },
  cardInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  cardName: { fontWeight: 600, fontSize: 13, color: "#e2e2f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardMeta: { display: "flex", gap: 5, alignItems: "center" },
  typeBadge: { fontSize: 9, background: "#7c6af712", color: "#9d90f7", border: "1px solid #7c6af728", padding: "2px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" },
  priceTag: { fontSize: 11, color: "#4a4a7a", fontWeight: 600 },
  starsRow: { display: "flex", alignItems: "center", gap: 1 },
  ratingVal: { fontSize: 11, color: "#f59e0b", fontWeight: 700, marginLeft: 4 },
  ratingCount: { fontSize: 10, color: "#333360", marginLeft: 2 },
  cardAddr: { fontSize: 10, color: "#333360", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  mapWrap: { flex: 1, position: "relative" },
  map: { width: "100%", height: "100%" },
};

const iw = {
  wrap: { fontFamily: "DM Sans,sans-serif", maxWidth: 200, padding: 2 },
  img: { width: "100%", height: 100, objectFit: "cover", borderRadius: 6, marginBottom: 6, display: "block" },
  name: { fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 2 },
  type: { fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 },
  starsRow: { display: "flex", alignItems: "center", gap: 1, marginBottom: 3 },
  ratingTxt: { fontSize: 11, color: "#f59e0b", fontWeight: 700, marginLeft: 4 },
  addr: { fontSize: 11, color: "#666", marginBottom: 4 },
  open: { fontSize: 11, fontWeight: 700 },
};

const darkMap = [
  { elementType: "geometry", stylers: [{ color: "#13132a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#13132a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6060a0" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1e1e3a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9090c0" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e1e3a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0c0c1d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5050a0" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#8080c0" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0a1a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a3a6a" }] },
];