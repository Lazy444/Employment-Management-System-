// controllers/attendanceController.js
import Attendance from "../models/Attendance.js";

const OFFICE_START_HOUR = 9;  // 9:00 AM
const OFFICE_END_HOUR = 17;   // 5:00 PM

const toWorkDate = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getOfficeWindow = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(OFFICE_START_HOUR, 0, 0, 0);

  const end = new Date(date);
  end.setHours(OFFICE_END_HOUR, 0, 0, 0);

  return { start, end };
};

const calculateOfficeMinutes = (punchedInAt, punchedOutAt) => {
  const inTime = new Date(punchedInAt);
  const outTime = new Date(punchedOutAt);

  const { start: officeStart, end: officeEnd } = getOfficeWindow(inTime);

  const effectiveStart = inTime > officeStart ? inTime : officeStart;
  const effectiveEnd = outTime < officeEnd ? outTime : officeEnd;

  const diffMs = effectiveEnd.getTime() - effectiveStart.getTime();

  if (diffMs <= 0) return 0;

  return Math.floor(diffMs / 60000);
};

// POST /api/attendance/punch-in
export const punchIn = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const now = new Date();
    const workDate = toWorkDate(now);
    const { end: officeEnd } = getOfficeWindow(now);

    if (now >= officeEnd) {
      return res.status(400).json({
        ok: false,
        message: "Punch in is only allowed before 5:00 PM",
      });
    }

    const todayRecord = await Attendance.findOne({
      employee: employeeId,
      workDate,
    }).lean();

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
    return res.status(500).json({
      ok: false,
      message: "Punch in failed",
      error: e?.message,
    });
  }
};

// POST /api/attendance/punch-out
export const punchOut = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const now = new Date();
    const workDate = toWorkDate(now);

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

    const totalMinutes = calculateOfficeMinutes(today.punchedInAt, now);

    today.punchedOutAt = now;
    today.totalMinutes = totalMinutes;
    today.status = "OUT";
    await today.save();

    return res.json({
      ok: true,
      attendance: today,
      officeHours: "09:00 AM to 05:00 PM",
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: "Punch out failed",
      error: e?.message,
    });
  }
};

// GET /api/attendance/me/today
export const myToday = async (req, res) => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const workDate = toWorkDate(new Date());

    const records = await Attendance.find({ employee: employeeId, workDate })
      .sort({ punchedInAt: -1 })
      .lean();

    return res.json({
      ok: true,
      workDate,
      officeHours: "09:00 AM to 05:00 PM",
      records,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: "Fetch failed",
      error: e?.message,
    });
  }
};