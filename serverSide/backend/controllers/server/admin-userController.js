// backend/controllers/server/admin-userController.js
// import { adminUsers } from "../../models/Server/admin-userModel.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET; // change for production

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Hardcoded admin credentials
        const admins = [
            { email: "md@gmail.com", password: "Md@414425" },
            { email: "manager@gmail.com", password: "Manager@414425" },
        ];

        const admin = admins.find(
            (a) => a.email === email && a.password === password
        );

        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { email: admin.email },
             process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful",token, admin });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};
