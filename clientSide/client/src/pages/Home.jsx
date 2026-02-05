'use client';

import React, { useEffect, useState } from 'react';
import Header from './common/Header';
import Footer from './common/Footer';
import { Link } from 'react-router-dom';
import Banner from './common/Banner';
import Login from './Login'; // 👈 Import Login component
import Signup from './Signup';
import ForgetPassword from './Forgetpassword';
import axios from "axios";


export default function Home() {
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const API = "http://localhost:4000/api/admin/Client-homepages-images/all";
  const IMAGE_BASE = "http://localhost:4000/uploads/homepageImages";
  const serviceAPI = "http://localhost:4000/api/admin/client-homepage-services";
  const Service_IMAGE_BASE = "http://localhost:4000/uploads/homepageServices";

  const [birthdayImg, setBirthdayImg] = useState([]);
  const [weddingImg, setWeddingImg] = useState([]);
  const [functionsImg, setFunctionsImg] = useState([]);
  const [services, setServices] = useState([]);
  const [bIndex, setBIndex] = useState(0);
  const [wIndex, setWIndex] = useState(0);
  const [fIndex, setFIndex] = useState(0);




  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => {
        setBirthdayImg(data.filter(i => i.eventName === "Birthday"));
        setWeddingImg(data.filter(i => i.eventName === "Wedding"));
        setFunctionsImg(data.filter(i => i.eventName === "Functions"));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (birthdayImg.length > 1) {
      const t = setInterval(
        () => setBIndex(i => (i + 1) % birthdayImg.length),
        5000 // 1 sec
      );
      return () => clearInterval(t);
    }
  }, [birthdayImg]);

  useEffect(() => {
    if (weddingImg.length > 1) {
      const t = setInterval(
        () => setWIndex(i => (i + 1) % weddingImg.length),
        9000 // 1.5 sec
      );
      return () => clearInterval(t);
    }
  }, [weddingImg]);

  useEffect(() => {
    if (functionsImg.length > 1) {
      const t = setInterval(
        () => setFIndex(i => (i + 1) % functionsImg.length),
        7000 // 2 sec
      );
      return () => clearInterval(t);
    }
  }, [functionsImg]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      const timer = setTimeout(() => {
        setShowLoginOverlay("login"); // 👈 show login overlay
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);
  const imgClass =
    "w-full h-56 object-cover transition-all duration-700 ease-in-out";

  useEffect(() => {
    const fetchServices = async () => {
      const res = await axios.get(`${serviceAPI}/all`);
      const activeServices = res.data.filter(s => s.isActive);
      setServices(activeServices);
    };

    fetchServices();
  }, []);


  return (
    <>
      <Header />

      <section
        id="events"
        className="relative w-screen py-28 px-8 text-center overflow-hidden
  bg-white-500"
      >
        <h2 className="text-6xl font-semibold text-pink-500 mb-12 tracking-wide">Our Events</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Birthday Events */}
          <div className="bg-pink-200 backdrop-blur-lg rounded-2xl shadow-2xl hover:scale-[1.03]">
            <img
              key={bIndex}
              src={`${IMAGE_BASE}/${birthdayImg[bIndex]?.image}`}
              className={`${imgClass} animate-slideFade`}
              alt="Birthday"
            />


            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Birthday Events</h3>
              <p className="text-gray-600 text-sm mb-6">
                Celebrate your special day with unforgettable decorations and vibrant moments.
              </p>
              <Link
                to="/birthday"
                onClick={() => {
                  localStorage.removeItem("birthdayId"); // optional: also clear old event if needed
                }}
                className="inline-block bg-indigo-900 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Book Your Event
              </Link>
            </div>
          </div>

          {/* Wedding Events */}
          <div className="bg-pink-200 backdrop-blur-lg rounded-2xl shadow-2xl hover:scale-[1.03]">
            <img
              key={wIndex}
              src={`${IMAGE_BASE}/${weddingImg[wIndex]?.image}`}
              className={`${imgClass} animate-slideFade`}
              alt="Wedding"
            />


            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Wedding Events</h3>
              <p className="text-gray-600 text-sm mb-6">
                Make your big day magical with elegant setups and creative planning.
              </p>
              <Link
                to="/wedding"
                className="inline-block bg-indigo-900 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Book Your Event
              </Link>
            </div>
          </div>

          {/* Other Functions */}
          <div className="bg-pink-200 backdrop-blur-lg rounded-2xl shadow-2xl hover:scale-[1.03]">
            <img
              key={fIndex}
              src={`${IMAGE_BASE}/${functionsImg[fIndex]?.image}`}
              className={`${imgClass} animate-slideFade`}
              alt="Functions"
            />



            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Other Functions</h3>
              <p className="text-gray-600 text-sm mb-6">
                From corporate parties to cultural gatherings — we bring creativity to every event.
              </p>
              <Link
                to="/functions"
                className="inline-block bg-indigo-900 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Book Your Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="relative w-screen py-28 px-8 text-center overflow-hidden bg-white"
      >
        <h2 className="text-6xl font-semibold text-pink-500 mb-12 tracking-wide">
          Our Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <div
              key={service._id}
              className="bg-pink-200 backdrop-blur-lg rounded-2xl shadow-2xl
               hover:scale-[1.03] transition"
            >
              <img
                src={`${Service_IMAGE_BASE}/${service.image}`}
                alt={service.title}
                className="w-full h-52 object-cover rounded-t-2xl"
              />

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 text-sm mb-6">
                  {service.desc}
                </p>

                <Link
                  to={service.link}
                  className="inline-block bg-indigo-900 text-white px-5 py-2
                 rounded-lg hover:bg-indigo-700 transition"
                >
                  {service.btn}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>






      <Banner />

      <Footer />
      {/* 🔹 Overlay Login Modal */}
      {showLoginOverlay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
          <div className="relative w-[90%] max-w-md">
            {showLoginOverlay === "login" && (
              <Login
                onClose={() => setShowLoginOverlay(null)}
                onSwitchToSignup={() => setShowLoginOverlay("signup")}
                onSwitchToForgot={() => setShowLoginOverlay("forgot")}
              />
            )}
            {showLoginOverlay === "signup" && (
              <Signup
                onClose={() => setShowLoginOverlay(null)}
                onSwitchToLogin={() => setShowLoginOverlay("login")}
              />
            )}
            {showLoginOverlay === "forgot" && (
              <ForgetPassword
                onClose={() => setShowLoginOverlay(null)}
                onSwitchToLogin={() => setShowLoginOverlay("login")}
              />
            )}
          </div>
        </div>
      )}

    </>
  );
}
