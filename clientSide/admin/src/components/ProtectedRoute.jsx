import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("adminToken");
    return token ? children : <Navigate to="/login" replace />;
}

