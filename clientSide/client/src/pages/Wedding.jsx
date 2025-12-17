'use client';

import { useState } from 'react';
import Header from './common/Header';
import Footer from './common/Footer';
import Banner from './common/Banner';

export default function Wedding() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const availability = {
    "2025-12-15": { "10:00": "available", "13:00": "booked", "18:00": "pending" },
    "2025-12-16": { "09:00": "available", "12:00": "available", "17:00": "booked" },
    "2025-12-17": { "11:00": "pending", "15:00": "available", "19:00": "available" },
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '',
    venueType: '',
    venueSub: '',
    finalVenue: '',
    foodType: '',
    decoration: '',
    transport: '',
  });

  const [cost, setCost] = useState({
    venue: 0,
    food: 0,
    decoration: 0,
    transport: 0,
    total: 0,
  });

  const prices = {
    venue: { "Palace": 100000, "Resort": 150000, "Beachside": 180000, "Garden": 120000 },
    food: { "Veg": 40000, "NonVeg": 60000, "Mixed": 80000 },
    decoration: { "Traditional": 25000, "Royal": 60000, "Luxury": 100000 },
    transport: { "None": 0, "Cars": 10000, "LuxuryBus": 20000 },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (prices[name]) {
      const updatedCost = { ...cost, [name]: prices[name][value] || 0 };
      const total = updatedCost.venue + updatedCost.food + updatedCost.decoration + updatedCost.transport;
      setCost({ ...updatedCost, total });
    }
  };

  const handleChangeCheckbox = (e) => {
    const { name, value, checked } = e.target;
    const prev = formData[name] || [];
    if (checked) setFormData({ ...formData, [name]: [...prev, value] });
    else setFormData({ ...formData, [name]: prev.filter(v => v !== value) });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    alert('🎉 Wedding Booking Confirmed! Total Cost: ₹' + cost.total);
  };

  return (
    <>
      <Header />
      <Banner title="💍 Wedding Event Planner" />

      <section className="min-h-screen bg-gradient-to-r from-rose-100 to-pink-100 py-12 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">💒 Wedding Booking Wizard</h2>

          {/* Step 1 - Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-3" />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-3" />
              <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg p-3" />
              <input type="number" name="guests" placeholder="Number of Guests" value={formData.guests} onChange={handleChange} className="w-full border rounded-lg p-3" />
              <input type="text" name="specialRequests" placeholder="Special Requests (Optional)" value={formData.specialRequests || ''} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
          )}

          {/* Step 2 - Venue Selection */}
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
                  <option value="Palace">Palace Hall</option>
                  <option value="Banquet Hall">Banquet Hall</option>
                  <option value="Temple">Temple Hall</option>
                </select>
              )}

              {formData.venueType === "Outdoor" && (
                <select name="venueSub" value={formData.venueSub} onChange={handleChange} className="w-full border rounded-lg p-3">
                  <option value="">Select Outdoor Venue</option>
                  <option value="Garden">Garden</option>
                  <option value="Beachside">Beachside</option>
                  <option value="Farmhouse">Farmhouse</option>
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
                  <option value="Beach Resort">Beach Resort</option>
                  <option value="Hillside">Hillside Resort</option>
                </select>
              )}

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

          {/* Step 3 - Food Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <select name="foodType" value={formData.foodType} onChange={handleChange} className="w-full border rounded-lg p-3">
                <option value="">Select Cuisine</option>
                <option value="Veg">Pure Veg</option>
                <option value="NonVeg">Non-Veg</option>
                <option value="Mixed">Mixed Buffet</option>
              </select>

              {formData.foodType && (
                <div>
                  <p className="font-medium">Menu Selection:</p>

                  <p className="font-semibold mt-2">Starters:</p>
                  {["Paneer Tikka", "Chicken Tikka", "Veg Spring Roll", "Fish Fingers"].map(item => (
                    <label key={item} className="mr-4">
                      <input type="checkbox" name="starters" value={item} onChange={handleChangeCheckbox} className="mr-1" />
                      {item}
                    </label>
                  ))}

                  <p className="font-semibold mt-2">Main Course:</p>
                  {["Biryani", "Butter Chicken", "Paneer Curry", "Dal Fry", "Naan"].map(item => (
                    <label key={item} className="mr-4">
                      <input type="checkbox" name="mainCourse" value={item} onChange={handleChangeCheckbox} className="mr-1" />
                      {item}
                    </label>
                  ))}

                  <p className="font-semibold mt-2">Desserts & Ice Creams:</p>
                  {["Gulab Jamun", "Rasmalai", "Chocolate Cake", "Vanilla Ice Cream", "Mango Kulfi"].map(item => (
                    <label key={item} className="mr-4">
                      <input type="checkbox" name="desserts" value={item} onChange={handleChangeCheckbox} className="mr-1" />
                      {item}
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
              {["Traditional", "Royal", "Luxury"].map((style) => (
                <label key={style} className="block">
                  <input
                    type="radio"
                    name="decoration"
                    value={style}
                    checked={formData.decoration === style}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {style}
                </label>
              ))}
            </div>
          )}

          {/* Step 5 - Transport */}
          {step === 5 && (
            <select name="transport" value={formData.transport} onChange={handleChange} className="w-full border rounded-lg p-3">
              <option value="">Select Transport</option>
              <option value="None">No Transport</option>
              <option value="Cars">Wedding Cars</option>
              <option value="LuxuryBus">Luxury Buses</option>
            </select>
          )}

          {/* Step 6 - Summary */}
          {step === 6 && (
            <div className="space-y-3 text-gray-700">
              <p><strong>Venue:</strong> {formData.venueSub || 'Not Selected'} — ₹{cost.venue}</p>
              <p><strong>Food:</strong> {formData.foodType || 'Not Selected'} — ₹{cost.food}</p>
              <p><strong>Decoration:</strong> {formData.decoration || 'Not Selected'} — ₹{cost.decoration}</p>
              <p><strong>Transport:</strong> {formData.transport || 'Not Selected'} — ₹{cost.transport}</p>
              <hr className="border-gray-300" />
              <p className="text-xl font-bold text-pink-600">Total Cost: ₹{cost.total}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">Back</button>
            )}
            {step < 6 && (
              <button onClick={nextStep} className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">Next</button>
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
