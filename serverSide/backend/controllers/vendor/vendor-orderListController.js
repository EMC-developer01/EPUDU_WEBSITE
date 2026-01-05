import mongoose from "mongoose";
import Birthday from "../../models/client/client-birthdayModel.js";
import VendorOrderList from "../../models/vendor/vendor-orderListModel.js";
import VendorNotification from "../../models/vendor/vendor-notificationModel.js";
import vendorUsers from "../../models/vendor/vendor-userModel.js";
import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";
// dotenv.config();

// EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASS,
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.log(process.env.EMAIL, process.env.EMAIL_APP_PASS)
    console.error("❌ Email transporter verification failed:", err.message);
  } else {
    console.log("✅ Email transporter verified successfully!");
  }
});

// SEND EMAIL
// async function sendVendorOrderEmails(to, subject, text) {
//   try {
//     await transporter.sendMail({
//       from: `"EPUDU Event Management Team "`,
//       to ,
//       subject,
//       text,
//     });
//   } catch (err) {
//     console.error("❌ Email Error:", err.message);
//   }
// }
// Robust email sender
async function sendVendorOrderEmails(to, subject, text) {
  if (!to) {
    console.log("❌ No email provided, skipping...");
    return { success: false, to, error: "No email provided" };
  }

  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      const info = await transporter.sendMail({
        from: `"EPUDU Event Management Team" <${process.env.EMAIL}>`,
        to,
        subject,
        text,
      });

      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return { success: true, to, messageId: info.messageId };
    }
    catch (err) {
      attempts++;
      console.log(`⚠️ Attempt ${attempts} failed for ${to}: ${err.message}`);

      // If last attempt, log failure
      if (attempts === maxRetries) {
        console.log(`❌ Email failed for ${to} after ${maxRetries} attempts.`);
        return { success: false, to, error: err.message };
      }

      // Wait 1 second before retrying
      await new Promise(res => setTimeout(res, 1000));
      console.log(`[${new Date().toISOString()}] ⚠️ Attempt ${attempts} failed for ${to}: ${err.message}`);

    }
  }
}


/**
 * Helper function to sync birthdays → VendorOrderList
 * Idempotent — no duplicates due to composite key + bulkWrite
 */
// HELPER FUNCTION TO BUILD EMAIL MESSAGE

function buildMessage(vendorName, items) {
  let message = `New Event Assignment\n\nVendor: ${vendorName}\n\nItems Assigned:\n------------------------------------`;
  items.forEach((item, index) => {
    message += `
${index + 1}. ${item.itemName}
   Category: ${item.category} / ${item.subcategory}
   Event: ${item.eventType}
   Celebrant: ${item.celebrantName}
   Date: ${item.eventDate}
   Price: ₹${item.price}
`;
  });
  message += `
------------------------------------
Total Items: ${items.length}

Please login to your Vendor Dashboard for full details.
`;
  return message;
}

export const syncBirthdaysHelper = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/client/birthday/all");
    const birthdays = response.data;
    if (!birthdays || birthdays.length === 0) return;

    const sections = [
      "decoration",
      "foodArrangements",
      "entertainment",
      "photography",
      "returnGifts",
      "eventStaff"
    ];

    // For summary
    const emailSummary = [];

    for (const birthday of birthdays) {
      if (birthday.bookingStatus !== "Booked") continue;

      const existing = await VendorOrderList.exists({ birthdayId: birthday._id });
      if (existing) continue;

      const bulkOps = [];
      const newVendorOrders = [];

      // 1️⃣ Collect items into VendorOrderList
      for (const section of sections) {
        const categories = birthday[section] || {};

        for (const subcategory in categories) {
          const items = categories[subcategory];

          for (const item of items) {
            const data = {
              birthdayId: birthday._id,
              itemId: item._id,
              vendorId: item.vendorId,
              category: section,
              subcategory,
              clientId: birthday.userId,
              celebrantName: birthday.celebrantName,
              eventType: birthday.eventType,
              phone: birthday.phone,
              email: birthday.email,
              eventDate: birthday.eventDate,
              eventTime: birthday.eventTime,
              guestCount: birthday.guestCount,
              venueName: birthday.venueName,
              venueAddress: birthday.venueAddress,
              venueCity: birthday.venueCity,
              itemName: item.name,
              price: item.price || 0
            };
            console.log(data);

            bulkOps.push({
              updateOne: {
                filter: {
                  birthdayId: birthday._id,
                  itemId: item._id,
                  vendorId: item.vendorId,
                  category: section,
                  subcategory,
                },
                update: { $set: data },
                upsert: true,
              }
            });

            newVendorOrders.push(data);
            console.log(newVendorOrders);
          }
        }
      }

      await VendorOrderList.bulkWrite(bulkOps);

      // 2️⃣ Group items by vendor
      const savedOrders = await VendorOrderList.find({ birthdayId: birthday._id });
      const vendorGroups = {};

      for (const order of savedOrders) {
        if (!order.vendorId) continue;
        if (!vendorGroups[order.vendorId]) vendorGroups[order.vendorId] = [];
        vendorGroups[order.vendorId].push(order);
      }

      // 3️⃣ Send emails & create notifications
      // 3️⃣ SEND EMAIL + NOTIFICATION TO EACH VENDOR
      for (const vendorId of Object.keys(vendorGroups)) {
        const vendor = await vendorUsers.findById(vendorId);
        if (!vendor) {
          console.log(`❌ Vendor not found for ID: ${vendorId}`);
          continue;
        }

        const items = vendorGroups[vendorId];
        if (!items || items.length === 0) {
          console.log(`❌ No items for vendor: ${vendorId}`);
          continue;
        }

        const message = buildMessage(vendor.name, items);
        const orderIds = items.map(item => item._id).filter(Boolean);

        if (orderIds.length === 0) {
          console.log(`❌ No valid order IDs for vendor: ${vendorId}`);
          continue;
        }

        // Create Vendor Notification
        await VendorNotification.create({
          vendorId,
          orderCount: items.length,
          orderId: orderIds.join(","),
          message,
        });

        // ✅ Prepare vendor email safely
        const vendorEmail = vendor.mail?.trim(); // Trim spaces
        if (!vendorEmail || !vendorEmail.includes("@")) {
          console.log(`❌ Invalid email for vendor ${vendorId}: "${vendor.mail}"`);
          continue;
        }

        // Send Email
        try {
          const result = await sendVendorOrderEmails(
            vendorEmail,
            "New Event Assigned – Multiple Items",
            message
          );

          if (!result.success) {
            console.log(`⚠️ Could not send email to ${vendorEmail}:`, result.error);
          }
        } catch (err) {
          console.log(`❌ Unexpected error sending email to ${vendorEmail}:`, err.message);
        }
      }
      console.log("✅ Synced Birthday:", birthday._id);
    }

    // 4️⃣ Summary
    console.table(emailSummary);

    console.log("✅ All birthday sync complete!");
  } catch (error) {
    console.error("❌ Sync Error:", error.message);
  }
};



/**
 * Manual POST route — call this to sync now
 */
export const syncVendorOrdersFromBirthdays = async (req, res) => {
  try {
    await syncBirthdaysHelper();
    res.json({ message: "All birthdays sync completed!" });
  } catch (err) {
    console.error("Error in manual sync:", err.message);
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
};

/**
 * Optional: Auto-sync every X seconds — call startAutoSync() on server start
 */

export const startAutoSync = (intervalMs = 30000) => {
  setInterval(() => {
    syncBirthdaysHelper();
  }, intervalMs);
};

/**
 * GET VENDOR ORDERS (FILTERS SUPPORTED)
 */

export const getVendorOrders = async (req, res) => {
  try {
    const { clientId, category, subcategory, itemName, eventDate, eventTime, itemId, vendorId, status, paymentStatus, birthdayId, search = "" } = req.query;
    const filter = {};

    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      filter.vendorId = vendorId;
    }
    if (clientId) filter.clientId = clientId;
    if (itemId && mongoose.Types.ObjectId.isValid(itemId)) filter.itemId = itemId;
    if (status) filter.status = status;
    if (eventDate) filter.eventDate = eventDate;
    // if (eventDate) {
    //   const start = new Date(eventDate);
    //   const end = new Date(eventDate);
    //   end.setHours(23, 59, 59, 999);
    //   filter.eventDate = { $gte: start, $lte: end };
    // }

    if (eventTime) filter.eventTime = eventTime;
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (itemName ) filter.itemName = itemName;
    if (paymentStatus ) filter.paymentStatus = paymentStatus;
    if (birthdayId && mongoose.Types.ObjectId.isValid(birthdayId)) filter.birthdayId = birthdayId;

    if (search.trim()) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { itemName: { $regex: search, $options: "i" } },
            { celebrantName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { eventDate: { $regex: search, $options: "i" } },
            { eventTime: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      VendorOrderList.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VendorOrderList.countDocuments(filter),
    ]);

    res.json({ total, data: orders });


    // const orders = await VendorOrderList.find(filter).sort({ createdAt: -1 });
    // res.json({ total: orders.length, data: orders });
  } catch (err) {
    console.error("getVendorOrders err:", err);
    res.status(500).json({ message: "Failed to get vendor orders", error: err.message });
  }
};

/**
 * UPDATE ORDER STATUS (Vendor or Admin)
 */

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId))
      return res.status(400).json({ message: "Invalid orderId" });

    const allowed = ["Pending", "Completed", "CancelledByVendor", "CancelledByClient"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await VendorOrderList.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;

    /** 🔥 If order cancelled — auto-cancel payment too */
    if (status === "CancelledByVendor" || status === "CancelledByClient") {
      order.paymentStatus = "Cancelled";
      order.cancelledAt = new Date();
    }

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

/**
 * UPDATE PAYMENT STATUS (Admin)
 */

export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ message: "Invalid orderId" });

    const allowedPayments = ["Pending", "Completed", "Cancelled", "Advance Paid", "Full Paid"];
    if (!allowedPayments.includes(paymentStatus)) return res.status(400).json({ message: "Invalid payment status" });

    const order = await VendorOrderList.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = paymentStatus;
    await order.save();
    res.json({ message: "Payment status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment status", error: err.message });
  }
};