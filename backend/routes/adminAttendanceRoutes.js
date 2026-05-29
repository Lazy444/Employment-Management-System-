import express from "express";
import {
  getTodayPresence,
  adminUpsertTodayAttendance,
  adminUpdateAttendanceTimes,
} from "../controllers/adminAttendanceController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, adminOnly, getTodayPresence);
router.post("/today/upsert", protect, adminOnly, adminUpsertTodayAttendance);
router.patch("/:attendanceId", protect, adminOnly, adminUpdateAttendanceTimes);

export default router;