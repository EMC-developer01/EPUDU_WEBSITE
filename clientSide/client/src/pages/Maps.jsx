import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

// ── stable outside component ──────────────────────────────────────────────────
const LIBRARIES      = ["places"];
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };
const MAP_STYLE      = { width: "100%", height: "520px", borderRadius: "12px" };

const TYPE_MAP = {
  lodging: "Hotel", restaurant: "Restaurant", food: "Food", bar: "Bar",
  cafe: "Café", spa: "Spa", gym: "Gym", night_club: "Night Club",
  tourist_attraction: "Attraction", event_venue: "Event Venue",
};
const typeLabel  = (types = []) => { for (const t of types) if (TYPE_MAP[t]) return TYPE_MAP[t]; return "Venue"; };
const priceLabel = (l) => (l != null ? "₹".repeat(l + 1) : "");

// ─────────────────────────────────────────────────────────────────────────────
export default function VenueSearch() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const mapRef      = useRef(null);
  const geocoderRef = useRef(null);

  // ── location state ────────────────────────────────────────────────────────
  const [locMode,    setLocMode]    = useState("none"); // none | gps | pin | manual
  const [userCoords, setUserCoords] = useState(null);
  const [locLabel,   setLocLabel]   = useState("");
  const [pinMode,    setPinMode]    = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // manual address
  const [manualInput, setManualInput] = useState("");
  const [manualPreds, setManualPreds] = useState([]);
  const [showManual,  setShowManual]  = useState(false);

  // ── search / filter state ─────────────────────────────────────────────────
  const [keyword,      setKeyword]      = useState("");
  const [kwPreds,      setKwPreds]      = useState([]);
  const [showKwDrop,   setShowKwDrop]   = useState(false);

  const [cityInput,    setCityInput]    = useState("");
  const [cityPreds,    setCityPreds]    = useState([]);
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [selCity,      setSelCity]      = useState(null); // { name, lat, lng }

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

  // ── map load ──────────────────────────────────────────────────────────────
  const onMapLoad = useCallback((map) => {
    mapRef.current      = map;
    geocoderRef.current = new window.google.maps.Geocoder();
  }, []);

  // ── new AutocompleteSuggestion API ────────────────────────────────────────
  const fetchSuggestions = useCallback(async (input, options = {}) => {
    if (!input.trim()) return [];
    try {
      const { suggestions } =
        await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input, ...options,
        });
      return suggestions || [];
    } catch { return []; }
  }, []);

  const getLabel = (s) => {
    const pp = s.placePrediction;
    return {
      main:    pp?.structuredFormat?.mainText?.text      || pp?.text?.text || "",
      sub:     pp?.structuredFormat?.secondaryText?.text || "",
      placeId: pp?.placeId || "",
    };
  };

  // ── geocoder helpers ──────────────────────────────────────────────────────
  const resolvePlaceId = useCallback((placeId, cb) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ placeId }, (res, status) => {
      if (status === "OK" && res[0]) {
        const l = res[0].geometry.location;
        cb({ lat: l.lat(), lng: l.lng() }, res[0].formatted_address);
      }
    });
  }, []);

  const reverseGeocode = useCallback((lat, lng, cb) => {
    if (!geocoderRef.current) { cb(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); return; }
    geocoderRef.current.geocode({ location: { lat, lng } }, (res, status) => {
      cb(status === "OK" && res[0] ? res[0].formatted_address : `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });
  }, []);

  // ── autocomplete effects ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !keyword.trim()) { setKwPreds([]); return; }
    const c = userCoords || mapCenter;
    fetchSuggestions(keyword, {
      includedPrimaryTypes: ["establishment"],
      locationBias: { circle: { center: { latitude: c.lat, longitude: c.lng }, radius: 15000 } },
    }).then(setKwPreds);
  }, [keyword, isLoaded, userCoords, mapCenter, fetchSuggestions]);

  useEffect(() => {
    if (!isLoaded || !cityInput.trim()) { setCityPreds([]); return; }
    fetchSuggestions(cityInput, {
      includedPrimaryTypes: ["locality", "administrative_area_level_1"],
    }).then(setCityPreds);
  }, [cityInput, isLoaded, fetchSuggestions]);

  useEffect(() => {
    if (!isLoaded || !areaInput.trim() || !selCity) { setAreaPreds([]); return; }
    fetchSuggestions(areaInput, {
      includedPrimaryTypes: ["sublocality", "neighborhood"],
      ...(selCity?.lat ? {
        locationBias: { circle: { center: { latitude: selCity.lat, longitude: selCity.lng }, radius: 50000 } },
      } : {}),
    }).then(setAreaPreds);
  }, [areaInput, isLoaded, selCity, fetchSuggestions]);

  useEffect(() => {
    if (!isLoaded || !manualInput.trim()) { setManualPreds([]); return; }
    fetchSuggestions(manualInput, {}).then(setManualPreds);
  }, [manualInput, isLoaded, fetchSuggestions]);

  // ── location handlers ─────────────────────────────────────────────────────
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
    const lat = e.latLng.lat(), lng = e.latLng.lng();
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

  // ── search ────────────────────────────────────────────────────────────────
  const doSearch = () => {
    if (!mapRef.current) return;
    setSearching(true); setVenues([]); setSelVenue(null);
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const center =
      selArea?.lat  ? { lat: selArea.lat,    lng: selArea.lng    } :
      selCity?.lat  ? { lat: selCity.lat,    lng: selCity.lng    } :
      userCoords    ? { lat: userCoords.lat, lng: userCoords.lng } :
      mapCenter;
    const radius = selArea ? 3000 : selCity ? 10000 : 5000;

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
            image:       p.photos?.length
              ? p.photos[0].getUrl({ maxWidth: 320, maxHeight: 220 })
              : null,
          })));
          setMapCenter(center);
        } else {
          alert("No results found. Try a different keyword or location.");
        }
      }
    );
  };

  const filtered = venues.filter((v) =>
    minRating ? v.rating >= Number(minRating) : true
  );

  // ─── error / loading ──────────────────────────────────────────────────────
  if (loadError)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8 text-center">
        <p className="text-xl font-bold text-red-500 mb-2">⚠️ Google Maps failed to load</p>
        <p className="text-sm text-gray-500 max-w-md">
          Check that <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> is
          correct and that <strong>Maps JavaScript API</strong> + <strong>Places API (New)</strong> are
          enabled in Google Cloud Console.
        </p>
        <pre className="mt-3 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded max-w-md break-all">
          {loadError.message}
        </pre>
      </div>
    );

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading Google Maps…</p>
        </div>
      </div>
    );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 bg-white min-h-screen">

      {/* ── HEADER ── */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🏨 Venue Finder</h2>
        <p className="text-sm text-gray-400">Live search from Google Maps</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ═══════════ LEFT — LIST ═══════════ */}
        <div className="lg:w-1/2 max-h-[520px] overflow-y-auto border-r pr-4 space-y-4">

          {/* ── STICKY SEARCH + FILTERS ── */}
          <div className="sticky top-0 bg-white pb-3 z-10 space-y-3">

            {/* Row 1 — keyword search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search venues, hotels, restaurants…"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setShowKwDrop(true); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setShowKwDrop(false); doSearch(); } }}
                onBlur={() => setTimeout(() => setShowKwDrop(false), 160)}
                onFocus={() => keyword && setShowKwDrop(true)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
              {showKwDrop && kwPreds.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mt-1">
                  {kwPreds.map((s, i) => {
                    const { main, sub } = getLabel(s);
                    return (
                      <div key={i}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onMouseDown={() => { setKeyword(main); setShowKwDrop(false); }}>
                        <p className="text-sm font-medium text-gray-800">{main}</p>
                        {sub && <p className="text-xs text-gray-400">{sub}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Row 2 — location + city + area + rating filters */}
            <div className="flex flex-wrap gap-2">

              {/* Location mode buttons */}
              <button
                onClick={handleGPS}
                disabled={gpsLoading}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition
                  ${locMode === "gps"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600"}`}
              >
                {gpsLoading ? "⏳" : "🛰"} {gpsLoading ? "Locating…" : "GPS"}
              </button>

              <button
                onClick={() => setPinMode((v) => !v)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition
                  ${pinMode
                    ? "bg-orange-500 text-white border-orange-500 animate-pulse"
                    : locMode === "pin"
                    ? "bg-orange-100 text-orange-600 border-orange-400"
                    : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500"}`}
              >
                📌 {pinMode ? "Click map ▶" : "Pin Map"}
              </button>

              <button
                onClick={() => { setLocMode("manual"); setManualInput(""); }}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition
                  ${locMode === "manual"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-500"}`}
              >
                🔤 Address
              </button>

              {/* City autocomplete */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="City…"
                  value={cityInput}
                  onChange={(e) => { setCityInput(e.target.value); setShowCityDrop(true); if (!e.target.value) setSelCity(null); }}
                  onBlur={() => setTimeout(() => setShowCityDrop(false), 160)}
                  onFocus={() => cityInput && setShowCityDrop(true)}
                  className="border rounded-lg px-2 py-2 text-sm w-28 focus:outline-none focus:border-blue-400"
                />
                {showCityDrop && cityPreds.length > 0 && (
                  <div className="absolute top-full left-0 bg-white border rounded-lg shadow-lg z-50 w-56 max-h-48 overflow-y-auto mt-1">
                    {cityPreds.map((s, i) => {
                      const { main, sub } = getLabel(s);
                      return (
                        <div key={i}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onMouseDown={() => {
                            setCityInput(main); setShowCityDrop(false); setCityPreds([]);
                            setSelArea(null); setAreaInput("");
                            resolvePlaceId(getLabel(s).placeId, (coords) => {
                              setSelCity({ name: main, ...coords });
                              setMapCenter(coords);
                            });
                          }}>
                          <p className="text-sm font-medium text-gray-800">{main}</p>
                          {sub && <p className="text-xs text-gray-400">{sub}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Area autocomplete */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={selCity ? "Area…" : "Select city first"}
                  value={areaInput}
                  disabled={!selCity}
                  onChange={(e) => { setAreaInput(e.target.value); setShowAreaDrop(true); if (!e.target.value) setSelArea(null); }}
                  onBlur={() => setTimeout(() => setShowAreaDrop(false), 160)}
                  onFocus={() => areaInput && setShowAreaDrop(true)}
                  className={`border rounded-lg px-2 py-2 text-sm w-28 focus:outline-none focus:border-blue-400
                    ${!selCity ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                />
                {showAreaDrop && areaPreds.length > 0 && (
                  <div className="absolute top-full left-0 bg-white border rounded-lg shadow-lg z-50 w-56 max-h-48 overflow-y-auto mt-1">
                    {areaPreds.map((s, i) => {
                      const { main, sub } = getLabel(s);
                      return (
                        <div key={i}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onMouseDown={() => {
                            setAreaInput(main); setShowAreaDrop(false); setAreaPreds([]);
                            resolvePlaceId(getLabel(s).placeId, (coords) => {
                              setSelArea({ name: main, ...coords });
                              setMapCenter(coords);
                            });
                          }}>
                          <p className="text-sm font-medium text-gray-800">{main}</p>
                          {sub && <p className="text-xs text-gray-400">{sub}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rating filter */}
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">All Ratings</option>
                <option value="3">3★ +</option>
                <option value="4">4★ +</option>
                <option value="4.5">4.5★ +</option>
              </select>

              {/* Search button */}
              <button
                onClick={doSearch}
                disabled={searching}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60"
              >
                {searching ? "…" : "Search"}
              </button>

            </div>

            {/* Manual address input row */}
            {locMode === "manual" && (
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="Type any address or landmark…"
                  value={manualInput}
                  onChange={(e) => { setManualInput(e.target.value); setShowManual(true); }}
                  onBlur={() => setTimeout(() => setShowManual(false), 160)}
                  onFocus={() => manualInput && setShowManual(true)}
                  className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                {showManual && manualPreds.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mt-1">
                    {manualPreds.map((s, i) => {
                      const { main, sub, placeId } = getLabel(s);
                      return (
                        <div key={i}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onMouseDown={() => {
                            const display = sub ? `${main}, ${sub}` : main;
                            setManualInput(display); setShowManual(false);
                            resolvePlaceId(placeId, (coords, addr) => {
                              setUserCoords(coords);
                              setLocLabel(addr || display);
                              setLocMode("manual");
                              setMapCenter(coords);
                            });
                          }}>
                          <p className="text-sm font-medium text-gray-800">{main}</p>
                          {sub && <p className="text-xs text-gray-400">{sub}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Active location pill */}
            {locMode !== "none" && locLabel && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-sm">{locMode === "gps" ? "🛰" : locMode === "pin" ? "📌" : "🔤"}</span>
                <span className="text-xs text-green-700 flex-1 leading-relaxed">{locLabel}</span>
                <button onClick={clearLoc} className="text-xs text-red-400 hover:text-red-600 font-semibold flex-shrink-0">✕</button>
              </div>
            )}

            {/* Pin mode hint */}
            {pinMode && (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                <span className="text-xs text-orange-600 font-medium">☝ Click anywhere on the map to drop a pin</span>
                <button onClick={() => setPinMode(false)} className="text-xs text-orange-500 font-bold hover:text-orange-700">Cancel</button>
              </div>
            )}

            {/* Result count */}
            {(searching || venues.length > 0) && (
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {searching ? "Fetching from Google Maps…" : `${filtered.length} of ${venues.length} venues`}
              </p>
            )}

          </div>{/* end sticky */}

          {/* ── VENUE LIST ── */}
          {!searching && filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">🏨</p>
              <p className="text-sm text-gray-400">
                {venues.length > 0 ? "No venues match your filters" : "Search to discover venues"}
              </p>
            </div>
          )}

          {filtered.map((venue) => (
            <div
              key={venue.id}
              onClick={() => { setSelVenue(venue); setMapCenter({ lat: venue.lat, lng: venue.lng }); }}
              className={`flex gap-4 p-4 border rounded-xl cursor-pointer transition shadow-sm
                ${selVenue?.id === venue.id
                  ? "bg-blue-50 border-blue-400"
                  : "hover:bg-gray-50 border-gray-200"}`}
            >
              {/* Image */}
              {venue.image
                ? <img src={venue.image} alt={venue.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                : <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-gray-400">
                    {venue.name[0]}
                  </div>
              }

              {/* Info */}
              <div className="flex flex-col justify-between min-w-0 flex-1">
                <div>
                  <h4 className="font-semibold text-gray-800">{venue.name}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {typeLabel(venue.types)}
                    {venue.priceLevel != null && <span className="ml-1 text-gray-400">· {"₹".repeat(venue.priceLevel + 1)}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{venue.address}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-400 text-sm">
                    {"★".repeat(venue.stars)}{"☆".repeat(5 - venue.stars)}
                  </span>
                  {venue.rating > 0 && (
                    <span className="text-xs font-semibold text-gray-600">{venue.rating.toFixed(1)}</span>
                  )}
                  {venue.ratingCount > 0 && (
                    <span className="text-xs text-gray-400">({venue.ratingCount.toLocaleString()})</span>
                  )}
                  {venue.openNow != null && (
                    <span className={`text-xs font-semibold ml-1 ${venue.openNow ? "text-green-500" : "text-red-400"}`}>
                      {venue.openNow ? "Open" : "Closed"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>{/* end left */}

        {/* ═══════════ RIGHT — MAP ═══════════ */}
        <div className="lg:w-1/2 relative">

          {/* Pin banner over map */}
          {pinMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 whitespace-nowrap pointer-events-none">
              📌 Click anywhere on the map to drop a pin
            </div>
          )}

          <GoogleMap
            zoom={selArea ? 14 : selCity ? 12 : 13}
            center={mapCenter}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            mapContainerStyle={{
              ...MAP_STYLE,
              cursor: pinMode ? "crosshair" : undefined,
            }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User location marker */}
            {userCoords && (
              <Marker
                position={userCoords}
                zIndex={1000}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: locMode === "pin" ? "#f97316" : "#22c55e",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                }}
              />
            )}

            {/* Venue markers */}
            {filtered.map((venue) => (
              <Marker
                key={venue.id}
                position={{ lat: venue.lat, lng: venue.lng }}
                onClick={() => { setSelVenue(venue); setMapCenter({ lat: venue.lat, lng: venue.lng }); }}
              />
            ))}

            {/* Venue info window */}
            {selVenue && (
              <InfoWindow
                position={{ lat: selVenue.lat, lng: selVenue.lng }}
                onCloseClick={() => setSelVenue(null)}
              >
                <div className="font-sans max-w-[180px]">
                  {selVenue.image && (
                    <img src={selVenue.image} alt={selVenue.name}
                      className="w-full h-24 object-cover rounded mb-2" />
                  )}
                  <p className="font-bold text-sm text-gray-800">{selVenue.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{typeLabel(selVenue.types)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-xs">{"★".repeat(selVenue.stars)}{"☆".repeat(5 - selVenue.stars)}</span>
                    {selVenue.rating > 0 && <span className="text-xs font-bold text-gray-600">{selVenue.rating.toFixed(1)}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{selVenue.address}</p>
                  {selVenue.openNow != null && (
                    <p className={`text-xs font-bold mt-1 ${selVenue.openNow ? "text-green-600" : "text-red-500"}`}>
                      {selVenue.openNow ? "✓ Open Now" : "✗ Closed"}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}

            {/* Location info window */}
            {userCoords && locMode !== "none" && !pinMode && (
              <InfoWindow
                position={userCoords}
                options={{ disableAutoPan: true }}
                onCloseClick={clearLoc}
              >
                <div className="font-sans max-w-[200px]">
                  <p className="font-bold text-xs text-gray-800 mb-1">
                    {locMode === "gps" ? "🛰 Your GPS Location" : locMode === "pin" ? "📌 Pinned Location" : "🔤 Address"}
                  </p>
                  <p className="text-xs text-gray-500">{locLabel}</p>
                </div>
              </InfoWindow>
            )}

          </GoogleMap>

          {/* Map legend */}
          <div className="flex gap-4 mt-2 px-1">
            <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />GPS</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Pin</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Venue</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Selected</span>
          </div>
        </div>{/* end right */}

      </div>
    </div>
  );
}