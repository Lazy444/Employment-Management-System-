// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // ✅ use bcryptjs (same as in your seeder)
import User from "../models/User.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ basic validation
    if (!email||!password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // ✅ find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User Not Found",
      });
    }

    // ✅ check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Wrong Password",
      });
    }

    // ✅ create JWT
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_KEY, // make sure JWT_KEY exists in .env
      { expiresIn: "10d" }
    );

    // ✅ send response
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Server Error",
    });
  }
};

export { login };