import React, { useState, useEffect } from "react";
import {
    GoogleMap,
    Marker,
    InfoWindow,
    useLoadScript,
} from "@react-google-maps/api";

const libraries = ["places"];

export default function VenueSearch() {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "YOUR_API_KEY",
        libraries,
    });

    const [map, setMap] = useState(null);
    const [search, setSearch] = useState("");
    const [places, setPlaces] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);

    const [filterRating, setFilterRating] = useState("");

    const [location, setLocation] = useState({
        lat: 17.385,
        lng: 78.4867,
    });

    // ✅ GET CURRENT LOCATION
    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const coords = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
            setLocation(coords);

            localStorage.setItem("selectedLocation", JSON.stringify(coords));
        });
    };

    // ✅ LOAD SAVED LOCATION
    useEffect(() => {
        const saved = localStorage.getItem("selectedLocation");
        if (saved) setLocation(JSON.parse(saved));
    }, []);

    // ✅ SEARCH PLACES (HOTELS / RESORTS / PARTY)
    const searchPlaces = () => {
        if (!map) return;

        const service = new window.google.maps.places.PlacesService(map);

        const request = {
            location,
            radius: 5000,
            keyword: search || "hotel OR resort OR banquet hall OR party lawn",
            type: "lodging",
        };

        service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const formatted = results.map((place) => ({
                    id: place.place_id,
                    name: place.name,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    rating: place.rating || 0,
                    address: place.vicinity,
                    image: place.photos
                        ? place.photos[0].getUrl()
                        : "https://via.placeholder.com/150",
                }));

                setPlaces(formatted);
            }
        });
    };

    // ✅ FILTER LOGIC
    const filteredVenues = places.filter((p) => {
        return filterRating ? p.rating >= Number(filterRating) : true;
    });

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6">

            {/* LEFT SIDE */}
            <div className="lg:w-1/2 max-h-[520px] overflow-y-auto border-r pr-4 space-y-4">

                {/* SEARCH + FILTER */}
                <div className="sticky top-0 bg-white pb-3 z-10 space-y-3">

                    <input
                        type="text"
                        placeholder="Search hotels, resorts, party places..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />

                    <div className="flex flex-wrap gap-2">

                        <button
                            onClick={getCurrentLocation}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Use Current Location
                        </button>

                        <button
                            onClick={searchPlaces}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg"
                        >
                            Search
                        </button>

                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value)}
                            className="border rounded-lg px-2 py-2"
                        >
                            <option value="">All Ratings</option>
                            <option value="3">3★ +</option>
                            <option value="4">4★ +</option>
                            <option value="5">5★</option>
                        </select>

                    </div>
                </div>

                {/* LIST */}
                {filteredVenues.length === 0 && (
                    <p className="text-gray-500 text-sm">No venues found.</p>
                )}

                {filteredVenues.map((venue) => (
                    <div
                        key={venue.id}
                        onClick={() => setSelectedVenue(venue)}
                        className={`flex gap-4 p-4 border rounded-xl cursor-pointer
              ${selectedVenue?.id === venue.id
                                ? "bg-blue-50 border-blue-400"
                                : "hover:bg-gray-50"}`}
                    >

                        <img
                            src={venue.image}
                            alt={venue.name}
                            className="w-24 h-24 object-cover rounded-lg"
                        />

                        <div>
                            <h4 className="font-semibold text-lg">{venue.name}</h4>

                            <p className="text-sm text-gray-600">
                                {venue.address}
                            </p>

                            <p className="text-yellow-500 text-sm">
                                ⭐ {venue.rating}
                            </p>
                        </div>

                    </div>
                ))}
            </div>

            {/* RIGHT SIDE MAP */}
            <div className="lg:w-1/2">

                <GoogleMap
                    zoom={13}
                    center={location}
                    onLoad={(map) => setMap(map)}
                    mapContainerStyle={{
                        width: "100%",
                        height: "520px",
                        borderRadius: "12px",
                    }}
                >

                    {filteredVenues.map((venue) => (
                        <Marker
                            key={venue.id}
                            position={{ lat: venue.lat, lng: venue.lng }}
                            onClick={() => setSelectedVenue(venue)}
                        />
                    ))}

                    {selectedVenue && (
                        <InfoWindow
                            position={{
                                lat: selectedVenue.lat,
                                lng: selectedVenue.lng,
                            }}
                            onCloseClick={() => setSelectedVenue(null)}
                        >
                            <div>
                                <h4 className="font-semibold">{selectedVenue.name}</h4>
                                <p className="text-sm">{selectedVenue.address}</p>
                            </div>
                        </InfoWindow>
                    )}

                </GoogleMap>
            </div>
        </div>
    );
}