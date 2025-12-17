import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Bars3Icon, // Added for mobile menu toggle
  XMarkIcon, // Added for mobile menu close
} from "@heroicons/react/24/solid";
import EventGalaxyPanel from "./EventPlayGround"; // Assuming you import the panel

export default function Header() {
  const { pathname } = useLocation();
  // Check if the current path is exactly the root path
  const isHome = pathname === "/";
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");

  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  // --- Authentication Logic (Unchanged) ---
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user?.name || "User");
    }
  }, []);

  // --- Click Outside Handlers (Modified to include dropdown) ---
  useEffect(() => {
    const handler = (e) => {
      // Close profile menu if click is outside
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      // Close desktop dropdown if click is outside
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Function to close all mobile menus
  const closeMobileMenus = () => {
    setIsMobileMenuOpen(false);
    setIsMobileDropdownOpen(false);
  };

  // --- Conditional Styling ---
  // The main header bar height is 75px on all pages.
  // The total component height is h-screen on the home page and h-[75px] elsewhere.
  const headerHeightClass = isHome ? "min-h-screen" : "h-[75px]";
  const headerBarHeight = "h-[75px]"; // Fixed height for the navigation bar itself

  return (
    // The outer container dictates the full height and content
    <div
      className={`w-full galaxy-bg text-white z-50  ${isHome ? 'relative min-h-screen' : 'fixed top-0 left-0 shadow-md h-[75px]'}`}
    >
      {/* 1. Navigation Bar (Fixed 75px height) */}
      <header className={`h-[75px] w-full  ${isHome ? 'absolute top-0 left-0' : 'relative shadow-md'} `}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <HomeIcon className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-lg">MyWebsite</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:text-blue-400 transition">Home</Link>

            <div className="relative" ref={dropdownRef}>
              <Link
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 hover:text-blue-400 transition"
              >
                Events <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </Link>

              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-40 bg-white text-black rounded-lg shadow-xl z-50">
                  {["birthday", "wedding", "functions"].map((e) => (
                    <Link
                      key={e}
                      to={`/${e}`}
                      className="block px-4 py-2 hover:bg-blue-100 capitalize"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {e}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
          </nav>

          {/* Profile / Login */}
          {isLoggedIn ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <Link
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2"
              >
                <span>{userName}</span>
                <UserCircleIcon className="h-8 w-8 text-blue-500" />
              </Link>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-xl z-50">
                  <Link className="block px-4 py-2 hover:bg-blue-100" to="/profile" onClick={() => setIsProfileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:block bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Mobile Menu Content (Appears only on mobile/small screens) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[75px] left-0 w-full bg-gray-800/95 backdrop-blur-sm shadow-lg z-40 pb-4">
          <Link
            to="/"
            className="block px-4 py-3 hover:bg-blue-600 transition"
            onClick={closeMobileMenus}
          >
            Home
          </Link>

          <div className="relative">
            <Link
              onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              className="w-full text-left flex justify-between items-center px-4 py-3 hover:bg-blue-600 transition"
            >
              Events <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </Link>

            {isMobileDropdownOpen && (
              <div className="bg-gray-700/80">
                {["birthday", "wedding", "functions"].map((e) => (
                  <Link
                    key={e}
                    to={`/${e}`}
                    className="block pl-8 pr-4 py-2 hover:bg-blue-500 capitalize"
                    onClick={closeMobileMenus}
                  >
                    {e}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/contact"
            className="block px-4 py-3 hover:bg-blue-600 transition"
            onClick={closeMobileMenus}
          >
            Contact
          </Link>

          {/* Mobile Login/Profile */}
          <div className="border-t border-white/20 mt-2 pt-2">
            {isLoggedIn ? (
              <>
                <Link className="block px-4 py-3 hover:bg-blue-600" to="/profile" onClick={closeMobileMenus}>
                  Profile ({userName})
                </Link>
                <button
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-800/50"
                  onClick={() => { handleLogout(); closeMobileMenus(); }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block mx-4 text-center bg-blue-600 px-4 py-2 rounded-lg mt-2 hover:bg-blue-700 transition"
                onClick={closeMobileMenus}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. Conditional Content (EventGalaxyPanel) */}
      {isHome && (

        <EventGalaxyPanel />

      )}
    </div>
  );
}