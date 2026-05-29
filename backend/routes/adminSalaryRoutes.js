import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

import {
  getSalarySummary,
  getSalaryEmployees,
  markSalaryPaid,
} from "../controllers/adminSalaryController.js";

const router = express.Router();

// 📊 Get overall salary stats (monthly)
router.get("/summary", protect, adminOnly, getSalarySummary);

// 👥 Get all employees salary list
router.get("/employees", protect, adminOnly, getSalaryEmployees);

// 💰 Mark salary as paid
router.post("/mark-paid", protect, adminOnly, markSalaryPaid);

export default router;