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

  /* ───────── STATE ───────── */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenu, setIsMobileMenu] = useState(false);
  const [isMobileDropdown, setIsMobileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState("");

  /* ───────── REFS ───────── */
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const eventsButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const eventsMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const [eventsDropPos, setEventsDropPos] = useState({ top: 0, left: 0 });
  const [profileDropPos, setProfileDropPos] = useState({ top: 0, right: 0 });

  /* ───────── INLINE STYLES ───────── */
  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    outline: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: isHome ? "#fff" : "#000",
  };

  const textStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: isHome ? "#fff" : "#000",
    textDecoration: "none",
    cursor: "pointer",
  };

  /* ───────── LOGIN CHECK ───────── */
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);

    if (logged) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user?.name || "User");
    }
  }, []);

  /* ───────── FETCH USER ───────── */
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
      .catch(() => { });
  }, [API_URL]);

  /* ───────── CLICK OUTSIDE ───────── */
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

  /* ───────── ROUTE CHANGE ───────── */
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenu(false);
    setIsMobileDropdown(false);
  }, [pathname]);

  /* ───────── OPEN EVENTS ───────── */
  const openEventsDropdown = () => {
    if (!isDropdownOpen && eventsButtonRef.current) {
      const r = eventsButtonRef.current.getBoundingClientRect();
      setEventsDropPos({ top: r.bottom + 8, left: r.left });
    }
    setIsDropdownOpen((p) => !p);
  };

  /* ───────── OPEN PROFILE ───────── */
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

  /* ───────── LOGOUT ───────── */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`w-full galaxy-bg z-[9999] ${isHome
          ? "relative min-h-screen text-white z-[10000]"
          : "fixed top-0 left-0 w-full shadow-md"
          }`}
      >
        <header
          className={`w-full ${isHome ? "absolute top-0 left-0 z-[10000]" : "relative bg-white"
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

            {/* MOBILE BUTTON */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsMobileMenu((p) => !p)}
                style={buttonStyle}
              >
                {isMobileMenu ? (
                  <XMarkIcon style={{ width: 24, height: 24 }} />
                ) : (
                  <Bars3Icon style={{ width: 24, height: 24 }} />
                )}
              </button>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex lg:gap-x-12 items-center">

              <Link to="/" style={textStyle}>
                Home
              </Link>

              {/* EVENTS */}
              <div ref={dropdownRef}>
                <button
                  ref={eventsButtonRef}
                  onClick={openEventsDropdown}
                  style={buttonStyle}
                >
                  Events
                  <ChevronDownIcon
                    style={{
                      width: 16,
                      height: 16,
                      transform: isDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "0.2s",
                    }}
                  />
                </button>
              </div>

              <Link to="/contact" style={textStyle}>
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
                    style={buttonStyle}
                  >
                    <span style={textStyle}>{userName}</span>

                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        style={{
                          height: 32,
                          width: 32,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        alt="avatar"
                      />
                    ) : (
                      <UserCircleIcon
                        style={{ width: 32, height: 32 }}
                      />
                    )}
                  </button>
                </div>
              ) : (
                <Link to="/login" style={textStyle}>
                  Login →
                </Link>
              )}
            </div>
          </nav>

          {/* MOBILE MENU */}
          {isMobileMenu && (
            <div className="lg:hidden bg-white text-white px-6 pb-6 relative z-[9999]">
              <Link to="/" style={textStyle}>Home</Link>

              <button
                onClick={() => setIsMobileDropdown((p) => !p)}
                style={{ ...buttonStyle, width: "100%", justifyContent: "space-between" }}
              >
                Events
                <ChevronDownIcon
                  style={{
                    width: 16,
                    height: 16,
                    transform: isMobileDropdown
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>

              {isMobileDropdown && (
                <div style={{ paddingLeft: 15 }}>
                  {["birthday", "wedding", "functions"].map((item) => (
                    <Link
                      key={item}
                      to={`/${item}`}
                      style={textStyle}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}

              <Link to="/contact" style={textStyle}>
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
              background: "#fff",
              color: "#000",
              width: 180,
              borderRadius: 8,
              boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
              border: "1px solid #eee",
              zIndex: 999999,
            }}
          >
            {["birthday", "wedding", "functions"].map((item) => (
              <Link
                key={item}
                to={`/${item}`}
                style={{
                  display: "block",
                  padding: "10px 15px",
                  textTransform: "capitalize",
                  textDecoration: "none",
                  color: "#000",
                }}
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
              background: "#fff",
              color: "#000",
              width: 200,
              borderRadius: 8,
              boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
              border: "1px solid #eee",
              zIndex: 999999,
            }}
          >
            <Link to="/profile" style={{ display: "block", padding: 12 }}>
              Profile
            </Link>

            <Link to="/eventHistory" style={{ display: "block", padding: 12 }}>
              Event History
            </Link>

            <Link
              to="/custom-services-History"
              style={{ display: "block", padding: 12 }}
            >
              Custom Services
            </Link>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: 12,
                border: "none",
                background: "transparent",
                textAlign: "left",
                color: "red",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>,
          document.body
        )}
    </>
  );
}