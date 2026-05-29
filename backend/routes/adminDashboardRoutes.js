// routes/adminDashboardRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
  getDashboardStats,
  getDashboardLeaveStats,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/stats", getDashboardStats);
router.get("/leave-stats", getDashboardLeaveStats);

export default router;