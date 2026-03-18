import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

const libraries = ["places", "geocoding"];

// ─── tiny helpers ────────────────────────────────────────────────────────────
const typeLabel = (types = []) => {
  const map = {
    lodging: "Hotel", restaurant: "Restaurant", food: "Food", bar: "Bar",
    cafe: "Café", spa: "Spa", gym: "Gym", night_club: "Night Club",
    tourist_attraction: "Attraction", event_venue: "Event Venue",
  };
  for (const t of types) if (map[t]) return map[t];
  return "Venue";
};
const priceDisplay = (l) => (l != null ? "₹".repeat(l + 1) : null);

// ─── LOCATION MODES ──────────────────────────────────────────────────────────
// "none"   → nothing selected yet
// "gps"    → navigator.geolocation
// "pin"    → user clicked somewhere on the map
// "manual" → user typed an address

export default function VenueSearch() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef          = useRef(null);
  const acServiceRef    = useRef(null);
  const sessionTokenRef = useRef(null);

  // ── location state ────────────────────────────────────────────────────────
  const [locationMode,    setLocationMode]    = useState("none");   // "none"|"gps"|"pin"|"manual"
  const [userLocation,    setUserLocation]    = useState(null);     // { lat, lng }
  const [locationAddress, setLocationAddress] = useState("");       // reverse-geocoded label
  const [pinMode,         setPinMode]         = useState(false);    // map click = drop pin?
  const [pinMarker,       setPinMarker]       = useState(null);     // { lat, lng }
  const [manualInput,     setManualInput]     = useState("");       // typed address
  const [manualSuggestions, setManualSuggestions] = useState([]);
  const [showManualDrop,  setShowManualDrop]  = useState(false);
  const [gpsLoading,      setGpsLoading]      = useState(false);

  // ── search state ──────────────────────────────────────────────────────────
  const [keyword,          setKeyword]          = useState("");
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [showKeywordDrop,  setShowKeywordDrop]  = useState(false);

  const [cityInput,        setCityInput]        = useState("");
  const [citySuggestions,  setCitySuggestions]  = useState([]);
  const [showCityDrop,     setShowCityDrop]     = useState(false);
  const [selectedCity,     setSelectedCity]     = useState(null);

  const [areaInput,        setAreaInput]        = useState("");
  const [areaSuggestions,  setAreaSuggestions]  = useState([]);
  const [showAreaDrop,     setShowAreaDrop]     = useState(false);
  const [selectedArea,     setSelectedArea]     = useState(null);

  const [filterRating,     setFilterRating]     = useState("");

  // ── result state ──────────────────────────────────────────────────────────
  const [places,        setPlaces]        = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isSearching,   setIsSearching]   = useState(false);
  const [mapCenter,     setMapCenter]     = useState({ lat: 17.385, lng: 78.4867 });

  // ── init autocomplete service ─────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded) {
      acServiceRef.current    = new window.google.maps.places.AutocompleteService();
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  // ── generic autocomplete fetch ────────────────────────────────────────────
  const fetchAC = useCallback((input, types, bias, cb) => {
    if (!acServiceRef.current || !input.trim()) { cb([]); return; }
    const req = { input, sessionToken: sessionTokenRef.current, types };
    if (bias) req.locationBias = bias;
    acServiceRef.current.getPlacePredictions(req, (preds, status) => {
      cb(status === window.google.maps.places.PlacesServiceStatus.OK && preds ? preds : []);
    });
  }, []);

  // ── keyword suggestions ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !keyword.trim()) { setKeywordSuggestions([]); return; }
    const center = userLocation || pinMarker || mapCenter;
    fetchAC(keyword, ["establishment"],
      { center: { lat: center.lat, lng: center.lng }, radius: 15000 },
      setKeywordSuggestions);
  }, [keyword, isLoaded, userLocation, pinMarker, mapCenter, fetchAC]);

  // ── city suggestions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !cityInput.trim()) { setCitySuggestions([]); return; }
    fetchAC(cityInput, ["(cities)"], null, setCitySuggestions);
  }, [cityInput, isLoaded, fetchAC]);

  // ── area suggestions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !areaInput.trim() || !selectedCity) { setAreaSuggestions([]); return; }
    fetchAC(areaInput, ["sublocality", "neighborhood"],
      selectedCity.lat ? { center: { lat: selectedCity.lat, lng: selectedCity.lng }, radius: 50000 } : null,
      setAreaSuggestions);
  }, [areaInput, isLoaded, selectedCity, fetchAC]);

  // ── manual address suggestions ────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !manualInput.trim()) { setManualSuggestions([]); return; }
    fetchAC(manualInput, ["geocode", "establishment"], null, setManualSuggestions);
  }, [manualInput, isLoaded, fetchAC]);

  // ── resolve placeId → coords ──────────────────────────────────────────────
  const resolvePlace = useCallback((placeId, cb) => {
    new window.google.maps.Geocoder().geocode({ placeId }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        cb({ lat: loc.lat(), lng: loc.lng() }, results[0].formatted_address);
      }
    });
  }, []);

  // ── reverse geocode coords → address string ───────────────────────────────
  const reverseGeocode = useCallback((lat, lng, cb) => {
    new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) cb(results[0].formatted_address);
      else cb(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });
  }, []);

  // ── GPS ───────────────────────────────────────────────────────────────────
  const handleGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        reverseGeocode(coords.lat, coords.lng, (addr) => {
          setUserLocation(coords);
          setLocationAddress(addr);
          setLocationMode("gps");
          setMapCenter(coords);
          setPinMarker(null);
          setPinMode(false);
          setGpsLoading(false);
        });
      },
      () => {
        setGpsLoading(false);
        alert("Could not get your location. Please allow location access.");
      }
    );
  };

  // ── map click → pin ───────────────────────────────────────────────────────
  const handleMapClick = useCallback((e) => {
    if (!pinMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    reverseGeocode(lat, lng, (addr) => {
      setPinMarker({ lat, lng });
      setLocationAddress(addr);
      setUserLocation({ lat, lng });
      setLocationMode("pin");
      setMapCenter({ lat, lng });
      setPinMode(false);
    });
  }, [pinMode, reverseGeocode]);

  // ── manual address select ─────────────────────────────────────────────────
  const handleManualSelect = (pred) => {
    setManualInput(pred.description);
    setShowManualDrop(false);
    resolvePlace(pred.place_id, (coords, addr) => {
      setUserLocation(coords);
      setLocationAddress(addr || pred.description);
      setLocationMode("manual");
      setMapCenter(coords);
      setPinMarker(null);
    });
  };

  // ── city select ───────────────────────────────────────────────────────────
  const handleSelectCity = (pred) => {
    setCityInput(pred.structured_formatting.main_text);
    setShowCityDrop(false); setCitySuggestions([]);
    setSelectedArea(null); setAreaInput("");
    resolvePlace(pred.place_id, (coords) => {
      setSelectedCity({ name: pred.structured_formatting.main_text, placeId: pred.place_id, ...coords });
      setMapCenter(coords);
    });
  };

  // ── area select ───────────────────────────────────────────────────────────
  const handleSelectArea = (pred) => {
    setAreaInput(pred.structured_formatting.main_text);
    setShowAreaDrop(false); setAreaSuggestions([]);
    resolvePlace(pred.place_id, (coords) => {
      setSelectedArea({ name: pred.structured_formatting.main_text, placeId: pred.place_id, ...coords });
      setMapCenter(coords);
    });
  };

  // ── clear location ────────────────────────────────────────────────────────
  const clearLocation = () => {
    setLocationMode("none"); setUserLocation(null);
    setLocationAddress(""); setPinMarker(null);
    setPinMode(false); setManualInput("");
  };

  // ── search ────────────────────────────────────────────────────────────────
  const searchPlaces = () => {
    if (!mapRef.current) return;
    setIsSearching(true); setPlaces([]); setSelectedVenue(null);

    const service = new window.google.maps.places.PlacesService(mapRef.current);

    // priority: area > city > user location pin/gps > default center
    const center =
      selectedArea?.lat   ? { lat: selectedArea.lat,   lng: selectedArea.lng }   :
      selectedCity?.lat   ? { lat: selectedCity.lat,   lng: selectedCity.lng }   :
      userLocation        ? { lat: userLocation.lat,   lng: userLocation.lng }   :
      mapCenter;

    const radius =
      selectedArea  ? 3000  :
      selectedCity  ? 10000 :
      userLocation  ? 5000  : 5000;

    service.nearbySearch({
      location: new window.google.maps.LatLng(center.lat, center.lng),
      radius,
      keyword: keyword || "hotel resort banquet hall restaurant",
    }, (results, status) => {
      setIsSearching(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results.map((place) => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          rating: place.rating || 0,
          ratingCount: place.user_ratings_total || 0,
          stars: Math.round(place.rating || 0),
          address: place.vicinity || "",
          types: place.types || [],
          openNow: place.opening_hours?.open_now,
          priceLevel: place.price_level,
          image: place.photos?.length
            ? place.photos[0].getUrl({ maxWidth: 320, maxHeight: 220 })
            : null,
        })));
        setMapCenter(center);
      }
    });
  };

  const filteredVenues = places.filter((p) =>
    filterRating ? p.rating >= Number(filterRating) : true
  );

  // ─────────────────────────────────────────────────────────────────────────
  if (!isLoaded)
    return (
      <div style={s.loaderWrap}>
        <div style={s.spinner} />
        <p style={s.loaderTxt}>Loading Google Maps…</p>
      </div>
    );

  return (
    <div style={s.root}>
      {/* ── HEADER ── */}
      <div style={s.header}>
        <h1 style={s.title}><span style={s.accent}>Venue</span> Finder</h1>
        <p style={s.sub}>Live search · GPS · Map Pin · Manual Address</p>
      </div>

      <div style={s.body}>
        {/* ════════ LEFT PANEL ════════ */}
        <div style={s.panel}>

          {/* ── LOCATION SECTION ── */}
          <div style={s.sectionCard}>
            <div style={s.sectionHead}>
              <span style={s.sectionIcon}>📍</span>
              <span style={s.sectionTitle}>Set Your Location</span>
              {locationMode !== "none" && (
                <button style={s.clearBtn} onClick={clearLocation}>✕ Clear</button>
              )}
            </div>

            {/* Active location pill */}
            {locationMode !== "none" && (
              <div style={s.locPill}>
                <span style={s.locPillIcon}>
                  {locationMode === "gps" ? "🛰" : locationMode === "pin" ? "📌" : "🔤"}
                </span>
                <span style={s.locPillTxt}>{locationAddress}</span>
              </div>
            )}

            {/* Three mode buttons */}
            <div style={s.modeRow}>
              {/* GPS */}
              <button
                style={{ ...s.modeBtn, ...(locationMode === "gps" ? s.modeBtnActive : {}) }}
                onClick={handleGPS}
                disabled={gpsLoading}
              >
                {gpsLoading ? <span style={s.modeBtnSpinner} /> : "🛰"}
                <span>{gpsLoading ? "Locating…" : "GPS"}</span>
              </button>

              {/* Pin on map */}
              <button
                style={{
                  ...s.modeBtn,
                  ...(pinMode ? s.modeBtnPinActive : locationMode === "pin" ? s.modeBtnActive : {}),
                }}
                onClick={() => { setPinMode((v) => !v); }}
              >
                📌
                <span>{pinMode ? "Click map ▶" : "Pin Map"}</span>
              </button>

              {/* Manual */}
              <button
                style={{ ...s.modeBtn, ...(locationMode === "manual" ? s.modeBtnActive : {}) }}
                onClick={() => { setLocationMode("manual"); }}
              >
                🔤
                <span>Address</span>
              </button>
            </div>

            {/* Pin hint */}
            {pinMode && (
              <div style={s.pinHint}>
                ☝ Click anywhere on the map to drop a pin
              </div>
            )}

            {/* Manual address input */}
            {(locationMode === "manual" || (locationMode === "none" && manualInput)) && (
              <div style={{ ...s.inputWrap, marginTop: 10 }}>
                <input
                  style={s.input}
                  placeholder="Type any address, landmark or place…"
                  value={manualInput}
                  onChange={(e) => { setManualInput(e.target.value); setShowManualDrop(true); }}
                  onBlur={() => setTimeout(() => setShowManualDrop(false), 160)}
                  onFocus={() => manualInput && setShowManualDrop(true)}
                  autoFocus
                />
                {showManualDrop && manualSuggestions.length > 0 && (
                  <div style={s.dropdown}>
                    {manualSuggestions.map((p) => (
                      <div key={p.place_id} style={s.dropItem} onMouseDown={() => handleManualSelect(p)}>
                        <span style={s.dropMain}>{p.structured_formatting.main_text}</span>
                        <span style={s.dropSub}>{p.structured_formatting.secondary_text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SEARCH SECTION ── */}
          <div style={s.sectionCard}>
            <div style={s.sectionHead}>
              <span style={s.sectionIcon}>🔍</span>
              <span style={s.sectionTitle}>Search Venues</span>
            </div>

            {/* Keyword */}
            <label style={s.label}>What are you looking for?</label>
            <div style={{ ...s.inputWrap, marginBottom: 10 }}>
              <input
                style={s.input}
                placeholder="Hotels, resorts, banquet halls, restaurants…"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setShowKeywordDrop(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setShowKeywordDrop(false); searchPlaces(); } }}
                onBlur={() => setTimeout(() => setShowKeywordDrop(false), 160)}
                onFocus={() => keyword && setShowKeywordDrop(true)}
              />
              {showKeywordDrop && keywordSuggestions.length > 0 && (
                <div style={s.dropdown}>
                  {keywordSuggestions.map((p) => (
                    <div key={p.place_id} style={s.dropItem}
                      onMouseDown={() => { setKeyword(p.structured_formatting.main_text); setShowKeywordDrop(false); }}>
                      <span style={s.dropMain}>{p.structured_formatting.main_text}</span>
                      <span style={s.dropSub}>{p.structured_formatting.secondary_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* City */}
            <label style={s.label}>City</label>
            <div style={{ ...s.inputWrap, marginBottom: 10 }}>
              <input
                style={s.input}
                placeholder="Type any city…"
                value={cityInput}
                onChange={(e) => { setCityInput(e.target.value); setShowCityDrop(true); if (!e.target.value) setSelectedCity(null); }}
                onBlur={() => setTimeout(() => setShowCityDrop(false), 160)}
                onFocus={() => cityInput && setShowCityDrop(true)}
              />
              {showCityDrop && citySuggestions.length > 0 && (
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

            {/* Area */}
            <label style={{ ...s.label, opacity: selectedCity ? 1 : 0.4 }}>Area / Neighbourhood</label>
            <div style={{ ...s.inputWrap, marginBottom: 12 }}>
              <input
                style={{ ...s.input, opacity: selectedCity ? 1 : 0.45, cursor: selectedCity ? "text" : "not-allowed" }}
                placeholder={selectedCity ? `Areas in ${selectedCity.name}…` : "Select a city first"}
                value={areaInput}
                disabled={!selectedCity}
                onChange={(e) => { setAreaInput(e.target.value); setShowAreaDrop(true); if (!e.target.value) setSelectedArea(null); }}
                onBlur={() => setTimeout(() => setShowAreaDrop(false), 160)}
                onFocus={() => areaInput && setShowAreaDrop(true)}
              />
              {showAreaDrop && areaSuggestions.length > 0 && (
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

            {/* Rating */}
            <label style={s.label}>Minimum Rating</label>
            <div style={{ ...s.ratingRow, marginBottom: 12 }}>
              {[["", "All"], ["3", "3★+"], ["4", "4★+"], ["4.5", "4.5★+"]].map(([val, lbl]) => (
                <button key={val}
                  style={{ ...s.ratingBtn, ...(filterRating === val ? s.ratingBtnActive : {}) }}
                  onClick={() => setFilterRating(val)}>{lbl}</button>
              ))}
            </div>

            {/* Search button */}
            <button
              style={{ ...s.searchBtn, opacity: isSearching ? 0.65 : 1 }}
              onClick={searchPlaces}
              disabled={isSearching}>
              {isSearching ? "Searching Google Maps…" : "🔍  Search Venues"}
            </button>
          </div>

          {/* ── Active chips ── */}
          {(keyword || selectedCity || selectedArea || locationMode !== "none") && (
            <div style={s.chips}>
              {locationMode !== "none" && <span style={{ ...s.chip, borderColor: "#22c55e40", color: "#22c55e" }}>📍 {locationMode === "gps" ? "GPS" : locationMode === "pin" ? "Pinned" : "Manual"}</span>}
              {keyword && <span style={s.chip}>🔍 {keyword}</span>}
              {selectedCity && <span style={s.chip}>🏙 {selectedCity.name}</span>}
              {selectedArea && <span style={s.chip}>📌 {selectedArea.name}</span>}
              {filterRating && <span style={s.chip}>⭐ {filterRating}+</span>}
            </div>
          )}

          {/* ── Count ── */}
          {(isSearching || places.length > 0) && (
            <div style={s.countBar}>
              <span style={s.countTxt}>
                {isSearching ? "Fetching from Google Maps…" : `${filteredVenues.length} of ${places.length} venues`}
              </span>
            </div>
          )}

          {/* ── Venue list ── */}
          <div style={s.list}>
            {!isSearching && filteredVenues.length === 0 && (
              <div style={s.empty}>
                <div style={s.emptyIcon}>🏨</div>
                <p style={s.emptyTxt}>
                  {places.length > 0
                    ? "No venues match your rating filter"
                    : "Set a location & search to discover venues"}
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
                    : <div style={s.cardImgPh}>{venue.name.charAt(0)}</div>}
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

        {/* ════════ MAP ════════ */}
        <div style={s.mapWrap}>
          {/* Pin mode overlay banner */}
          {pinMode && (
            <div style={s.pinBanner}>
              📌 Click anywhere on the map to set your location
              <button style={s.pinCancelBtn} onClick={() => setPinMode(false)}>Cancel</button>
            </div>
          )}

          <GoogleMap
            zoom={13}
            center={mapCenter}
            onLoad={(m) => (mapRef.current = m)}
            onClick={handleMapClick}
            mapContainerStyle={{
              ...s.map,
              cursor: pinMode ? "crosshair" : "grab",
            }}
            options={{
              styles: darkMap,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              zoomControl: true,
            }}
          >
            {/* User location / pin marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: locationMode === "pin" ? "#f97316" : "#22c55e",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                }}
                zIndex={1000}
              />
            )}

            {/* Venue markers */}
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

            {/* Venue info window */}
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

            {/* User location InfoWindow */}
            {userLocation && locationMode !== "none" && !pinMode && (
              <InfoWindow
                position={userLocation}
                options={{ disableAutoPan: true }}
                onCloseClick={clearLocation}>
                <div style={{ fontFamily: "DM Sans,sans-serif", maxWidth: 220, padding: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#111", marginBottom: 4 }}>
                    {locationMode === "gps" ? "🛰 Your GPS Location" :
                     locationMode === "pin" ? "📌 Pinned Location" : "🔤 Manual Location"}
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>{locationAddress}</div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Map legend */}
          <div style={s.legend}>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#22c55e" }} />GPS</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#f97316" }} />Pin</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#7c6af7" }} />Venue</div>
            <div style={s.legendItem}><div style={{ ...s.legendDot, background: "#f59e0b" }} />Selected</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = {
  root: { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0c0c1d", minHeight: "100vh", color: "#e2e2f0", display: "flex", flexDirection: "column" },
  loaderWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, height: "100vh", background: "#0c0c1d" },
  spinner: { width: 30, height: 30, border: "3px solid #1e1e3a", borderTop: "3px solid #7c6af7", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loaderTxt: { color: "#5a5a8a", fontSize: 13, margin: 0 },
  header: { padding: "16px 24px", borderBottom: "1px solid #1a1a30", flexShrink: 0 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px" },
  accent: { color: "#f59e0b" },
  sub: { margin: "2px 0 0", fontSize: 11, color: "#4a4a7a" },
  body: { display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 67px)" },

  // Panel
  panel: { width: 370, minWidth: 330, display: "flex", flexDirection: "column", borderRight: "1px solid #1a1a30", overflowY: "auto", padding: "12px", gap: 10 },

  sectionCard: { background: "#111128", border: "1px solid #1a1a30", borderRadius: 12, padding: "14px 14px 12px" },
  sectionHead: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionIcon: { fontSize: 14 },
  sectionTitle: { fontWeight: 700, fontSize: 13, color: "#c0c0e0", flex: 1 },
  clearBtn: { fontSize: 11, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" },

  // Location pill
  locPill: { display: "flex", alignItems: "flex-start", gap: 7, background: "#0c0c1d", border: "1px solid #22223a", borderRadius: 8, padding: "8px 10px", marginBottom: 10 },
  locPillIcon: { fontSize: 14, flexShrink: 0, marginTop: 1 },
  locPillTxt: { fontSize: 11, color: "#9090c0", lineHeight: 1.5, wordBreak: "break-word" },

  // Mode buttons
  modeRow: { display: "flex", gap: 7 },
  modeBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px 8px", borderRadius: 10, border: "1px solid #22223a", background: "#0c0c1d", color: "#7070a0", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", lineHeight: 1 },
  modeBtnActive: { border: "1px solid #22c55e", background: "#0d2010", color: "#22c55e" },
  modeBtnPinActive: { border: "1px solid #f97316", background: "#1a0e00", color: "#f97316" },
  modeBtnSpinner: { width: 14, height: 14, border: "2px solid #22223a", borderTop: "2px solid #22c55e", borderRadius: "50%", display: "inline-block" },

  pinHint: { marginTop: 8, fontSize: 11, color: "#f97316", background: "#1a0e0030", border: "1px dashed #f9731640", borderRadius: 7, padding: "7px 10px", textAlign: "center" },

  // Inputs & dropdowns
  label: { display: "block", fontSize: 10, fontWeight: 700, color: "#4a4a7a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 },
  inputWrap: { position: "relative" },
  input: { width: "100%", background: "#0c0c1d", border: "1px solid #22223a", borderRadius: 8, padding: "9px 12px", color: "#e2e2f0", fontSize: 13, outline: "none", boxSizing: "border-box" },
  dropdown: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#13132a", border: "1px solid #22223a", borderRadius: 8, zIndex: 9999, boxShadow: "0 8px 28px rgba(0,0,0,0.7)", overflow: "hidden", maxHeight: 220, overflowY: "auto" },
  dropItem: { padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #1a1a30", display: "flex", flexDirection: "column", gap: 1 },
  dropMain: { fontSize: 13, color: "#e2e2f0", fontWeight: 500 },
  dropSub: { fontSize: 11, color: "#4a4a7a" },

  // Rating
  ratingRow: { display: "flex", gap: 6 },
  ratingBtn: { flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid #22223a", background: "#0c0c1d", color: "#5a5a8a", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  ratingBtnActive: { background: "#f59e0b", borderColor: "#f59e0b", color: "#000" },

  // Search button
  searchBtn: { width: "100%", padding: "11px 0", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#7c6af7,#5b48e8)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.2px" },

  // Chips
  chips: { display: "flex", flexWrap: "wrap", gap: 5 },
  chip: { fontSize: 11, background: "#1a1a32", border: "1px solid #2a2a50", borderRadius: 20, padding: "3px 10px", color: "#7070b0" },

  // Count
  countBar: {},
  countTxt: { fontSize: 11, color: "#4a4a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" },

  // List
  list: { display: "flex", flexDirection: "column", gap: 8, paddingBottom: 20 },
  empty: { textAlign: "center", marginTop: 40 },
  emptyIcon: { fontSize: 34, marginBottom: 8 },
  emptyTxt: { fontSize: 12, color: "#2e2e5e" },

  // Cards
  card: { display: "flex", gap: 10, padding: 11, borderRadius: 12, border: "1px solid #1a1a30", background: "#111128", cursor: "pointer", transition: "all 0.15s" },
  cardActive: { border: "1px solid #7c6af7", background: "#181836", boxShadow: "0 0 0 3px rgba(124,106,247,0.1)" },
  cardImgWrap: { position: "relative", flexShrink: 0 },
  cardImg: { width: 74, height: 74, borderRadius: 8, objectFit: "cover", display: "block" },
  cardImgPh: { width: 74, height: 74, borderRadius: 8, background: "#1e1e3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#7c6af7", fontWeight: 700 },
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

  // Map
  mapWrap: { flex: 1, position: "relative" },
  map: { width: "100%", height: "100%" },
  pinBanner: { position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 10, background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 10, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 20px rgba(249,115,22,0.5)", whiteSpace: "nowrap" },
  pinCancelBtn: { background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 },
  legend: { position: "absolute", bottom: 16, right: 16, background: "rgba(12,12,29,0.88)", border: "1px solid #1a1a30", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 12, backdropFilter: "blur(6px)" },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#7070a0", fontWeight: 600 },
  legendDot: { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 },
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