import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Navigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import Dashboard from './pages/Dashboard.jsx'
import VendorLogin from './pages/Login.jsx'
import ProtectedRoute from "./ProtectedRoute.jsx"
import VendorRegistration from './pages/VendorRegistration.jsx';
import VendorAddItem from './pages/VendoeAddItem.jsx';
import OrderList from './pages/OrderList.jsx';
import VendorProfile from './pages/profile.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename='/vendor'>
      <Routes>
        <Route path="/login" element={<VendorLogin />} />
        <Route path="/registration" element={<VendorRegistration />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/additems"
          element={
            <ProtectedRoute>
              <VendorAddItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <VendorProfile />
            </ProtectedRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  </StrictMode>
)
