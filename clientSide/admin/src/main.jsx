import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Events from "./pages/Events";
import EventEdit from "./pages/EventEdit";
import ClientUsers from "./pages/ClientUsers";
import VendorUsers from "./pages/VendorUsers";
import VendorOrdersList from "./pages/vendorOrderList";
import ClientHomepageImages from "./pages/ClientHomepage-Images";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-users"
          element={
            <ProtectedRoute>
              <ClientUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-users"
          element={
            <ProtectedRoute>
              <VendorUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-Orders"
          element={
            <ProtectedRoute>
              <VendorOrdersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Client-homepage-Img"
          element={
            <ProtectedRoute>
              <ClientHomepageImages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/eventedits/:id"
          element={
            <ProtectedRoute>
              <EventEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
