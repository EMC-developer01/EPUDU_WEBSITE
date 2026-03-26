"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 17.385044,
  lng: 78.486671, // Hyderabad default
};

export default function VenueBookingSection() {
  const [map, setMap] = useState(null);
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);

  const [filters, setFilters] = useState({
    city: "",
    rating: 0,
    search: "",
  });

  // 📍 Fetch venues from Google Places
  const fetchVenues = useCallback(() => {
    if (!map || !window.google) return;

    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      bounds: map.getBounds(),
      keyword: "hotel OR resort OR function hall",
    };

    service.nearbySearch(request, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results
      ) {
        const formatted = results.map((place) => ({
          id: place.place_id,
          name: place.name,
          rating: place.rating || 0,
          location: place.geometry.location,
          address: place.vicinity || "",
        }));

        setVenues(formatted);
        setFilteredVenues(formatted);
      }
    });
  }, [map]);

  // 📌 Fetch when map loads or moves
  useEffect(() => {
    if (map) {
      fetchVenues();
      map.addListener("idle", fetchVenues);
    }
  }, [map, fetchVenues]);

  // 🎯 Filter Logic
  useEffect(() => {
    let result = venues;

    // City filter
    if (filters.city) {
      result = result.filter((v) =>
        v.address.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter((v) => v.rating >= filters.rating);
    }

    // Search filter
    if (filters.search) {
      result = result.filter((v) =>
        v.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredVenues(result);
  }, [filters, venues]);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* 🔎 FILTER PANEL */}
      <div style={{ width: "300px" }}>
        <h3>Filters</h3>

        {/* Search */}
        <input
          type="text"
          placeholder="Search venue..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px" }}
        />

        {/* City */}
        <select
          value={filters.city}
          onChange={(e) =>
            setFilters({ ...filters, city: e.target.value })
          }
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option value="">All Cities</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Chennai">Chennai</option>
        </select>

        {/* Rating */}
        <select
          value={filters.rating}
          onChange={(e) =>
            setFilters({
              ...filters,
              rating: Number(e.target.value),
            })
          }
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option value={0}>All Ratings</option>
          <option value={4}>4★ & above</option>
          <option value={3}>3★ & above</option>
        </select>
      </div>

      {/* 🗺️ MAP + RESULTS */}
      <div style={{ flex: 1 }}>
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
            onLoad={(mapInstance) => setMap(mapInstance)}
          >
            {filteredVenues.map((venue) => (
              <Marker
                key={venue.id}
                position={{
                  lat: venue.location.lat(),
                  lng: venue.location.lng(),
                }}
              />
            ))}
          </GoogleMap>
        </LoadScript>

        {/* 📋 Venue List */}
        <div style={{ marginTop: "20px" }}>
          {filteredVenues.map((v) => (
            <div
              key={v.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h4>{v.name}</h4>
              <p>{v.address}</p>
              <p>⭐ {v.rating}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}