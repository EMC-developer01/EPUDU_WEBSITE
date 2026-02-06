import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Home from "./pages/Home.jsx";
import Birthday from "./pages/Birthday.jsx";
import Wedding from "./pages/Wedding.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./pages/components/ProtectedRoute.jsx";
import Events from "./pages/Events.jsx";
import Contact from "./pages/Contact.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/Forgetpassword.jsx";
import AuthOverlay from "./pages/AuthOverlay.jsx";
import Profile from "./pages/Profile.jsx";
import Functions from "./pages/Functions.jsx";
import ChangePassword from "./pages/changePassword.jsx";
import EventHistory from "./pages/EventHistory.jsx";
import ErrorBoundary from "./pages/components/ErrorBoundary.jsx";
import CustomGifts from "./pages/CustomGifts.jsx";
import PartyPlaces from "./pages/PartyPlaces.jsx";
import FunActivities from "./pages/Funactivites.jsx";
import Decoration from "./pages/Decoration.jsx";
import Photography from "./pages/Photography.jsx";
import Catering from "./pages/Catering.jsx";
import CustomServicesHistory from "./pages/Custum-Services-History.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/client" >
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthOverlay />} />
        {/* <Route path="/forget-password" element={<ForgotPassword/>} />
        <Route path="/signup" element={<Signup/>} /> */}
        <Route path="/contact" element={<Contact />} />


        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eventHistory"
          element={
            <ProtectedRoute>
              <EventHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/birthday"
          element={
            <ProtectedRoute>
              {/* <ErrorBoundary> */}
              <Birthday />
              {/* </ErrorBoundary> */}
            </ProtectedRoute>
          }
        />
        <Route path="/birthday/edit/:id"
          element={
            <ProtectedRoute>
              {/* <ErrorBoundary> */}
              <Birthday />
              {/* </ErrorBoundary> */}
            </ProtectedRoute>
          } />

        <Route
          path="/wedding"
          element={
            <ProtectedRoute>
              <Wedding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/functions"
          element={
            <ProtectedRoute>
              <Functions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-gifts"
          element={
            <ProtectedRoute>
              <CustomGifts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/party-places"
          element={
            <ProtectedRoute>
              <PartyPlaces />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fun-activities"
          element={
            <ProtectedRoute>
              <FunActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decorations"
          element={
            <ProtectedRoute>
              <Decoration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/photography"
          element={
            <ProtectedRoute>
              <Photography />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catering"
          element={
            <ProtectedRoute>
              <Catering />
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-services-History"
          element={
            <ProtectedRoute>
              <CustomServicesHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
  // <StrictMode>
  //   <BrowserRouter>
  //     <Routes>
  //       <Route path="/" element={<Home />} />
  //       <Route path="/login" element={<Login/>}/>
  //       <Route path="/profile" element={<Profile />} />
  //       <Route path="/birthday" element={<Birthday />} />
  //       <Route path="/birthday/edit/:id" element={<Birthday />} />
  //       <Route path="/wedding" element={<Wedding />} />
  //       <Route path="/functions" element={<Functions />} />
  //     </Routes>
  //   </BrowserRouter>
  // </StrictMode>
);
