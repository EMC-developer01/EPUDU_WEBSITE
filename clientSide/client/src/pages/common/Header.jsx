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

  /* ───────────── STATE ───────────── */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const [isMobileDropdown, setIsMobileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState("");

  /* ───────────── REFS ───────────── */
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const eventsButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  const eventsMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  /* ───────────── PORTAL POSITIONS ───────────── */
  const [eventsDropPos, setEventsDropPos] = useState({ top: 0, left: 0 });
  const [profileDropPos, setProfileDropPos] = useState({ top: 0, right: 0 });

  const navColor = isHome ? "text-white" : "text-black";

  const cleanBtn =
    "bg-transparent border-none outline-none cursor-pointer hover:opacity-70 transition-opacity";

  /* ───────────── LOGIN CHECK ───────────── */
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);

    if (logged) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user?.name || "User");
    }
  }, []);

  /* ───────────── FETCH USER ───────────── */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const { mobile } = JSON.parse(storedUser);
    if (!mobile) return;

    axios
      .get(`${API_URL}/api/client/users/${mobile}`)
      .then((res) => {
        setUserName(res.data.name);
        setUserPhoto(res.data.photo);
      })
      .catch(() => {});
  }, [API_URL]);

  /* ───────────── CLICK OUTSIDE ───────────── */
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        eventsMenuRef.current &&
        !eventsMenuRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ───────────── ROUTE CHANGE ───────────── */
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenu(false);
    setIsMobileDropdown(false);
  }, [pathname]);

  /* ───────────── OPEN EVENTS ───────────── */
  const openEventsDropdown = () => {
    if (!isDropdownOpen && eventsButtonRef.current) {
      const r = eventsButtonRef.current.getBoundingClientRect();
      setEventsDropPos({ top: r.bottom + 8, left: r.left });
    }
    setIsDropdownOpen((p) => !p);
  };

  /* ───────────── OPEN PROFILE ───────────── */
  const openProfileDropdown = () => {
    if (!isProfileOpen && profileButtonRef.current) {
      const r = profileButtonRef.current.getBoundingClientRect();
      setProfileDropPos({
        top: r.bottom + 8,
        right: window.innerWidth - r.right,
      });
    }
    setIsProfileOpen((p) => !p);
  };

  /* ───────────── LOGOUT ───────────── */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`w-full galaxy-bg z-[9999] ${
          isHome
            ? "relative min-h-screen text-white"
            : "fixed top-0 left-0 h-[75px] shadow-md"
        }`}
      >
        <header
          className={`w-full ${
            isHome ? "absolute top-0 left-0" : "relative bg-white"
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
                alt="Epudu logo"
              />
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenu((p) => !p)}
                className={`p-2 ${cleanBtn} ${navColor}`}
              >
                {isMobileMenu ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex lg:gap-x-12 items-center">
              <Link
                to="/"
                className={`text-sm font-semibold hover:opacity-70 ${navColor}`}
              >
                Home
              </Link>

              {/* EVENTS */}
              <div ref={dropdownRef}>
                <button
                  ref={eventsButtonRef}
                  onClick={openEventsDropdown}
                  className={`flex items-center gap-x-1 text-sm font-semibold ${cleanBtn} ${navColor}`}
                >
                  Events
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <Link
                to="/contact"
                className={`text-sm font-semibold hover:opacity-70 ${navColor}`}
              >
                Contact
              </Link>
            </div>

            {/* PROFILE */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {isLoggedIn ? (
                <div ref={profileRef}>
                  <button
                    ref={profileButtonRef}
                    onClick={openProfileDropdown}
                    className={`flex items-center gap-2 ${cleanBtn}`}
                  >
                    <span className={`text-sm font-semibold ${navColor}`}>
                      {userName}
                    </span>

                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        className="h-8 w-8 rounded-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <UserCircleIcon className={`h-8 w-8 ${navColor}`} />
                    )}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`text-sm font-semibold hover:opacity-70 ${navColor}`}
                >
                  Login →
                </Link>
              )}
            </div>
          </nav>

          {/* MOBILE MENU */}
          {isMobileMenu && (
            <div className="lg:hidden bg-black text-white px-6 pb-6">
              <Link to="/" className="block py-2 text-sm font-semibold">
                Home
              </Link>

              <button
                onClick={() => setIsMobileDropdown((p) => !p)}
                className="flex justify-between w-full py-2 text-sm font-semibold"
              >
                Events
                <ChevronDownIcon
                  className={`h-4 w-4 ${
                    isMobileDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMobileDropdown && (
                <div className="pl-4 border-l border-white/30 ml-1">
                  {["birthday", "wedding", "functions"].map((item) => (
                    <Link
                      key={item}
                      to={`/${item}`}
                      className="block py-2 text-sm capitalize"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}

              <Link to="/contact" className="block py-2 text-sm font-semibold">
                Contact
              </Link>
            </div>
          )}
        </header>

        {isHome && <EventGalaxyPanel />}
      </div>

      {/* EVENTS DROPDOWN */}
      {isDropdownOpen &&
        createPortal(
          <div
            ref={eventsMenuRef}
            style={{
              position: "fixed",
              top: eventsDropPos.top,
              left: eventsDropPos.left,
              zIndex: 999999,
            }}
            className="w-44 bg-white text-black rounded-lg shadow-xl border"
          >
            {["birthday", "wedding", "functions"].map((item) => (
              <Link
                key={item}
                to={`/${item}`}
                className="block px-4 py-2 text-sm capitalize hover:bg-gray-50"
                onClick={() => setIsDropdownOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>,
          document.body
        )}

      {/* PROFILE DROPDOWN */}
      {isProfileOpen &&
        createPortal(
          <div
            ref={profileMenuRef}
            style={{
              position: "fixed",
              top: profileDropPos.top,
              right: profileDropPos.right,
              zIndex: 999999,
            }}
            className="w-48 bg-white text-black rounded-lg shadow-xl border"
          >
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              Profile
            </Link>

            <Link
              to="/eventHistory"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              Event History
            </Link>

            <Link
              to="/custom-services-History"
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              Custom Services
            </Link>

            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>,
          document.body
        )}
    </>
  );
}