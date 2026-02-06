"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./common/Header";
import Footer from "./common/Footer";
import Banner from "./common/Banner";

export default function EventHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchEvents = async () => {
    try {
      const userId = localStorage.getItem("userId")?.replace(/^"|"$/g, "");
      if (!userId) {
        alert("User not logged in");
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:4000/api/client/birthday/user/${userId}`
      );

      const fetchedEvents = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setEvents(fetchedEvents);
    } catch (err) {
      console.error("❌ Error fetching birthday events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [navigate]);

  const handlePayment = async (event) => {
    try {
      const amount = Math.round(Number(event.balanceAmount || 0) * 100) / 100;
      if (!amount || amount <= 0) {
        alert("Invalid balance amount");
        return;
      }

      const res = await axios.post(
        "http://localhost:4000/api/payment/create-order",
        { amount }
      );

      const { order, key } = res.data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Event Booking",
        description: "Remaining Payment",
        order_id: order.id,

        handler: async (response) => {
          const verifyRes = await axios.post(
            "http://localhost:4000/api/payment/verify",
            response
          );

          if (verifyRes.data.success) {
            await axios.put(
              `http://localhost:4000/api/client/birthday/update/${event._id}`,
              {
                paymentStatus: "Full Paid",
                bookingStatus: "Booked",
                balanceAmount: 0,
              }
            );

            await fetchEvents();
            alert("🎉 Payment successful!");
            navigate("/eventHistory?status=paid");
          } else {
            throw new Error("Verification failed");
          }
        },

        prefill: {
          name: "Adivappa Geetha Sree",
          email: "adivappageetha@gmail.com",
          contact: "9502554901",
        },
        theme: { color: "#00bfa5" },
      };

      const razor = new window.Razorpay(options);
      razor.open();

      razor.on("payment.failed", () => {
        alert("❌ Payment failed. Please try again.");
      });
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment initialization failed.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const st = params.get("status");
    if (st) setStatus(st);
  }, [location.search]);

  if (loading)
    return <p className="text-center mt-10">Loading event history...</p>;

  return (
    <>
      <Header />
      <Banner title="🎉 Your Event History" />

      <section className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-100 py-12 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          {status === "paid" && (
            <div className="bg-green-100 text-green-700 p-3 mb-6 text-center rounded-lg">
              ✅ Payment Successful — Your event is booked!
            </div>
          )}

          {events.length === 0 ? (
            <p className="text-center text-gray-600">
              No events found. Start planning your first event!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="border rounded-xl shadow-sm p-5 bg-white hover:shadow-md transition"
                >
                  <h2 className="text-xl font-semibold text-purple-700 mb-2">
                    {event.celebrantName || "Unnamed Event"}
                  </h2>

                  <p className="text-sm">📅 {event.eventDate || "Not set"}</p>
                  <p className="text-sm">
                    🏠 {event.venue?.name || "N/A"},{" "}
                    {event.venue?.city || ""}
                  </p>

                  <p className="text-sm mt-1">
                    💰 Total: ₹{event.budget?.totalBudget || 0}
                  </p>
                  <p className="text-sm">
                    💳 Advance: ₹{event.budget?.advancePayment || 0}
                  </p>
                  <p className="text-sm">
                    ⚖️ Balance: ₹{event.balanceAmount || 0}
                  </p>

                  <p
                    className={`text-sm font-medium mt-2 ${event.paymentStatus === "Full Paid"
                        ? "text-green-600"
                        : event.paymentStatus === "Advance Paid"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                  >
                    💵 {event.paymentStatus || "Pending"}
                  </p>

                  <p
                    className={`text-sm font-medium ${event.bookingStatus === "Booked"
                        ? "text-green-600"
                        : "text-gray-600"
                      }`}
                  >
                    📘 {event.bookingStatus || "Pending"}
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    {event.paymentStatus === "Pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            navigate(`/birthday/edit/${event._id}`)
                          }
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                "⚠️ Are you sure you want to delete this event?"
                              )
                            ) {
                              await fetch(
                                `http://localhost:4000/api/client/birthday/delete/${event._id}`,
                                { method: "DELETE" }
                              );
                              window.location.reload();
                            }
                          }}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}

                    {event.paymentStatus === "Advance Paid" && (
                      <button
                        onClick={() => handlePayment(event)}
                        className="bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                      >
                        💳 Pay Remaining
                      </button>
                    )}

                    {event.paymentStatus === "Full Paid" && (
                      <div className="bg-green-100 text-green-700 py-2 rounded-lg text-center font-medium">
                        💚 Thank you for choosing us!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
