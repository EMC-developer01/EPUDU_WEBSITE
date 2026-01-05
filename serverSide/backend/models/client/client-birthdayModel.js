import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  id: { type: String, },
  name: { type: String, },
  vendorId: { type: String, },
  price: { type: Number, default: 0 }
});


const birthdaySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Step 1: Basic Details
    celebrantName: String,
    age: String,
    gender: String,
    phone: String,
    email: String,
    eventDate: String,
    themePreference: String,
    eventType: {
      type: String,
      default: "Birthday",
    },
    // Step 2: Venue Details
    venue: {
      name: String,
      address: String,
      city: String,
    },

    // Step 3: Timings & Capacity
    timings: {
      time: String,
      date: String,
      capacity: String,
    },

    // Step 4: Decoration
    decoration: {
      themeScheme: String,
      stageDesign: [itemSchema],
      entranceDecor: [itemSchema],
      photoBoothDesign: [itemSchema],
      tableDecor: [itemSchema],
      cakeSetup: [itemSchema],
      lighting: [itemSchema],
    },

    // Step 5: Catering
    foodArrangements: {
      mealType: { type: String, default: "" },
      mealTime: { type: String, default: "" },
      cuisine: { type: String, default: "" },

      welcomeDrinks: { type: [itemSchema], default: [] },
      welcomeDrinksOther: { type: String, default: "" },
      welcome_drinks: { type: [itemSchema], default: [] },

      starters: { type: [itemSchema], default: [] },
      startersOther: { type: String, default: "" },

      desserts: { type: [itemSchema], default: [] },
      dessertsOther: { type: String, default: "" },

      snacks: { type: [itemSchema], default: [] },
      snacksOther: { type: String, default: "" },

      beverages: { type: [itemSchema], default: [] },
      beveragesOther: { type: String, default: "" },

      fruits: { type: [itemSchema], default: [] },
      fruitsOther: { type: String, default: "" },

      mainCourse: { type: [itemSchema], default: [] },
      mainCourseOther: { type: String, default: "" },
      main_course: { type: [itemSchema], default: [] },

      seating: { type: [itemSchema], default: [] },
      seatingOther: { type: String, default: "" },

      cutleryTeam: { type: String, default: "" },
      cutleryTeamOther: { type: String, default: "" },

    },

    // Step 6: Entertainment
    entertainment: {
      CartoonCharacter: { type: [itemSchema], default: [] },
      CartoonCharacterOther: { type: String, default: "" },
      Dance: { type: [itemSchema], default: [] },
      DanceOther: { type: String, default: "" },
      LivePerformance: { type: [itemSchema], default: [] },
      LivePerformanceOther: { type: String, default: "" },
      MagicShow: { type: [itemSchema], default: [] },
      MagicShowOther: { type: String, default: "" },
      Music_DJ_SoundSystem: { type: [itemSchema], default: [] },
      Music_DJ_SoundSystemOther: { type: String, default: "" },
      PuppetShow: { type: [itemSchema], default: [] },
      PuppetShowOther: { type: String, default: "" },
      activities: { type: [itemSchema], default: [] },
      activitiesSelected: { type: [itemSchema], default: [] },
      activitiesOther: { type: String, default: "" },
      emceeRequired: { type: String, enum: ["Yes", "No"], default: "" },
      emceeDetails: { type: String, default: "" },
    },

    // Step 7: Photography
    photography: {
      photoTeam: String,
      photoTeamDetails: String,
      packageType: [itemSchema],
      packageTypeOther: String,
      instantPhoto: String,
      instantPhotoOther: String,
    },

    // Step 8: Return Gifts
    returnGifts: {
      quantity: String,
      budget: String,
      giftType: String,
      giftTypeOther: String,
      notes: String,
    },

    // Step 9: Event Staff
    eventStaff: {
      foodServers: String,
      welcomeStaff: String,
      maintenanceTeam: String,
      otherRoles: String,
      staffNotes: String,
    },


    // Step 10: Budget


    budget: {
      originalCost: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      cgstAmount: { type: Number, default: 0 },
      totalBudget: { type: Number, default: 0 },
      advancePayment: { type: Number, default: 0 },
      balancePayment: { type: Number, default: 0 },
      aidAmount: { type: Number, default: 0 },
    },

    paymentStatus: { type: String, enum: ["Pending", "Advance Paid", "Full Paid"], default: "Pending" },
    bookingStatus: { type: String, enum: ["Pending", "Booked"], default: "Pending" },
    balanceAmount: { type: Number, default: 0 },

    // Optionally store paymentReceipt object
    paymentReceipt: {
      razorpay_payment_id: String,
      razorpay_order_id: String,
      razorpay_signature: String,
      verifiedAt: Date,
    },


    // Step 11: Notes
    notes: String,

    // Track current step
    step: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Birthday = mongoose.model("Birthday", birthdaySchema);
export default Birthday;
