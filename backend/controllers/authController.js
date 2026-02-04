import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // 2) Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User Not Found",
      });
    }

    // 3) Compare hashed password (stored in user.password)
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        error: "Wrong Password",
      });
    }

    // 4) JWT secret check
    if (!process.env.JWT_KEY) {
      return res.status(500).json({
        success: false,
        error: "JWT_KEY missing in .env",
      });
    }

    // 5) Create token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "10d" }
    );

    // 6) Return user + token
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ "admin" | "employee"
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server Error",
    });
  }
};
