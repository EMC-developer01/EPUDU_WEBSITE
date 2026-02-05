import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Events from "./pages/Events";
import EventEdit from "./pages/EventEdit";
import ClientUsers from "./pages/ClientUsers";
import VendorUsers from "./pages/VendorUsers";
import VendorOrdersList from "./pages/vendorOrderList";
import ClientHomepageImages from "./pages/ClientHomepage-Images";
import ClientBanner from "./pages/ClientBanner";
import ClientInvitationCards from "./pages/ClientInvitationCards";
import ClientPaymentStatus from "./pages/Client-PaymentStatus";
import VendorPaymentStatus from "./pages/Vendor-PaymentStatus";
import EventEdits from "./pages/EventEdits";
import ClientHomepageServices from "./pages/ClientHomepageServices";
import ClientHomepageVideo from "./pages/ClientHomepageVideo";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/admin" >
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

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
          path="/client-payments"
          element={
            <ProtectedRoute>
              <ClientPaymentStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-payments"
          element={
            <ProtectedRoute>
              <VendorPaymentStatus />
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
          path="/Client-homepage-services"
          element={
            <ProtectedRoute>
              <ClientHomepageServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Client-homepage-videos"
          element={
            <ProtectedRoute>
              <ClientHomepageVideo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Client-banner-Img"
          element={
            <ProtectedRoute>
              <ClientBanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Client-invitation-Img"
          element={
            <ProtectedRoute>
              <ClientInvitationCards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/eventedit/:id"
          element={
            <ProtectedRoute>
              <EventEdits />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
