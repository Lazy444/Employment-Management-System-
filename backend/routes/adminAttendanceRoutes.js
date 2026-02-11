import express from "express";
import {
  getTodayPresence,
  adminUpsertTodayAttendance,
  adminUpdateAttendanceTimes,
} from "../controllers/adminAttendanceController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET  /api/admin/attendance/today
 * - returns all employees with their today's attendance (present/absent)
 */
router.get("/today", protect, adminOnly, getTodayPresence);

/**
 * POST /api/admin/attendance/today/upsert
 * - create or update today's attendance for an employee (set custom in/out)
 * body: { employeeId, punchedInAt, punchedOutAt }
 */
router.post("/today/upsert", protect, adminOnly, adminUpsertTodayAttendance);

/**
 * PATCH /api/admin/attendance/:attendanceId
 * - update an existing attendance record times (set custom in/out)
 * body: { punchedInAt, punchedOutAt }
 */
router.patch("/:attendanceId", protect, adminOnly, adminUpdateAttendanceTimes);

export default router;
