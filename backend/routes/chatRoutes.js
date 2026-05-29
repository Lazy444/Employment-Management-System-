import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" }).select("_id name email");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;