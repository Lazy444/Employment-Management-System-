// controllers/attendanceController.js
import Attendance from "../models/Attendance.js";

const toWorkDate = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// POST /api/attendance/punch-in
export const punchIn = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const now = new Date();
    const workDate = toWorkDate(now);

    // ✅ Only once per day
    const todayRecord = await Attendance.findOne({ employee: employeeId, workDate }).lean();
    if (todayRecord) {
      return res.status(409).json({
        ok: false,
        message: "You already punched in today. You can punch only once per day.",
        record: todayRecord,
      });
    }

    const created = await Attendance.create({
      employee: employeeId,
      workDate,
      punchedInAt: now,
      punchedOutAt: null,
      totalMinutes: 0,
      status: "IN",
    });

    return res.status(201).json({ ok: true, attendance: created });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Punch in failed", error: e?.message });
  }
};

// POST /api/attendance/punch-out
export const punchOut = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const now = new Date();
    const workDate = toWorkDate(now);

    // ✅ find today's record (must exist and must not already be punched out)
    const today = await Attendance.findOne({
      employee: employeeId,
      workDate,
    });

    if (!today) {
      return res.status(404).json({
        ok: false,
        message: "No punch-in found for today. Please punch in first.",
      });
    }

    if (today.punchedOutAt) {
      return res.status(409).json({
        ok: false,
        message: "You already punched out today. You can punch out only once per day.",
        record: today,
      });
    }

    const diffMs = now.getTime() - new Date(today.punchedInAt).getTime();
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));

    today.punchedOutAt = now;
    today.totalMinutes = totalMinutes;
    today.status = "OUT";
    await today.save();

    return res.json({ ok: true, attendance: today });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Punch out failed", error: e?.message });
  }
};

// GET /api/attendance/me/today
export const myToday = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const workDate = toWorkDate(new Date());

    // ✅ should be max 1 record/day (because of unique index)
    const records = await Attendance.find({ employee: employeeId, workDate })
      .sort({ punchedInAt: -1 })
      .lean();

    return res.json({ ok: true, workDate, records });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Fetch failed", error: e?.message });
  }
};
