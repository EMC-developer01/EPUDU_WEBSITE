import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

  const profileRef = useRef(null);

  // login check
  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(logged);

    if (logged) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(user?.name || "User");
    }
  }, []);

  // fetch user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const { mobile } = JSON.parse(storedUser);

    axios.get(`${API_URL}/api/client/users/${mobile}`).then((res) => {
      setUserName(res.data.name);
      setUserPhoto(res.data.photo);
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      className={`w-full galaxy-bg z-50 ${isHome ? "relative min-h-screen text-white" : "fixed top-0 left-0 shadow-md h-[75px]"} z-50`}
    >
      {/* HEADER */}
      <header
        className={`w-full z-[9999] ${isHome ? "absolute top-0 left-0" : "relative shadow-md"
          }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">

          {/* LOGO */}
          <div className="flex lg:flex-1 cursor-pointer" onClick={() => navigate("/")}>
            <img
              src={isHome ? epudulogo : epudutry}
              className="h-10 w-auto"
              alt="logo"
            />
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMobileMenu(!isMobileMenu)}
              style={{ backgroundColor: "black", color: "#ffffff" }}
              className="p-2 text-gray-400"
            >
              {isMobileMenu ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex lg:gap-x-12">

            <Link to="/" className="flex items-center gap-x-1 text-sm font-semibold">
              Home
            </Link>

            {/* EVENTS DROPDOWN */}
            <div className="relative">
              <Link
                to={"."}
                onClick={(e) => {
                  e.preventDefault();  // ← ADD THIS
                  setIsDropdownOpen(!isDropdownOpen)
                }}
                className="flex items-center gap-x-1 text-sm font-semibold"
              >
                Events
                <ChevronDownIcon className="h-4 w-4" />
              </Link>

              {isDropdownOpen && (
                <div className="absolute mt-3 w-40 bg-white text-black rounded-lg shadow-lg">
                  {["birthday", "wedding", "functions"].map((e) => (
                    <Link
                      key={e}
                      to={`/${e}`}
                      className="block px-4 py-2 hover:bg-gray-100 capitalize"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {e}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/contact" className="text-sm font-semibold ">
              Contact
            </Link>

          </div>

          {/* PROFILE / LOGIN */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">

            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <Link
                  to={"."}
                  onClick={(e) => {
                    e.preventDefault();  // ← ADD THIS
                    setIsProfileOpen(!isProfileOpen)
                  }}
                  className="flex items-center gap-2"
                >
                  <span className={`${isHome ? `text-white` : `text-black`}`}>{userName}</span>

                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" />
                  )}
                </Link>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">

                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>

                    <Link
                      to="/eventHistory"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Event History
                    </Link>

                    <Link
                      to="/custom-services-History"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Custom Services
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      style={{ backgroundColor: "#030303", color: "#ffffff" }}
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-semibold">
                Login →
              </Link>
            )}
          </div>
        </nav>

        {/* MOBILE MENU */}
        {isMobileMenu && (
          <div className="lg:hidden bg-black text-white px-6 pb-6">

            <Link to="/" className="block py-2">
              Home
            </Link>

            <button
              onClick={() => setIsMobileDropdown(!isMobileDropdown)}
              className="flex items-center justify-between w-full py-2"
              style={{ backgroundColor: "#030303", color: "#ffffff" }}
            >
              Events
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {isMobileDropdown && (
              <div className="pl-4">
                {["birthday", "wedding", "functions"].map((e) => (
                  <Link
                    key={e}
                    to={`/${e}`}
                    className="block py-2 capitalize"
                  >
                    {e}
                  </Link>
                ))}
              </div>
            )}

            <Link to="/contact" className="block py-2">
              Contact
            </Link>

            <div className="border-t border-white mt-4 pt-4">

              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="block py-2">
                    Profile
                  </Link>

                  <Link to="/eventHistory" className="block py-2">
                    Event History
                  </Link>

                  <Link to="/custom-services-History" className="block py-2">
                    Custom Services
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block py-2 text-red-500"
                    style={{ backgroundColor: "#030303", color: "#ffffff" }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="block py-2">
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
  );
}