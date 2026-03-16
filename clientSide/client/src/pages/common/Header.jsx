import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  ChevronDownIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import epudulogo from "../../../dist/logo-try.png";
import epudutry from "../../../dist/logo-try-1.png";
import EventGalaxyPanel from "./EventPlayGround";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";

  const API_URL = import.meta.env.VITE_API_URL;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const [isMobileDropdown, setIsMobileDropdown] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState("");

  // Refs for click-outside detection
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Refs to track trigger button positions for portal dropdowns
  const eventsButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Dropdown positions for portals
  const [eventsDropPos, setEventsDropPos] = useState({ top: 0, left: 0 });
  const [profileDropPos, setProfileDropPos] = useState({ top: 0, right: 0 });

  // ── LOGIN CHECK ──────────────────────────────────────────────
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
    if (logged) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user?.name || "User");
    }
  }, []);

  // ── FETCH USER ───────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const { mobile } = JSON.parse(storedUser);
    axios.get(`${API_URL}/api/client/users/${mobile}`).then((res) => {
      setUserName(res.data.name);
      setUserPhoto(res.data.photo);
    });
  }, []);

  // ── CLICK OUTSIDE — close both dropdowns ────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── CLOSE DROPDOWNS ON ROUTE CHANGE ─────────────────────────
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenu(false);
    setIsMobileDropdown(false);
  }, [pathname]);

  // ── CALCULATE PORTAL POSITIONS ──────────────────────────────
  const openEventsDropdown = (e) => {
    e.preventDefault();
    if (!isDropdownOpen && eventsButtonRef.current) {
      const rect = eventsButtonRef.current.getBoundingClientRect();
      setEventsDropPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const openProfileDropdown = (e) => {
    e.preventDefault();
    if (!isProfileOpen && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setProfileDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* ── MAIN WRAPPER ─────────────────────────────────────── */}
      <div
        className={`w-full galaxy-bg ${isHome
            ? "relative min-h-screen text-white"
            : "fixed top-0 left-0 shadow-md h-[75px]"
          } z-[9999]`}
      >
        {/* ── HEADER ───────────────────────────────────────────── */}
        <header
          className={`w-full ${isHome ? "absolute top-0 left-0" : "relative"
            }`}
        >
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">

            {/* LOGO */}
            <div
              className="flex lg:flex-1 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src={isHome ? epudulogo : epudutry}
                className="h-10 w-auto"
                alt="logo"
              />
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenu((prev) => !prev)}
                style={{ backgroundColor: "black", color: "#ffffff" }}
                className="p-2"
              >
                {isMobileMenu ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* ── DESKTOP MENU ─────────────────────────────────── */}
            <div className="hidden lg:flex lg:gap-x-12">
              <Link
                to="/"
                className="flex items-center gap-x-1 text-sm font-semibold"
              >
                Home
              </Link>

              {/* EVENTS TRIGGER */}
              <div ref={dropdownRef} className="relative">
                <button
                  ref={eventsButtonRef}
                  onClick={openEventsDropdown}
                  className="flex items-center gap-x-1 text-sm font-semibold bg-transparent border-none cursor-pointer"
                  style={{ color: "inherit" }}
                >
                  Events
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
              </div>

              <Link to="/contact" className="text-sm font-semibold">
                Contact
              </Link>
            </div>

            {/* ── PROFILE / LOGIN ───────────────────────────────── */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {isLoggedIn ? (
                <div ref={profileRef} className="relative">
                  <button
                    ref={profileButtonRef}
                    onClick={openProfileDropdown}
                    className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
                    style={{ color: "inherit" }}
                  >
                    <span
                      className={`text-sm font-semibold ${isHome ? "text-white" : "text-black"
                        }`}
                    >
                      {userName}
                    </span>
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        className="h-8 w-8 rounded-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <UserCircleIcon
                        className={`h-8 w-8 ${isHome ? "text-white" : "text-black"
                          }`}
                      />
                    )}
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-semibold">
                  Login →
                </Link>
              )}
            </div>
          </nav>

          {/* ── MOBILE MENU ────────────────────────────────────── */}
          {isMobileMenu && (
            <div className="lg:hidden bg-black text-white px-6 pb-6 z-[9999] relative">
              <Link
                to="/"
                className="block py-2"
                onClick={() => setIsMobileMenu(false)}
              >
                Home
              </Link>

              <button
                onClick={() => setIsMobileDropdown((prev) => !prev)}
                className="flex items-center justify-between w-full py-2"
                style={{ backgroundColor: "#030303", color: "#ffffff" }}
              >
                Events
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${isMobileDropdown ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isMobileDropdown && (
                <div className="pl-4">
                  {["birthday", "wedding", "functions"].map((item) => (
                    <Link
                      key={item}
                      to={`/${item}`}
                      className="block py-2 capitalize"
                      onClick={() => {
                        setIsMobileMenu(false);
                        setIsMobileDropdown(false);
                      }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                to="/contact"
                className="block py-2"
                onClick={() => setIsMobileMenu(false)}
              >
                Contact
              </Link>

              <div className="border-t border-white mt-4 pt-4">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/profile"
                      className="block py-2"
                      onClick={() => setIsMobileMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/eventHistory"
                      className="block py-2"
                      onClick={() => setIsMobileMenu(false)}
                    >
                      Event History
                    </Link>
                    <Link
                      to="/custom-services-History"
                      className="block py-2"
                      onClick={() => setIsMobileMenu(false)}
                    >
                      Custom Services
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block py-2 w-full text-left"
                      style={{ backgroundColor: "#030303", color: "#ff4d4d" }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block py-2"
                    onClick={() => setIsMobileMenu(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </header>

        {/* HOME PAGE PANEL */}
        {isHome && <EventGalaxyPanel />}
      </div>

      {/* ── PORTAL: EVENTS DROPDOWN ──────────────────────────── */}
      {isDropdownOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: eventsDropPos.top,
              left: eventsDropPos.left,
              zIndex: 999999,
            }}
            className="w-44 bg-white text-black rounded-lg shadow-xl border border-gray-100"
          >
            {["birthday", "wedding", "functions"].map((item) => (
              <Link
                key={item}
                to={`/${item}`}
                className="block px-4 py-2 hover:bg-gray-100 capitalize text-sm font-medium transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>,
          document.body
        )}

      {/* ── PORTAL: PROFILE DROPDOWN ─────────────────────────── */}
      {isProfileOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: profileDropPos.top,
              right: profileDropPos.right,
              zIndex: 999999,
            }}
            className="w-48 bg-white text-black rounded-lg shadow-xl border border-gray-100"
          >
            <Link
              to="/profile"
              className="block px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
              onClick={() => setIsProfileOpen(false)}
            >
              Profile
            </Link>
            <Link
              to="/eventHistory"
              className="block px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
              onClick={() => setIsProfileOpen(false)}
            >
              Event History
            </Link>
            <Link
              to="/custom-services-History"
              className="block px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
              onClick={() => setIsProfileOpen(false)}
            >
              Custom Services
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>,
          document.body
        )}
    </>
  );
}