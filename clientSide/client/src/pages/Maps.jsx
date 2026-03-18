import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

// ── stable references outside component ──────────────────────────────────────
const LIBRARIES = ["places"];
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };

const TYPE_MAP = {
  lodging: "Hotel", restaurant: "Restaurant", food: "Food", bar: "Bar",
  cafe: "Café", spa: "Spa", gym: "Gym", night_club: "Night Club",
  tourist_attraction: "Attraction", event_venue: "Event Venue",
};
const typeLabel  = (types = []) => { for (const t of types) if (TYPE_MAP[t]) return TYPE_MAP[t]; return "Venue"; };
const priceLabel = (l) => (l != null ? "₹".repeat(l + 1) : "");

const DARK_MAP = [
  { elementType: "geometry",                stylers: [{ color: "#13132a" }] },
  { elementType: "labels.text.stroke",      stylers: [{ color: "#13132a" }] },
  { elementType: "labels.text.fill",        stylers: [{ color: "#6060a0" }] },
  { featureType: "administrative",          elementType: "geometry.stroke",  stylers: [{ color: "#1e1e3a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#9090c0" }] },
  { featureType: "poi",                     stylers: [{ visibility: "off" }] },
  { featureType: "road",                    elementType: "geometry",         stylers: [{ color: "#1e1e3a" }] },
  { featureType: "road",                    elementType: "geometry.stroke",  stylers: [{ color: "#0c0c1d" }] },
  { featureType: "road",                    elementType: "labels.text.fill", stylers: [{ color: "#5050a0" }] },
  { featureType: "road.highway",            elementType: "geometry",         stylers: [{ color: "#2a2a4a" }] },
  { featureType: "road.highway",            elementType: "labels.text.fill", stylers: [{ color: "#8080c0" }] },
  { featureType: "transit",                 stylers: [{ visibility: "off" }] },
  { featureType: "water",                   elementType: "geometry",         stylers: [{ color: "#0a0a1a" }] },
  { featureType: "water",                   elementType: "labels.text.fill", stylers: [{ color: "#3a3a6a" }] },
];

// ─── extract text from new AutocompleteSuggestion shape ───────────────────────
const sMain = (s) => s?.placePrediction?.mainText?.text ?? s?.placePrediction?.text?.text ?? "";
const sSec  = (s) => s?.placePrediction?.secondaryText?.text ?? "";
const sId   = (s) => s?.placePrediction?.placeId ?? "";

// ─────────────────────────────────────────────────────────────────────────────
export default function VenueSearch() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    version: "weekly",
  });

  const mapRef      = useRef(null);
  const geocoderRef = useRef(null);

  // ── location ──────────────────────────────────────────────────────────────
  const [locMode,    setLocMode]    = useState("none");
  const [userCoords, setUserCoords] = useState(null);
  const [locLabel,   setLocLabel]   = useState("");
  const [pinMode,    setPinMode]    = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [manualPreds, setManualPreds] = useState([]);
  const [showManual,  setShowManual]  = useState(false);

  // ── search ────────────────────────────────────────────────────────────────
  const [keyword,      setKeyword]      = useState("");
  const [kwPreds,      setKwPreds]      = useState([]);
  const [showKwDrop,   setShowKwDrop]   = useState(false);
  const [cityInput,    setCityInput]    = useState("");
  const [cityPreds,    setCityPreds]    = useState([]);
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [selCity,      setSelCity]      = useState(null);
  const [areaInput,    setAreaInput]    = useState("");
  const [areaPreds,    setAreaPreds]    = useState([]);
  const [showAreaDrop, setShowAreaDrop] = useState(false);
  const [selArea,      setSelArea]      = useState(null);
  const [minRating,    setMinRating]    = useState("");

  // ── results ───────────────────────────────────────────────────────────────
  const [venues,    setVenues]    = useState([]);
  const [selVenue,  setSelVenue]  = useState(null);
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // ── map load callback ─────────────────────────────────────────────────────
  const onMapLoad = useCallback((map) => {
    mapRef.current      = map;
    geocoderRef.current = new window.google.maps.Geocoder();
  }, []);

  // ── NEW AutocompleteSuggestion API ────────────────────────────────────────
  // Uses window.google.maps.places.AutocompleteSuggestion (new, not deprecated)
  const fetchSuggestions = useCallback(async (input, types, locationBias) => {
    if (!isLoaded || !input.trim()) return [];
    try {
      // dynamically import the new Places library
      const placesLib = await window.google.maps.importLibrary("places");
      const { AutocompleteSuggestion } = placesLib;

      const request = { input };

      // includedPrimaryTypes is optional — if empty array causes no results, omit it
      if (types && types.length > 0) {
        request.includedPrimaryTypes = types;
      }

      if (locationBias) {
        request.locationBias = locationBias;
      }

      const { suggestions } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      return suggestions ?? [];
    } catch (err) {
      console.warn("AutocompleteSuggestion failed:", err?.message ?? err);
      return [];
    }
  }, [isLoaded]);

  // ── Geocoder helpers ──────────────────────────────────────────────────────
  const reverseGeocode = useCallback((lat, lng, cb) => {
    if (!geocoderRef.current) { cb(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); return; }
    geocoderRef.current.geocode({ location: { lat, lng } }, (res, status) => {
      cb(status === "OK" && res[0] ? res[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });
  }, []);

  const resolvePlaceId = useCallback((placeId, cb) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ placeId }, (res, status) => {
      if (status === "OK" && res[0]) {
        const loc = res[0].geometry.location;
        cb({ lat: loc.lat(), lng: loc.lng() }, res[0].formatted_address);
      }
    });
  }, []);

  // ── Suggestion effects ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !keyword.trim()) { setKwPreds([]); return; }
    const c = userCoords || mapCenter;
    fetchSuggestions(keyword, ["establishment"], {
      circle: { center: { lat: c.lat, lng: c.lng }, radius: 15000 },
    }).then(setKwPreds);
  }, [keyword, isLoaded, userCoords, mapCenter, fetchSuggestions]);

  useEffect(() => {
    if (!isLoaded || !cityInput.trim()) { setCityPreds([]); return; }
    // use empty types to get broader results (cities + regions)
    fetchSuggestions(cityInput, [], null).then(setCityPreds);
  }, [cityInput, isLoaded, fetchSuggestions]);

  useEffect(() => {
    if (!isLoaded || !areaInput.trim() || !selCity) { setAreaPreds([]); return; }
    fetchSuggestions(
      areaInput,
      [],
      selCity?.lat
        ? { circle: { center: { lat: selCity.lat, lng: selCity.lng }, radius: 50000 } }
        : null
    ).then(setAreaPreds);
  }, [areaInput, isLoaded, selCity, fetchSuggestions]);

  useEffect(() => {
    if (!isLoaded || !manualInput.trim()) { setManualPreds([]); return; }
    fetchSuggestions(manualInput, [], null).then(setManualPreds);
  }, [manualInput, isLoaded, fetchSuggestions]);

  // ── Location modes ────────────────────────────────────────────────────────
  const handleGPS = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        reverseGeocode(lat, lng, (addr) => {
          setUserCoords({ lat, lng });
          setLocLabel(addr);
          setLocMode("gps");
          setMapCenter({ lat, lng });
          setPinMode(false);
          setGpsLoading(false);
        });
      },
      () => { setGpsLoading(false); alert("Location access denied."); }
    );
  };

  const handleMapClick = useCallback((e) => {
    if (!pinMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    reverseGeocode(lat, lng, (addr) => {
      setUserCoords({ lat, lng });
      setLocLabel(addr);
      setLocMode("pin");
      setMapCenter({ lat, lng });
      setPinMode(false);
    });
  }, [pinMode, reverseGeocode]);

  const clearLoc = () => {
    setLocMode("none"); setUserCoords(null); setLocLabel("");
    setPinMode(false); setManualInput(""); setManualPreds([]);
  };

  // ── Pick handlers ─────────────────────────────────────────────────────────
  const pickCity = (s) => {
    setCityInput(sMain(s)); setShowCityDrop(false); setCityPreds([]);
    setSelArea(null); setAreaInput("");
    resolvePlaceId(sId(s), (coords) => { setSelCity({ name: sMain(s), ...coords }); setMapCenter(coords); });
  };
  const pickArea = (s) => {
    setAreaInput(sMain(s)); setShowAreaDrop(false); setAreaPreds([]);
    resolvePlaceId(sId(s), (coords) => { setSelArea({ name: sMain(s), ...coords }); setMapCenter(coords); });
  };
  const pickManual = (s) => {
    const txt = s?.placePrediction?.text?.text || sMain(s);
    setManualInput(txt); setShowManual(false);
    resolvePlaceId(sId(s), (coords, addr) => {
      setUserCoords(coords); setLocLabel(addr || txt);
      setLocMode("manual"); setMapCenter(coords);
    });
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const doSearch = () => {
    if (!mapRef.current) return;
    setSearching(true); setVenues([]); setSelVenue(null);

    const center =
      selArea?.lat    ? { lat: selArea.lat,    lng: selArea.lng    } :
      selCity?.lat    ? { lat: selCity.lat,    lng: selCity.lng    } :
      userCoords      ? { lat: userCoords.lat, lng: userCoords.lng } :
      mapCenter;

    const radius = selArea ? 3000 : selCity ? 10000 : 5000;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      {
        location: new window.google.maps.LatLng(center.lat, center.lng),
        radius,
        keyword: keyword || "hotel resort banquet hall restaurant",
      },
      (results, status) => {
        setSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setVenues(results.map((p) => ({
            id:          p.place_id,
            name:        p.name,
            lat:         p.geometry.location.lat(),
            lng:         p.geometry.location.lng(),
            rating:      p.rating || 0,
            ratingCount: p.user_ratings_total || 0,
            stars:       Math.round(p.rating || 0),
            address:     p.vicinity || "",
            types:       p.types || [],
            openNow:     p.opening_hours?.open_now,
            priceLevel:  p.price_level,
            image:       p.photos?.[0]?.getUrl({ maxWidth: 320, maxHeight: 220 }) ?? null,
          })));
          setMapCenter(center);
        } else {
          alert("No results found. Try a different keyword or location.");
        }
      }
    );
  };

  const filtered = venues.filter((v) => minRating ? v.rating >= Number(minRating) : true);

  // ── Error / Loading ───────────────────────────────────────────────────────
  if (loadError) return (
    <div style={css.errWrap}>
      <p style={css.errTitle}>⚠ Google Maps failed to load</p>
      <p style={css.errMsg}>
        Check your <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>.env</code> and ensure
        <strong> Maps JavaScript API</strong> + <strong>Places API (New)</strong> are enabled
        in Google Cloud Console.
      </p>
      <code style={css.errDetail}>{loadError.message}</code>
    </div>
  );

  if (!isLoaded) return (
    <div style={css.loaderWrap}>
      <div style={css.spinner} />
      <p style={css.loaderTxt}>Loading Google Maps…</p>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={css.root}>
      <div style={css.header}>
        <h1 style={css.title}><span style={css.accent}>Venue</span> Finder</h1>
        <p style={css.sub}>Live · GPS · Map Pin · Address Search</p>
      </div>

      <div style={css.body}>
        {/* ════ PANEL ════ */}
        <div style={css.panel}>

          {/* Location Card */}
          <div style={css.card2}>
            <div style={css.cardHead}>
              <span>📍</span>
              <span style={css.cardHeadTitle}>Your Location</span>
              {locMode !== "none" && <button style={css.clearBtn} onClick={clearLoc}>✕ Clear</button>}
            </div>

            {locMode !== "none" && locLabel && (
              <div style={css.locPill}>
                <span>{locMode === "gps" ? "🛰" : locMode === "pin" ? "📌" : "🔤"}</span>
                <span style={css.locPillTxt}>{locLabel}</span>
              </div>
            )}

            <div style={css.modeRow}>
              <button style={{ ...css.modeBtn, ...(locMode === "gps" ? css.modeBtnGps : {}) }}
                onClick={handleGPS} disabled={gpsLoading}>
                <span style={{ fontSize: 18 }}>{gpsLoading ? "⏳" : "🛰"}</span>
                <span>{gpsLoading ? "Locating…" : "Use GPS"}</span>
              </button>

              <button style={{ ...css.modeBtn, ...(pinMode ? css.modeBtnPinOn : locMode === "pin" ? css.modeBtnPin : {}) }}
                onClick={() => setPinMode((v) => !v)}>
                <span style={{ fontSize: 18 }}>📌</span>
                <span>{pinMode ? "Click map ▶" : "Pin on Map"}</span>
              </button>

              <button style={{ ...css.modeBtn, ...(locMode === "manual" ? css.modeBtnManual : {}) }}
                onClick={() => { setLocMode("manual"); setManualInput(""); }}>
                <span style={{ fontSize: 18 }}>🔤</span>
                <span>Type Address</span>
              </button>
            </div>

            {pinMode && (
              <div style={css.pinHint}>
                ☝ Click anywhere on the map to drop a pin
                <button style={css.pinCancelBtn} onClick={() => setPinMode(false)}>Cancel</button>
              </div>
            )}

            {locMode === "manual" && (
              <div style={{ ...css.inputWrap, marginTop: 10 }}>
                <input style={css.input} autoFocus
                  placeholder="Type any address or landmark…"
                  value={manualInput}
                  onChange={(e) => { setManualInput(e.target.value); setShowManual(true); }}
                  onBlur={() => setTimeout(() => setShowManual(false), 160)}
                  onFocus={() => manualInput && setShowManual(true)}
                />
                {showManual && manualPreds.length > 0 && (
                  <div style={css.dropdown}>
                    {manualPreds.map((s, i) => (
                      <div key={i} style={css.dropItem} onMouseDown={() => pickManual(s)}>
                        <span style={css.dropMain}>{sMain(s)}</span>
                        <span style={css.dropSub}>{sSec(s)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Card */}
          <div style={css.card2}>
            <div style={css.cardHead}>
              <span>🔍</span>
              <span style={css.cardHeadTitle}>Search Venues</span>
            </div>

            <label style={css.label}>What are you looking for?</label>
            <div style={{ ...css.inputWrap, marginBottom: 10 }}>
              <input style={css.input}
                placeholder="Hotels, resorts, banquet halls, restaurants…"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setShowKwDrop(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setShowKwDrop(false); doSearch(); } }}
                onBlur={() => setTimeout(() => setShowKwDrop(false), 160)}
                onFocus={() => keyword && setShowKwDrop(true)}
              />
              {showKwDrop && kwPreds.length > 0 && (
                <div style={css.dropdown}>
                  {kwPreds.map((s, i) => (
                    <div key={i} style={css.dropItem}
                      onMouseDown={() => { setKeyword(sMain(s)); setShowKwDrop(false); }}>
                      <span style={css.dropMain}>{sMain(s)}</span>
                      <span style={css.dropSub}>{sSec(s)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={css.label}>City</label>
            <div style={{ ...css.inputWrap, marginBottom: 10 }}>
              <input style={css.input} placeholder="Search any city…"
                value={cityInput}
                onChange={(e) => { setCityInput(e.target.value); setShowCityDrop(true); if (!e.target.value) setSelCity(null); }}
                onBlur={() => setTimeout(() => setShowCityDrop(false), 160)}
                onFocus={() => cityInput && setShowCityDrop(true)}
              />
              {showCityDrop && cityPreds.length > 0 && (
                <div style={css.dropdown}>
                  {cityPreds.map((s, i) => (
                    <div key={i} style={css.dropItem} onMouseDown={() => pickCity(s)}>
                      <span style={css.dropMain}>{sMain(s)}</span>
                      <span style={css.dropSub}>{sSec(s)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={{ ...css.label, opacity: selCity ? 1 : 0.4 }}>Area / Neighbourhood</label>
            <div style={{ ...css.inputWrap, marginBottom: 12 }}>
              <input
                style={{ ...css.input, opacity: selCity ? 1 : 0.4, cursor: selCity ? "text" : "not-allowed" }}
                placeholder={selCity ? `Areas in ${selCity.name}…` : "Pick a city first"}
                value={areaInput} disabled={!selCity}
                onChange={(e) => { setAreaInput(e.target.value); setShowAreaDrop(true); if (!e.target.value) setSelArea(null); }}
                onBlur={() => setTimeout(() => setShowAreaDrop(false), 160)}
                onFocus={() => areaInput && setShowAreaDrop(true)}
              />
              {showAreaDrop && areaPreds.length > 0 && (
                <div style={css.dropdown}>
                  {areaPreds.map((s, i) => (
                    <div key={i} style={css.dropItem} onMouseDown={() => pickArea(s)}>
                      <span style={css.dropMain}>{sMain(s)}</span>
                      <span style={css.dropSub}>{sSec(s)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={css.label}>Min Rating</label>
            <div style={{ ...css.ratingRow, marginBottom: 14 }}>
              {[["", "Any"], ["3", "3★+"], ["4", "4★+"], ["4.5", "4.5★+"]].map(([v, l]) => (
                <button key={v}
                  style={{ ...css.ratingBtn, ...(minRating === v ? css.ratingBtnOn : {}) }}
                  onClick={() => setMinRating(v)}>{l}
                </button>
              ))}
            </div>

            <button style={{ ...css.searchBtn, opacity: searching ? 0.65 : 1 }}
              onClick={doSearch} disabled={searching}>
              {searching ? "Searching…" : "Search Venues"}
            </button>
          </div>

          {/* Chips */}
          {(keyword || selCity || selArea || locMode !== "none") && (
            <div style={css.chips}>
              {locMode !== "none" && <span style={{ ...css.chip, borderColor: "#22c55e50", color: "#22c55e" }}>📍 {locMode}</span>}
              {keyword   && <span style={css.chip}>🔍 {keyword}</span>}
              {selCity   && <span style={css.chip}>🏙 {selCity.name}</span>}
              {selArea   && <span style={css.chip}>📌 {selArea.name}</span>}
              {minRating && <span style={css.chip}>⭐ {minRating}+</span>}
            </div>
          )}

          {(searching || venues.length > 0) && (
            <p style={css.countTxt}>
              {searching ? "Fetching live results…" : `${filtered.length} of ${venues.length} venues`}
            </p>
          )}

          {/* Venue list */}
          <div style={css.venueList}>
            {!searching && filtered.length === 0 && (
              <div style={css.empty}>
                <p style={{ fontSize: 32, margin: "0 0 8px" }}>🏨</p>
                <p style={css.emptyTxt}>
                  {venues.length > 0 ? "No match for rating filter" : "Set a location & search to see venues"}
                </p>
              </div>
            )}
            {filtered.map((v) => (
              <div key={v.id}
                style={{ ...css.venueCard, ...(selVenue?.id === v.id ? css.venueCardOn : {}) }}
                onClick={() => { setSelVenue(v); setMapCenter({ lat: v.lat, lng: v.lng }); }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {v.image
                    ? <img src={v.image} alt={v.name} style={css.venueImg} />
                    : <div style={css.venueImgPh}>{v.name[0]}</div>}
                  {v.openNow != null && (
                    <span style={{ ...css.openBadge, background: v.openNow ? "#16a34a" : "#dc2626" }}>
                      {v.openNow ? "Open" : "Closed"}
                    </span>
                  )}
                </div>
                <div style={css.venueInfo}>
                  <div style={css.venueName}>{v.name}</div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span style={css.typeBadge}>{typeLabel(v.types)}</span>
                    {v.priceLevel != null && <span style={css.priceTag}>{priceLabel(v.priceLevel)}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} style={{ fontSize: 11, color: i <= v.stars ? "#f59e0b" : "#2a2a4a" }}>★</span>
                    ))}
                    {v.rating > 0 && <span style={css.ratingVal}>{v.rating.toFixed(1)}</span>}
                    {v.ratingCount > 0 && <span style={css.ratingCnt}>({v.ratingCount.toLocaleString()})</span>}
                  </div>
                  <div style={css.venueAddr}>{v.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ MAP ════ */}
        <div style={css.mapWrap}>
          {pinMode && (
            <div style={css.pinBanner}>
              📌 Click anywhere on the map to drop a pin
              <button style={css.pinCancelBtn2} onClick={() => setPinMode(false)}>✕ Cancel</button>
            </div>
          )}

          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={mapCenter}
            zoom={selArea ? 14 : selCity ? 12 : 13}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{
              styles: DARK_MAP,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              zoomControl: true,
            }}
          >
            {userCoords && (
              <Marker position={userCoords} zIndex={1000}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: locMode === "pin" ? "#f97316" : "#22c55e",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                }}
              />
            )}

            {filtered.map((v) => (
              <Marker key={v.id} position={{ lat: v.lat, lng: v.lng }}
                onClick={() => { setSelVenue(v); setMapCenter({ lat: v.lat, lng: v.lng }); }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: selVenue?.id === v.id ? 11 : 7,
                  fillColor: selVenue?.id === v.id ? "#f59e0b" : "#7c6af7",
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                }}
              />
            ))}

            {selVenue && (
              <InfoWindow position={{ lat: selVenue.lat, lng: selVenue.lng }} onCloseClick={() => setSelVenue(null)}>
                <div style={{ fontFamily: "sans-serif", maxWidth: 200 }}>
                  {selVenue.image && <img src={selVenue.image} alt={selVenue.name}
                    style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6, marginBottom: 6 }} />}
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 2 }}>{selVenue.name}</div>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 4, textTransform: "uppercase" }}>{typeLabel(selVenue.types)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 4 }}>
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} style={{ color: i <= selVenue.stars ? "#f59e0b" : "#ccc", fontSize: 13 }}>★</span>
                    ))}
                    {selVenue.rating > 0 && <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginLeft: 4 }}>{selVenue.rating.toFixed(1)}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{selVenue.address}</div>
                  {selVenue.openNow != null && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: selVenue.openNow ? "#16a34a" : "#dc2626" }}>
                      {selVenue.openNow ? "✓ Open Now" : "✗ Closed"}
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}

            {userCoords && locMode !== "none" && !pinMode && (
              <InfoWindow position={userCoords} options={{ disableAutoPan: true }} onCloseClick={clearLoc}>
                <div style={{ fontFamily: "sans-serif", maxWidth: 220 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#111", marginBottom: 3 }}>
                    {locMode === "gps" ? "🛰 GPS Location" : locMode === "pin" ? "📌 Pinned" : "🔤 Address"}
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>{locLabel}</div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          <div style={css.legend}>
            <div style={css.legendItem}><div style={{ ...css.dot, background: "#22c55e" }} />GPS</div>
            <div style={css.legendItem}><div style={{ ...css.dot, background: "#f97316" }} />Pin</div>
            <div style={css.legendItem}><div style={{ ...css.dot, background: "#7c6af7" }} />Venue</div>
            <div style={css.legendItem}><div style={{ ...css.dot, background: "#f59e0b" }} />Selected</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = {
  root:          { fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0c0c1d", minHeight: "100vh", color: "#e2e2f0", display: "flex", flexDirection: "column" },
  loaderWrap:    { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 14, background: "#0c0c1d" },
  spinner:       { width: 32, height: 32, border: "3px solid #1e1e3a", borderTop: "3px solid #7c6af7", borderRadius: "50%", animation: "spin 0.9s linear infinite" },
  loaderTxt:     { color: "#5a5a8a", fontSize: 13, margin: 0 },
  errWrap:       { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", padding: 32, textAlign: "center", background: "#0c0c1d" },
  errTitle:      { fontSize: 20, fontWeight: 700, color: "#f87171", marginBottom: 12 },
  errMsg:        { fontSize: 14, color: "#9090c0", maxWidth: 480, lineHeight: 1.7 },
  errDetail:     { fontSize: 12, color: "#4a4a7a", marginTop: 8, display: "block" },
  header:        { padding: "16px 24px", borderBottom: "1px solid #1a1a30", flexShrink: 0 },
  title:         { margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px" },
  accent:        { color: "#f59e0b" },
  sub:           { margin: "2px 0 0", fontSize: 11, color: "#4a4a7a" },
  body:          { display: "flex", flex: 1, height: "calc(100vh - 65px)", overflow: "hidden" },
  panel:         { width: 370, minWidth: 330, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", padding: 12, borderRight: "1px solid #1a1a30" },
  card2:         { background: "#111128", border: "1px solid #1e1e38", borderRadius: 12, padding: "14px 13px 12px" },
  cardHead:      { display: "flex", alignItems: "center", gap: 7, marginBottom: 10, fontSize: 14 },
  cardHeadTitle: { flex: 1, fontWeight: 700, fontSize: 13, color: "#b0b0d0" },
  clearBtn:      { fontSize: 11, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" },
  locPill:       { display: "flex", gap: 8, background: "#0c0c1d", border: "1px solid #1e1e38", borderRadius: 8, padding: "8px 10px", marginBottom: 10, alignItems: "flex-start" },
  locPillTxt:    { fontSize: 11, color: "#8080b0", lineHeight: 1.5, wordBreak: "break-word" },
  modeRow:       { display: "flex", gap: 7 },
  modeBtn:       { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px 8px", borderRadius: 10, border: "1px solid #1e1e38", background: "#0c0c1d", color: "#5a5a8a", fontSize: 11, fontWeight: 600, cursor: "pointer", lineHeight: 1.2 },
  modeBtnGps:    { border: "1px solid #22c55e", background: "#071a0e", color: "#22c55e" },
  modeBtnPin:    { border: "1px solid #f97316", background: "#1a0800", color: "#f97316" },
  modeBtnPinOn:  { border: "1px solid #f97316", background: "#2a1000", color: "#f97316", boxShadow: "0 0 0 2px #f9731630" },
  modeBtnManual: { border: "1px solid #7c6af7", background: "#0e0d1f", color: "#7c6af7" },
  pinHint:       { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 9, fontSize: 11, color: "#f97316", background: "#1a080030", border: "1px dashed #f9731650", borderRadius: 7, padding: "7px 10px" },
  pinCancelBtn:  { fontSize: 11, background: "rgba(249,115,22,0.2)", border: "none", color: "#f97316", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontWeight: 700 },
  label:         { display: "block", fontSize: 10, fontWeight: 700, color: "#4a4a7a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 5 },
  inputWrap:     { position: "relative" },
  input:         { width: "100%", background: "#0c0c1d", border: "1px solid #1e1e38", borderRadius: 8, padding: "9px 12px", color: "#e2e2f0", fontSize: 13, outline: "none", boxSizing: "border-box" },
  dropdown:      { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#13132a", border: "1px solid #22223a", borderRadius: 9, zIndex: 9999, boxShadow: "0 10px 30px rgba(0,0,0,0.7)", overflow: "hidden", maxHeight: 230, overflowY: "auto" },
  dropItem:      { padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid #1a1a30", display: "flex", flexDirection: "column", gap: 2 },
  dropMain:      { fontSize: 13, color: "#e2e2f0", fontWeight: 500 },
  dropSub:       { fontSize: 11, color: "#4a4a7a" },
  ratingRow:     { display: "flex", gap: 6 },
  ratingBtn:     { flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid #1e1e38", background: "#0c0c1d", color: "#5a5a8a", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  ratingBtnOn:   { background: "#f59e0b", borderColor: "#f59e0b", color: "#000" },
  searchBtn:     { width: "100%", padding: "11px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#7c6af7,#5540e0)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  chips:         { display: "flex", flexWrap: "wrap", gap: 5 },
  chip:          { fontSize: 11, background: "#1a1a32", border: "1px solid #2a2a50", borderRadius: 20, padding: "3px 10px", color: "#7070b0" },
  countTxt:      { fontSize: 11, color: "#4a4a7a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", margin: 0 },
  venueList:     { display: "flex", flexDirection: "column", gap: 8, paddingBottom: 20 },
  empty:         { textAlign: "center", padding: "40px 0" },
  emptyTxt:      { fontSize: 12, color: "#2e2e5e", margin: 0 },
  venueCard:     { display: "flex", gap: 10, padding: 11, borderRadius: 12, border: "1px solid #1a1a30", background: "#0e0e22", cursor: "pointer" },
  venueCardOn:   { border: "1px solid #7c6af7", background: "#181836", boxShadow: "0 0 0 3px rgba(124,106,247,0.12)" },
  venueImg:      { width: 74, height: 74, borderRadius: 8, objectFit: "cover", display: "block" },
  venueImgPh:    { width: 74, height: 74, borderRadius: 8, background: "#1e1e3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#7c6af7", fontWeight: 700 },
  openBadge:     { position: "absolute", bottom: 4, left: 4, fontSize: 9, fontWeight: 700, color: "#fff", borderRadius: 4, padding: "2px 5px", textTransform: "uppercase" },
  venueInfo:     { flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  venueName:     { fontWeight: 600, fontSize: 13, color: "#e2e2f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  typeBadge:     { fontSize: 9, background: "#7c6af712", color: "#9d90f7", border: "1px solid #7c6af728", padding: "2px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px" },
  priceTag:      { fontSize: 11, color: "#4a4a7a", fontWeight: 600 },
  ratingVal:     { fontSize: 11, color: "#f59e0b", fontWeight: 700, marginLeft: 4 },
  ratingCnt:     { fontSize: 10, color: "#333360", marginLeft: 2 },
  venueAddr:     { fontSize: 10, color: "#333360", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  mapWrap:       { flex: 1, position: "relative" },
  pinBanner:     { position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 10, background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 20px rgba(249,115,22,0.45)", whiteSpace: "nowrap" },
  pinCancelBtn2: { background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 },
  legend:        { position: "absolute", bottom: 16, right: 16, background: "rgba(12,12,29,0.9)", border: "1px solid #1a1a30", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 12, backdropFilter: "blur(6px)" },
  legendItem:    { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6060a0", fontWeight: 600 },
  dot:           { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 },
};