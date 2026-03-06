import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import EventGalaxyPanel from "./EventPlayGround";
import epudulogo from "../../../dist/logo-try.png";
import epudutry from "../../../dist/logo-try-1.png";

export default function Header() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isHome = pathname === "/";

  const [userPhoto, setUserPhoto] = useState("");
  const [userName, setUserName] = useState("User");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user?.name || "User");
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileMenuOpen(false);

      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const { mobile } = JSON.parse(storedUser);

    axios
      .get(`${API_URL}/api/client/users/${mobile}`)
      .then((res) => {
        setUserName(res.data.name);
        setUserPhoto(res.data.photo);
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const closeMobileMenus = () => {
    setIsMobileMenuOpen(false);
    setIsMobileDropdownOpen(false);
  };

  return (
    <div className={`w-full ${isHome ? "relative" : "fixed top-0 bg-white shadow-md"} z-50`}>
      
      {/* Header */}
      <header className="h-[75px] flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4">

          {/* Logo */}
          <div onClick={() => navigate("/")} className="cursor-pointer">
            <img
              src={isHome ? epudulogo : epudutry}
              alt="logo"
              className="h-[60px] w-auto"
            />
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link to="/" className={`${isHome ? "text-white" : "text-black"} hover:text-blue-500`}>
              Home
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1 ${isHome ? "text-white" : "text-black"} hover:text-blue-500`}
              >
                Events
                <ChevronDownIcon className={`h-4 w-4 transition ${isDropdownOpen && "rotate-180"}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-40 bg-white text-black rounded-md shadow-lg">
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

            <Link to="/contact" className={`${isHome ? "text-white" : "text-black"} hover:text-blue-500`}>
              Contact
            </Link>
          </nav>

          {/* Profile */}
          {isLoggedIn ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2"
              >
                <span className={isHome ? "text-white" : "text-black"}>{userName}</span>

                {userPhoto ? (
                  <img src={userPhoto} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-blue-500" />
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link to="/eventHistory" className="block px-4 py-2 hover:bg-gray-100">
                    Event History
                  </Link>
                  <Link to="/custom-services-History" className="block px-4 py-2 hover:bg-gray-100">
                    Custom Services
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
          )}

          {/* Mobile Button */}
          <button
            className="md:hidden"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <Link to="/" className="block px-4 py-3 border-b" onClick={closeMobileMenus}>
            Home
          </Link>

          <button
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className="w-full flex justify-between px-4 py-3 border-b"
          >
            Events
            <ChevronDownIcon className={`h-4 w-4 ${isMobileDropdownOpen && "rotate-180"}`} />
          </button>

          {isMobileDropdownOpen && (
            <div>
              {["birthday", "wedding", "functions"].map((e) => (
                <Link
                  key={e}
                  to={`/${e}`}
                  className="block pl-8 py-2"
                  onClick={closeMobileMenus}
                >
                  {e}
                </Link>
              ))}
            </div>
          )}

          <Link to="/contact" className="block px-4 py-3 border-b" onClick={closeMobileMenus}>
            Contact
          </Link>
        </div>
      )}

      {isHome && <EventGalaxyPanel />}
    </div>
  );
}