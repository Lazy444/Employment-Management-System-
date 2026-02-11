// controllers/adminAttendanceController.js
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

const toWorkDate = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const clampDate = (val) => {
  if (!val) return null;
  const dt = new Date(val);
  if (!Number.isFinite(dt.getTime())) return null;
  return dt;
};

/**
 * GET /api/admin/attendance/today
 * - Returns all EMPLOYEE users + today's attendance if exists
 * Present: has attendance record today (punchedInAt exists)
 * IN now: punchedInAt exists AND punchedOutAt is null
 */
export const getTodayPresence = async (req, res) => {
  try {
    const workDate = toWorkDate(new Date());

    // ✅ get ONLY employees
    const employees = await User.find({ role: "employee" })
      .select("_id name email phone employeeId department departmentName status imageUrl")
      .populate("department", "name") // optional (if you want dept name)
      .sort({ name: 1 })
      .lean();

    const todays = await Attendance.find({ workDate })
      .populate("employee", "name email phone employeeId department departmentName status imageUrl")
      .lean();

    // map attendance by employeeId
    const map = new Map(
      todays.map((a) => [String(a.employee?._id || a.employee), a])
    );

    const rows = employees.map((emp) => {
      const att = map.get(String(emp._id)) || null;

      const present = !!att?.punchedInAt;
      const inNow = present && !att?.punchedOutAt;

      // optional department name resolution
      const deptName =
        emp?.department?.name ||
        emp?.departmentName ||
        att?.employee?.department?.name ||
        att?.employee?.departmentName ||
        "";

      return {
        employee: { ...emp, departmentNameResolved: deptName },
        attendance: att,
        present,
        inNow,
      };
    });

    const summary = {
      workDate,
      total: rows.length,
      present: rows.filter((r) => r.present).length,
      absent: rows.filter((r) => !r.present).length,
      inNow: rows.filter((r) => r.inNow).length,
    };

    return res.json({ ok: true, workDate, summary, rows });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, message: "Failed to load admin attendance", error: e?.message });
  }
};

/**
 * POST /api/admin/attendance/today/upsert
 * body: { employeeId, punchedInAt, punchedOutAt }
 * - creates today attendance if not exist
 * - sets custom times (admin override)
 */
export const adminUpsertTodayAttendance = async (req, res) => {
  try {
    const { employeeId, punchedInAt, punchedOutAt } = req.body || {};
    if (!employeeId) return res.status(400).json({ ok: false, message: "employeeId is required" });

    // ✅ verify employee exists and is employee
    const emp = await User.findOne({ _id: employeeId, role: "employee" }).lean();
    if (!emp) return res.status(404).json({ ok: false, message: "Employee not found" });

    const workDate = toWorkDate(new Date());

    const inDt = clampDate(punchedInAt);
    const outDt = clampDate(punchedOutAt);

    if (!inDt) {
      return res.status(400).json({ ok: false, message: "punchedInAt is required and must be a valid date" });
    }

    if (outDt && outDt.getTime() < inDt.getTime()) {
      return res.status(400).json({ ok: false, message: "Punch out cannot be earlier than punch in." });
    }

    const diffMs = outDt ? outDt.getTime() - inDt.getTime() : 0;
    const totalMinutes = outDt ? Math.max(0, Math.floor(diffMs / 60000)) : 0;

    const doc = await Attendance.findOneAndUpdate(
      { employee: employeeId, workDate },
      {
        employee: employeeId,
        workDate,
        punchedInAt: inDt,
        punchedOutAt: outDt || null,
        totalMinutes,
        status: outDt ? "OUT" : "IN",
      },
      { new: true, upsert: true }
    )
      .populate("employee", "name email phone employeeId department departmentName status imageUrl")
      .lean();

    return res.json({ ok: true, attendance: doc });
  } catch (e) {
    // common mongoose duplicate error (if unique index exists)
    if (e?.code === 11000) {
      return res.status(409).json({ ok: false, message: "Attendance already exists for today for this employee." });
    }
    return res.status(500).json({ ok: false, message: "Upsert failed", error: e?.message });
  }
};

/**
 * PATCH /api/admin/attendance/:attendanceId
 * body: { punchedInAt, punchedOutAt }
 * - updates existing attendance times (admin override)
 */
export const adminUpdateAttendanceTimes = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { punchedInAt, punchedOutAt } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({ ok: false, message: "Invalid attendanceId" });
    }

    const att = await Attendance.findById(attendanceId);
    if (!att) return res.status(404).json({ ok: false, message: "Attendance not found" });

    const inDt = clampDate(punchedInAt) || (att.punchedInAt ? new Date(att.punchedInAt) : null);

    // allow clearing by sending "" or null
    const outDt = punchedOutAt === "" || punchedOutAt === null ? null : clampDate(punchedOutAt);

    if (!inDt) return res.status(400).json({ ok: false, message: "Punch in time must exist" });

    if (outDt && outDt.getTime() < inDt.getTime()) {
      return res.status(400).json({ ok: false, message: "Punch out cannot be earlier than punch in." });
    }

    const diffMs = outDt ? outDt.getTime() - inDt.getTime() : 0;
    const totalMinutes = outDt ? Math.max(0, Math.floor(diffMs / 60000)) : 0;

    att.punchedInAt = inDt;
    att.punchedOutAt = outDt;
    att.totalMinutes = totalMinutes;
    att.status = outDt ? "OUT" : "IN";

    await att.save();

    const populated = await Attendance.findById(att._id)
      .populate("employee", "name email phone employeeId department departmentName status imageUrl")
      .lean();

    return res.json({ ok: true, attendance: populated });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Update failed", error: e?.message });
  }
};
