'use client';

import { useState } from 'react';
import Header from './common/Header';
import Footer from './common/Footer';
import Banner from './common/Banner';

export default function Functions() {
  const API_URL = import.meta.env.VITE_API_URL;
  const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const availability = {
    "2025-11-20": { "10:00": "available", "13:00": "booked", "18:00": "pending" },
    "2025-11-21": { "09:00": "available", "12:00": "available", "17:00": "booked" },
    "2025-11-22": { "11:00": "pending", "15:00": "available", "19:00": "available" },
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    functionType: '',
    guests: '',
    venueType: '',
    venueSub: '',
    foodType: '',
    decoration: '',
    extras: [],
  });

  const [cost, setCost] = useState({
    venue: 0,
    food: 0,
    decoration: 0,
    extras: 0,
    total: 0,
  });

  const prices = {
    venue: { "Banquet Hall": 40000, "Garden": 50000, "Beachside": 70000, "Resort": 90000 },
    food: { "Veg": 30000, "NonVeg": 50000, "Mixed": 70000 },
    decoration: { "Simple": 15000, "Theme": 35000, "Luxury": 60000 },
    extras: { "Music Band": 10000, "DJ Night": 15000, "Photography": 20000, "Anchoring": 8000 },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (prices[name]) {
      const updatedCost = { ...cost, [name]: prices[name][value] || 0 };
      const total = updatedCost.venue + updatedCost.food + updatedCost.decoration + updatedCost.extras;
      setCost({ ...updatedCost, total });
    }
  };

  const handleCheckbox = (e) => {
    const { name, value, checked } = e.target;
    const prev = formData[name] || [];
    let updated = checked ? [...prev, value] : prev.filter((v) => v !== value);
    setFormData({ ...formData, [name]: updated });

    if (name === "extras") {
      let extrasCost = updated.reduce((sum, item) => sum + (prices.extras[item] || 0), 0);
      const total = cost.venue + cost.food + cost.decoration + extrasCost;
      setCost({ ...cost, extras: extrasCost, total });
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    alert(`🎉 ${formData.functionType} Function Booked! Total Cost: ₹${cost.total}`);
  };

  return (
    <>
      <Header />
      <Banner title="🎊 Functions Planner" />

      <section className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-purple-600 mb-6 text-center">🎈 Function Booking Wizard</h2>

          {/* Step 1 - Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-3" />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-3" />
              <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg p-3" />
              <select name="functionType" value={formData.functionType} onChange={handleChange} className="w-full border rounded-lg p-3">
                <option value="">Select Function Type</option>
                <option value="Birthday">🎂 Birthday Party</option>
                <option value="Corporate">💼 Corporate Event</option>
                <option value="Engagement">💍 Engagement</option>
                <option value="BabyShower">🕊️ Baby Shower</option>
                <option value="Graduation">🎓 Graduation</option>
                <option value="Anniversary">💖 Anniversary</option>
              </select>
              <input type="number" name="guests" placeholder="Number of Guests" value={formData.guests} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
          )}

          {/* Step 2 - Venue */}
          {step === 2 && (
            <div className="space-y-4">
              <select name="venueType" value={formData.venueType} onChange={handleChange} className="w-full border rounded-lg p-3">
                <option value="">Select Venue Type</option>
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort</option>
              </select>

              {formData.venueType === "Indoor" && (
                <select name="venueSub" value={formData.venueSub} onChange={handleChange} className="w-full border rounded-lg p-3">
                  <option value="">Select Indoor Venue</option>
                  <option value="Banquet Hall">Banquet Hall</option>
                  <option value="Community Hall">Community Hall</option>
                  <option value="Home">Home / Apartment</option>
                </select>
              )}

              {formData.venueType === "Outdoor" && (
                <select name="venueSub" value={formData.venueSub} onChange={handleChange} className="w-full border rounded-lg p-3">
                  <option value="">Select Outdoor Venue</option>
                  <option value="Garden">Garden</option>
                  <option value="Beachside">Beachside</option>
                  <option value="City Outskirts">City Outskirts</option>
                </select>
              )}

              {formData.venueType === "Hotel" && (
                <select name="venueSub" value={formData.venueSub} onChange={handleChange} className="w-full border rounded-lg p-3">
                  <option value="">Select Hotel Type</option>
                  <option value="5 Star">5 Star</option>
                  <option value="4 Star">4 Star</option>
                  <option value="3 Star">3 Star</option>
                </select>
              )}

              {formData.venueType === "Resort" && (
                <select name="venueSub" value={formData.venueSub} onChange={handleChange} className="w-full border rounded-lg p-3">
                  <option value="">Select Resort Type</option>
                  <option value="Luxury">Luxury Resort</option>
                  <option value="Eco Resort">Eco Resort</option>
                </select>
              )}

              {/* Calendar for date/time selection */}
              {formData.venueSub && (
                <>
                  <p className="font-medium mt-2">Select Date:</p>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.keys(availability).map((date) => {
                      const isAvailable = Object.values(availability[date]).includes("available");
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          key={date}
                          onClick={() => isAvailable && setSelectedDate(date)}
                          className={`p-2 rounded-md text-white ${
                            isSelected ? 'bg-yellow-400' : isAvailable ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        >
                          {date.split('-')[2]}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <>
                      <p className="font-medium mt-4">Select Time:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(availability[selectedDate]).map(([time, status]) => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              onClick={() => status === "available" && setSelectedTime(time)}
                              className={`p-2 rounded-md text-white ${
                                isSelected ? 'bg-yellow-400' : status === "available"
                                  ? 'bg-green-500'
                                  : status === "booked"
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3 - Food */}
          {step === 3 && (
            <div className="space-y-4">
              <select name="foodType" value={formData.foodType} onChange={handleChange} className="w-full border rounded-lg p-3">
                <option value="">Select Food Type</option>
                <option value="Veg">Veg</option>
                <option value="NonVeg">NonVeg</option>
                <option value="Mixed">Mixed</option>
              </select>

              {formData.foodType && (
                <div>
                  <p className="font-semibold mt-2">Starters:</p>
                  {["Paneer Tikka", "Veg Manchuria", "Chicken 65", "Fish Fingers"].map(item => (
                    <label key={item} className="mr-4">
                      <input type="checkbox" name="starters" value={item} onChange={handleCheckbox} className="mr-1" />{item}
                    </label>
                  ))}

                  <p className="font-semibold mt-2">Main Course:</p>
                  {["Biryani", "Fried Rice", "Paneer Curry", "Dal Tadka", "Butter Chicken"].map(item => (
                    <label key={item} className="mr-4">
                      <input type="checkbox" name="mainCourse" value={item} onChange={handleCheckbox} className="mr-1" />{item}
                    </label>
                  ))}

                  <p className="font-semibold mt-2">Desserts:</p>
                  {["Gulab Jamun", "Rasmalai", "Brownie", "Ice Cream"].map(item => (
                    <label key={item} className="mr-4">
                      <input type="checkbox" name="desserts" value={item} onChange={handleCheckbox} className="mr-1" />{item}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4 - Decoration */}
          {step === 4 && (
            <div className="space-y-2">
              <p className="font-medium">Select Decoration Style:</p>
              {["Simple", "Theme", "Luxury"].map((style) => (
                <label key={style} className="block">
                  <input type="radio" name="decoration" value={style} checked={formData.decoration === style} onChange={handleChange} className="mr-2" />
                  {style}
                </label>
              ))}
            </div>
          )}

          {/* Step 5 - Extras */}
          {step === 5 && (
            <div className="space-y-3">
              <p className="font-medium">Select Extra Services:</p>
              {Object.keys(prices.extras).map((extra) => (
                <label key={extra} className="block">
                  <input type="checkbox" name="extras" value={extra} onChange={handleCheckbox} className="mr-2" />
                  {extra} — ₹{prices.extras[extra]}
                </label>
              ))}
            </div>
          )}

          {/* Step 6 - Summary */}
          {step === 6 && (
            <div className="space-y-3 text-gray-700">
              <p><strong>Function:</strong> {formData.functionType}</p>
              <p><strong>Venue:</strong> {formData.venueSub} — ₹{cost.venue}</p>
              <p><strong>Food:</strong> {formData.foodType} — ₹{cost.food}</p>
              <p><strong>Decoration:</strong> {formData.decoration} — ₹{cost.decoration}</p>
              <p><strong>Extras:</strong> {formData.extras.join(', ') || 'None'} — ₹{cost.extras}</p>
              <hr className="border-gray-300" />
              <p className="text-xl font-bold text-purple-600">Total Cost: ₹{cost.total}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">Back</button>
            )}
            {step < 6 && (
              <button onClick={nextStep} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Next</button>
            )}
            {step === 6 && (
              <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Proceed to Payment
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
