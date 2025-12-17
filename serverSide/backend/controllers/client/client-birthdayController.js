import mongoose from "mongoose";
import Birthday from "../../models/client/client-birthdayModel.js";

// ✅ Create new birthday record
export const createBirthday = async (req, res) => {
  try {
    let { userId, ...formData } = req.body;
    console.log(userId)

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    userId = userId.toString().replace(/['"]+/g, "").trim();
    console.log(userId)

    // 🧠 Ensure mongoose is imported (fixes your error)
    const birthday = new Birthday({
      userId,
      ...formData,
    });

    await birthday.save();
    console.log("✅ Birthday saved:", birthday._id)

    res.status(201).json({
      message: "🎉 Birthday event created successfully",
      birthday,
    });
  } catch (err) {
    console.error("❌ Error creating birthday:", err.message);
    res.status(500).json({ message: "Server error", error: err.message, details: err.errors || err, });
  }
};

export const getBirthdayByorderId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Birthday ID" });
    }

    const event = await Birthday.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Birthday not found" });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error("❌ Error fetching birthday by ID:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ✅ Get birthdays by user
export const getBirthdaysByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const birthdays = await Birthday.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(birthdays);
  } catch (err) {
    console.error("❌ Error fetching birthdays:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧠 Helper: Deep merge two objects (recursive)
function deepMerge(target, source) {
  for (const key in source) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ✅ Update step data (save partial progress)
// export const updateSteps = async (req, res) => {
//   try {
//     const { birthdayId, step, formData } = req.body;
//     console.log("📥 Received from frontend:", req.body);

//     if (!birthdayId) {
//       return res.status(400).json({ message: "Birthday ID is required" });
//     }

//     let cleanId = birthdayId.toString().replace(/['"]+/g, "").trim();
//     if (!mongoose.Types.ObjectId.isValid(cleanId)) {
//       return res.status(400).json({ message: "Invalid Birthday ID" });
//     }


//     const existing = await Birthday.findById(cleanId);
//     if (!existing) {
//       return res.status(404).json({ message: "Birthday not found" });
//     }

//     const cleanData = JSON.parse(JSON.stringify(formData || {})); // removes undefined
//     delete cleanData._id; // prevent Mongo _id overwrite
//     delete cleanData.__v;
//     console.log("🧾 Clean Data:", cleanData);

//     deepMerge(existing,cleanData);


//     existing.step = step;

//     const saved = await existing.save({ validateBeforeSave: false });
//     console.log("✅ Step data updated successfully:", saved._id);

//     res.status(200).json({
//       message: `✅ Step ${step} data updated successfully`,
//       birthday: saved,
//     });


//   } catch (err) {
//     console.error("❌ Error saving step:", err);
//     res.status(500).json({
//       message: "Server error while saving step",
//       error: err.message,
//       stack: err.stack,
//     });
//   }
// };

export const AdminUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    const updates = req.body; // frontend already sends perfect payload with calculated totals

    // 🔥 Directly update entire formData object safely
    // Mongoose will properly merge nested sections
    const updatedEvent = await Birthday.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });

  } catch (error) {
    console.error("ADMIN UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

export const updateSteps = async (req, res) => {
  try {
    const { birthdayId, step, formData } = req.body;
    console.log("📥 Received from frontend:", req.body);

    if (!birthdayId) return res.status(400).json({ message: "Birthday ID is required" });

    const cleanId = birthdayId.toString().replace(/['"]+/g, "").trim();
    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({ message: "Invalid Birthday ID" });
    }

    const existing = await Birthday.findById(cleanId);
    if (!existing) return res.status(404).json({ message: "Birthday not found" });

    const cleanData = JSON.parse(JSON.stringify(formData || {}));
    delete cleanData._id;
    delete cleanData.__v;

    // 🧩 Merge data safely
    deepMerge(existing, cleanData);

    // ✅ Handle payment logic — only override if new verified data is sent
    const budget = cleanData.budget || existing.budget;
    if (budget?.advancePayment && budget?.totalBudget) {
      const advance = parseFloat(budget.advancePayment) || 0;
      const total = parseFloat(budget.totalBudget) || 0;
      const balance = total - advance;

      // Only update payment fields if new data has valid (verified) info
      if (
        cleanData.paymentStatus === "Advance Paid" ||
        cleanData.paymentStatus === "Full Paid"
      ) {
        existing.paymentStatus = cleanData.paymentStatus;
        existing.bookingStatus = cleanData.bookingStatus || "Booked";
        existing.balanceAmount = cleanData.balanceAmount || 0;

        existing.budget = {
          ...existing.budget,
          totalBudget: total,
          advancePayment: advance,
          balancePayment: balance > 0 ? balance : 0,
        };
      } else {
        // Default when no payment done yet
        existing.paymentStatus =
          advance === 0
            ? "Pending"
            : advance < total
              ? "Advance Paid"
              : "Full Paid";

        existing.bookingStatus = advance > 0 ? "Booked" : "Not Booked";
        existing.balanceAmount = balance > 0 ? balance : 0;
      }
    }

    existing.step = step;
    const saved = await existing.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `✅ Step ${step} updated successfully`,
      birthday: saved,
    });
  } catch (err) {
    console.error("❌ Error saving step:", err);
    res.status(500).json({
      success: false,
      message: "Server error while saving step",
      error: err.message,
    });
  }
};


export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, bookingStatus, balanceAmount } = req.body;

    const event = await Birthday.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 🟢 Update only payment-related fields
    event.paymentStatus = paymentStatus || event.paymentStatus;
    event.bookingStatus = bookingStatus || event.bookingStatus;
    event.balanceAmount =
      balanceAmount !== undefined ? balanceAmount : event.balanceAmount;

    await event.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "✅ Payment status updated successfully",
      event,
    });
  } catch (err) {
    console.error("❌ Error updating payment:", err);
    res.status(500).json({
      message: "Server error while updating payment",
      error: err.message,
    });
  }
};




// DELETE EVENT BY PHONE
// ✅ Delete birthday event by ID
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const deleted = await Birthday.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "🗑️ Event deleted successfully", deleted });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Server error while deleting event", error: error.message });
  }
};

// ✅ Get all birthdays (admin)
export const getAllBirthdays = async (req, res) => {
  try {
    const birthdays = await Birthday.find().sort({ createdAt: -1 });
    res.status(200).json(birthdays);
  } catch (err) {
    console.error("❌ Error fetching all birthdays:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 FILTER: Pending, Ongoing, Completed Events
// export const getEventStatusSummary = async (req, res) => {
//   try {
//     const today = new Date().toISOString().split("T")[0];

//     const allEvents = await Birthday.find();

//     const pending = [];
//     const ongoing = [];
//     const completed = [];

//     allEvents.forEach(event => {
//       const eventDate = event.eventDate || event.timings?.date;
//       if (!eventDate) return;

//       if (event.paymentStatus === "Pending" || event.bookingStatus === "Not Booked") {
//         pending.push(event);
//       } 
//       else if (eventDate === today && event.bookingStatus === "Booked") {
//         ongoing.push(event);
//       } 
//       else if (eventDate < today || event.paymentStatus === "Full Paid") {
//         completed.push(event);
//       }
//     });

//     res.status(200).json({
//       success: true,
//       pending,
//       ongoing,
//       completed,
//     });

//   } catch (error) {
//     console.error("❌ Error fetching event summary:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// 📌 FILTER → Pending, Ongoing, Completed Events
export const getEventStatusSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const allEvents = await Birthday.find();

    const pending = [];
    const ongoing = [];
    const completed = [];

    allEvents.forEach(event => {
      const eventDate = event.eventDate || event.timings?.date;

      if (!eventDate) return;

      // Convert both dates to Year-Month-Day format
      const formattedEventDate = new Date(eventDate).toISOString().split("T")[0];

      // ---------------------------
      //   LOGIC CLASSIFICATION
      // ---------------------------

      // 1️⃣ Pending Events — No advance / not booked
      if (
        event.paymentStatus === "Pending" ||
        event.bookingStatus === "Pending"
      ) {
        pending.push(event);
        return;
      }

      // 2️⃣ Ongoing Events — Event happening today
      if (
        formattedEventDate === today &&
        event.bookingStatus === "Booked"
      ) {
        ongoing.push(event);
        return;
      }

      // 3️⃣ Completed Events — Past date OR fully paid
      if (
        formattedEventDate < today ||
        event.paymentStatus === "Full Paid"
      ) {
        completed.push(event);
        return;
      }
    });

    res.status(200).json({
      success: true,
      counts: {
        pending: pending.length,
        ongoing: ongoing.length,
        completed: completed.length,
      },
      pending,
      ongoing,
      completed,
    });

  } catch (error) {
    console.error("❌ Error filtering event status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching event status",
      error: error.message,
    });
  }
};






