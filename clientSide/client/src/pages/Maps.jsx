return (
  <LoadScript
    googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
    libraries={libraries}
  >
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">

      {/* ✅ LEFT PANEL */}
      <div className="w-full md:w-[40%] h-1/2 md:h-full flex flex-col bg-white border-r">

        {/* 🔥 FILTERS (Sticky) */}
        <div className="p-3 border-b bg-white sticky top-0 z-10 space-y-2">

          {/* Event Type */}
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="corporate">Corporate</option>
            <option value="function">Function</option>
          </select>

          {/* Search */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city / area / venue..."
            className="w-full p-2 border rounded"
          />

          {/* Current Location */}
          <button
            onClick={getCurrentLocation}
            className="w-full p-2 bg-black text-white rounded"
          >
            Use Current Location
          </button>
        </div>

        {/* 📋 VENUE LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {places.map((place) => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            const distance = getDistance(
              center.lat,
              center.lng,
              lat,
              lng
            );

            const image =
              place.photos?.[0]?.getUrl({ maxWidth: 400 }) ||
              "https://via.placeholder.com/300";

            return (
              <div
                key={place.place_id}
                onClick={() => {
                  setSelected(place);
                  map.panTo({ lat, lng });
                }}
                className={`border rounded-xl p-3 cursor-pointer transition ${selected?.place_id === place.place_id
                    ? "border-blue-500 shadow"
                    : "hover:shadow"
                  }`}
              >
                <img
                  src={image}
                  className="w-full h-40 object-cover rounded-lg"
                />

                <h3 className="font-semibold mt-2">{place.name}</h3>
                <p className="text-sm text-gray-500">{place.vicinity}</p>
                <p>⭐ {place.rating || "N/A"}</p>
                <p className="text-sm">📍 {distance} km away</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    const data = {
                      name: place.name,
                      address: place.vicinity,
                      lat,
                      lng,
                      placeId: place.place_id,
                      eventType,
                    };

                    localStorage.setItem(
                      "selectedVenue",
                      JSON.stringify(data)
                    );

                    alert("Venue Selected!");
                  }}
                  className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
                >
                  Book Now
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ RIGHT PANEL - MAP */}
      <div className="w-full md:w-[60%] h-1/2 md:h-full">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={13}
          onLoad={(mapInstance) => setMap(mapInstance)}
          onIdle={() => {
            if (map) {
              const c = map.getCenter();
              fetchPlaces({ lat: c.lat(), lng: c.lng() });
            }
          }}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            const newLoc = { lat, lng };
            setCenter(newLoc);
            fetchPlaces(newLoc);
          }}
        >
          {places.map((place) => (
            <Marker
              key={place.place_id}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
              onClick={() => setSelected(place)}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{
                lat: selected.geometry.location.lat(),
                lng: selected.geometry.location.lng(),
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div>
                <h4>{selected.name}</h4>
                <p>{selected.vicinity}</p>
                <p>⭐ {selected.rating || "N/A"}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  </LoadScript>
);