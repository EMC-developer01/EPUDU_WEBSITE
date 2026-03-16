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

  // ── STATE ────────────────────────────────────────────────────
  const [isDropdownOpen,   setIsDropdownOpen]   = useState(false);
  const [isProfileOpen,    setIsProfileOpen]    = useState(false);
  const [isMobileMenu,     setIsMobileMenu]     = useState(false);
  const [isMobileDropdown, setIsMobileDropdown] = useState(false);
  const [isLoggedIn,       setIsLoggedIn]       = useState(false);
  const [userName,         setUserName]         = useState("User");
  const [userPhoto,        setUserPhoto]        = useState("");

  // ── REFS ─────────────────────────────────────────────────────
  const dropdownRef      = useRef(null); // click-outside for Events
  const profileRef       = useRef(null); // click-outside for Profile
  const eventsButtonRef  = useRef(null); // position source for Events portal
  const profileButtonRef = useRef(null); // position source for Profile portal

  // ── PORTAL POSITIONS ─────────────────────────────────────────
  const [eventsDropPos,  setEventsDropPos]  = useState({ top: 0, left: 0 });
  const [profileDropPos, setProfileDropPos] = useState({ top: 0, right: 0 });

  // ── COLOUR TOKEN — white on home, black everywhere else ──────
  const navColor = isHome ? "text-white" : "text-black";

  // ── SHARED CLEAN-BUTTON CLASS (no bg, no border, no outline) ─
  const cleanBtn =
    "bg-transparent border-none outline-none cursor-pointer hover:opacity-70 transition-opacity";

  // ── LOGIN CHECK ──────────────────────────────────────────────
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);
    if (logged) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user?.name || "User");
    }
  }, []);

  // ── FETCH FRESH USER ─────────────────────────────────────────
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
      .catch(() => {});
  }, []);

  // ── CLICK OUTSIDE → close both dropdowns ────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── ROUTE CHANGE → close everything ─────────────────────────
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenu(false);
    setIsMobileDropdown(false);
  }, [pathname]);

  // ── OPEN EVENTS DROPDOWN ─────────────────────────────────────
  const openEventsDropdown = () => {
    if (!isDropdownOpen && eventsButtonRef.current) {
      const r = eventsButtonRef.current.getBoundingClientRect();
      setEventsDropPos({ top: r.bottom + 8, left: r.left });
    }
    setIsDropdownOpen((p) => !p);
  };

  // ── OPEN PROFILE DROPDOWN ────────────────────────────────────
  const openProfileDropdown = () => {
    if (!isProfileOpen && profileButtonRef.current) {
      const r = profileButtonRef.current.getBoundingClientRect();
      setProfileDropPos({
        top:   r.bottom + 8,
        right: window.innerWidth - r.right,
      });
    }
    setIsProfileOpen((p) => !p);
  };

  // ── LOGOUT ───────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══════════════════════════════════════════════════════
          WRAPPER
          home    → relative, full-height hero container
          others  → fixed 75 px bar at top of viewport
      ══════════════════════════════════════════════════════ */}
      <div
        className={`w-full galaxy-bg z-[9999] ${
          isHome
            ? "relative min-h-screen text-white"
            : "fixed top-0 left-0 h-[75px] shadow-md"
        }`}
      >
        {/* ════════════════════════════════════════════════════
            HEADER
            home   → absolute overlay on hero, transparent
            others → relative inside fixed bar + white bg
        ════════════════════════════════════════════════════ */}
        <header
          className={`w-full ${
            isHome ? "absolute top-0 left-0" : "relative bg-white"
          }`}
        >
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">

            {/* ── LOGO ───────────────────────────────────── */}
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

            {/* ── MOBILE HAMBURGER ───────────────────────── */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenu((p) => !p)}
                className={`p-2 ${cleanBtn} ${navColor}`}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenu
                  ? <XMarkIcon className="h-6 w-6" />
                  : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>

            {/* ── DESKTOP NAV LINKS ──────────────────────── */}
            <div className="hidden lg:flex lg:gap-x-12 items-center">

              <Link
                to="/"
                className={`text-sm font-semibold hover:opacity-70
                  transition-opacity ${navColor}`}
              >
                Home
              </Link>

              {/* Events button */}
              <div ref={dropdownRef}>
                <button
                  ref={eventsButtonRef}
                  onClick={openEventsDropdown}
                  className={`flex items-center gap-x-1 text-sm font-semibold
                    ${cleanBtn} ${navColor}`}
                >
                  Events
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <Link
                to="/contact"
                className={`text-sm font-semibold hover:opacity-70
                  transition-opacity ${navColor}`}
              >
                Contact
              </Link>
            </div>

            {/* ── PROFILE / LOGIN ────────────────────────── */}
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
                  className={`text-sm font-semibold hover:opacity-70
                    transition-opacity ${navColor}`}
                >
                  Login →
                </Link>
              )}
            </div>
          </nav>

          {/* ── MOBILE SLIDE-DOWN MENU ─────────────────────── */}
          {isMobileMenu && (
            <div className="lg:hidden bg-black text-white px-6 pb-6
              relative z-[9999]">

              <Link
                to="/"
                className="block py-2 text-sm font-semibold hover:opacity-70"
                onClick={() => setIsMobileMenu(false)}
              >
                Home
              </Link>

              {/* Mobile Events accordion */}
              <button
                onClick={() => setIsMobileDropdown((p) => !p)}
                className={`flex items-center justify-between w-full py-2
                  text-sm font-semibold text-white ${cleanBtn}`}
              >
                Events
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
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
                      className="block py-2 text-sm capitalize hover:opacity-70"
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
                className="block py-2 text-sm font-semibold hover:opacity-70"
                onClick={() => setIsMobileMenu(false)}
              >
                Contact
              </Link>

              <div className="border-t border-white/30 mt-4 pt-4">
                {isLoggedIn ? (
                  <>
                    {[
                      { label: "Profile",         to: "/profile"                 },
                      { label: "Event History",   to: "/eventHistory"            },
                      { label: "Custom Services", to: "/custom-services-History" },
                    ].map(({ label, to }) => (
                      <Link
                        key={to}
                        to={to}
                        className="block py-2 text-sm hover:opacity-70"
                        onClick={() => setIsMobileMenu(false)}
                      >
                        {label}
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className={`block py-2 text-sm text-red-400 w-full
                        text-left ${cleanBtn}`}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block py-2 text-sm hover:opacity-70"
                    onClick={() => setIsMobileMenu(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </header>

        {/* HOME HERO PANEL */}
        {isHome && <EventGalaxyPanel />}
      </div>

      {/* ══════════════════════════════════════════════════════
          PORTAL — EVENTS DROPDOWN
          Mounted on <body> → escapes all page stacking contexts
      ══════════════════════════════════════════════════════ */}
      {isDropdownOpen &&
        createPortal(
          <div
            style={{
              position : "fixed",
              top      : eventsDropPos.top,
              left     : eventsDropPos.left,
              zIndex   : 999999,
            }}
            className="w-44 bg-white text-black rounded-lg shadow-xl
              border border-gray-100 overflow-hidden"
          >
            {["birthday", "wedding", "functions"].map((item) => (
              <Link
                key={item}
                to={`/${item}`}
                className="block px-4 py-2 text-sm font-medium capitalize
                  text-black hover:bg-gray-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>,
          document.body
        )}

      {/* ══════════════════════════════════════════════════════
          PORTAL — PROFILE DROPDOWN
      ══════════════════════════════════════════════════════ */}
      {isProfileOpen &&
        createPortal(
          <div
            style={{
              position : "fixed",
              top      : profileDropPos.top,
              right    : profileDropPos.right,
              zIndex   : 999999,
            }}
            className="w-48 bg-white text-black rounded-lg shadow-xl
              border border-gray-100 overflow-hidden"
          >
            {[
              { label: "Profile",         to: "/profile"                 },
              { label: "Event History",   to: "/eventHistory"            },
              { label: "Custom Services", to: "/custom-services-History" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="block px-4 py-2 text-sm text-black
                  hover:bg-gray-50 transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                {label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className={`block w-full text-left px-4 py-2 text-sm
                text-red-600 hover:bg-gray-50 transition-colors ${cleanBtn}`}
            >
              Logout
            </button>
          </div>,
          document.body
        )}
    </>
  );
}