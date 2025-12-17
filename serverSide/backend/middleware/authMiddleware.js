// import jwt from "jsonwebtoken";
// import Client from "../models/client/client-userModel.js";
// import Vendor from "../models/vendor/vendor-userModel.js";
// import Admin from "../models/server/admin-userModel.js";

// // Universal Auth
// export const isAuth = async (req, res, next) => {
//     try {
//         const header = req.headers.authorization;

//         if (!header?.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "No token, Unauthorized" });
//         }

//         const token = header.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         let user = null;

//         // detect user type
//         if (decoded.role === "client") {
//             user = await Client.findById(decoded.id).select("-password");
//         } else if (decoded.role === "vendor") {
//             user = await Vendor.findById(decoded.id).select("-password");
//         } else if (decoded.role === "admin") {
//             user = await Admin.findById(decoded.id).select("-password");
//         }

//         if (!user) return res.status(401).json({ message: "Invalid user" });

//         req.user = { id: user._id, role: decoded.role };
//         next();
//     } catch (err) {
//         return res.status(401).json({ message: "Authentication failed", error: err.message });
//     }
// };


// // Vendor Only
// export const isVendor = (req, res, next) => {
//     if (req.user?.role !== "vendor")
//         return res.status(403).json({ message: "Vendor access only" });
//     next();
// };

// // Admin Only
// export const isAdmin = (req, res, next) => {
//     if (req.user?.role !== "admin")
//         return res.status(403).json({ message: "Admin access only" });
//     next();
// };

// // Client Only
// export const isClient = (req, res, next) => {
//     if (req.user?.role !== "client")
//         return res.status(403).json({ message: "Client access only" });
//     next();
// };
