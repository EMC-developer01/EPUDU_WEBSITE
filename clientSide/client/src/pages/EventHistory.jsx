import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./common/Header";

export default function EventHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  // ✅ Fetch all user events from backend
  // Define fetchEvents at the component level
  const fetchEvents = async () => {
    try {
      const userId = localStorage.getItem("userId")?.replace(/^"|"$/g, "");
      if (!userId) {
        alert("User not logged in");
        navigate("/login");
        return;
      }

      const res = await axios.get(`http://localhost:4000/api/client/birthday/user/${userId}`);
      const fetchedEvents = Array.isArray(res.data) ? res.data : res.data.data || [];
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("❌ Error fetching birthday events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Then call it inside useEffect to load events initially
  useEffect(() => {
    fetchEvents();
  }, [navigate]);

  const handlePayment = async (event) => {
    try {
      // ✅ Ensure valid amount and round correctly
      const amount = Math.round(Number(event.balanceAmount || 0) * 100) / 100;
      if (!amount || amount <= 0) {
        alert("Invalid balance amount");
        return;
      }

      console.log("✅ Razorpay Key:", "rzp_test_Rb8gbnMxo2Ogt7");
      console.log("💰 Amount to Pay:", amount);

      // ✅ Create Razorpay order
      const res = await axios.post("http://localhost:4000/api/payment/create-order", { amount });
      const { order, key } = res.data;
      console.log("🧾 Order created:", order);

      // ✅ Setup Razorpay options
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Event Booking",
        description: "Remaining Payment",
        order_id: order.id,

        handler: async function (response) {
          try {
            // verify payment
            const verifyRes = await axios.post("http://localhost:4000/api/payment/verify", response);

            if (verifyRes.data.success) {
              console.log("✅ Payment verified on backend");

              // update backend
              await axios.put(`http://localhost:4000/api/client/birthday/update/${event._id}`, {
                paymentStatus: "Full Paid",
                bookingStatus: "Booked",
                balanceAmount: 0,
              });

              // refresh events
              await fetchEvents();

              alert("🎉 Payment successful!");
              navigate("/eventHistory?status=paid");
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            alert("❌ Payment verification failed.");
            navigate("/eventHistory?status=failed");
          }
        },
        prefill: {
          name: "Adivappa Geetha Sree",
          email: "adivappageetha@gmail.com",
          contact: "9502554901",
        },
        theme: { color: "#00bfa5" },
      };

      // ✅ Open Razorpay checkout safely
      const razor = new window.Razorpay(options);
      razor.open();

      // ❌ Handle Razorpay failure
      razor.on("payment.failed", (response) => {
        console.error("❌ Razorpay Failure:", response.error);
        alert("❌ Payment failed. Please try again.");
      });
    } catch (err) {
      console.error("💥 Payment initialization error:", err);
      alert("Payment initialization failed.");
    }
  };


  // ✅ Extract payment status from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const st = params.get("status");
    if (st) setStatus(st);
  }, [location.search]);


  // re-fetch to get latest status


  if (loading) return <p className="text-center mt-10">Loading event history...</p>;

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">
          🎉 Your Event History
        </h1>

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
                className="border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200 bg-white"
              >
                <h2 className="text-xl font-semibold mb-2 text-teal-700">
                  {event.celebrantName || "Unnamed Event"}
                </h2>

                <p className="text-sm text-gray-600 mb-1">
                  📅 <b>Date:</b> {event.eventDate || "Not set"}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  🏠 <b>Venue:</b> {event.venue?.name || "N/A"},{" "}
                  {event.venue?.city || ""}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  💰 <b>Total Budget:</b> ₹{event.budget?.totalBudget || "0"}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  💳 <b>Advance Paid:</b> ₹{event.budget?.advancePayment || "0"}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  ⚖️ <b>Balance Amount:</b> ₹{event.balanceAmount || "0"}
                </p>

                <p
                  className={`text-sm font-medium mt-2 ${event.paymentStatus === "Advance Paid"
                    ? "text-yellow-600"
                    : event.paymentStatus === "Full Paid"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  💵 Payment Status: {event.paymentStatus || "Pending"}
                </p>

                <p
                  className={`text-sm font-medium ${event.bookingStatus === "Booked"
                    ? "text-green-600"
                    : "text-gray-600"
                    }`}
                >
                  📘 Booking Status: {event.bookingStatus || "Pending"}
                </p>

                {/* ✅ Conditional Buttons */}
                <div className="mt-4 flex flex-col gap-2">
                  {event.paymentStatus === "Pending" && (
                    <div className="flex gap-3">
                      {/* ✏️ Edit Event */}
                      <button
                        onClick={() => navigate(`/birthday/edit/${event._id}`)}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                      >
                        ✏️ Edit Event
                      </button>

                      {/* 🗑️ Delete Event */}
                      <button
                        onClick={async () => {
                          if (window.confirm("⚠️ Are you sure you want to delete this event?")) {
                            try {
                              const res = await fetch(`http://localhost:4000/api/client/birthday/delete/${event._id}`, {
                                method: "DELETE",
                              });

                              const data = await res.json();
                              if (res.ok) {
                                alert("🗑️ Event deleted successfully!");
                                window.location.reload(); // refresh list after delete
                              } else {
                                alert(`❌ ${data.message || "Failed to delete event"}`);
                              }
                            } catch (err) {
                              console.error("Error deleting event:", err);
                              alert("⚠️ Server error while deleting event");
                            }
                          }
                        }}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                      >
                        🗑️ Delete Event
                      </button>
                    </div>
                  )}
                  {event.paymentStatus === "Advance Paid" && (
                    <button
                      onClick={() => handlePayment(event)}
                      className="bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                      💳 Pay Remaining Balance
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
    </>
  );
}
