// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found for token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access only" });
  }
  next();
};
