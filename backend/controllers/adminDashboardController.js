// controllers/adminDashboardController.js
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

const toWorkDate = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getMonthRange = (ym) => {
  let year;
  let month;

  if (ym && /^\d{4}-\d{2}$/.test(ym)) {
    const [y, m] = ym.split("-").map(Number);
    year = y;
    month = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return { start, end };
};

export const getDashboardStats = async (req, res) => {
  try {
    const workDate = toWorkDate(new Date());

    const startOfDay = new Date(`${workDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${workDate}T23:59:59.999Z`);

    const employees = await User.find({ role: "employee" })
      .select("_id name email employeeId department departmentName status")
      .lean();

    const totalEmployees = employees.length;

    const todaysAttendance = await Attendance.find({ workDate })
      .select("_id employee punchedInAt punchedOutAt totalMinutes status")
      .lean();

    const presentEmployeeIds = new Set(
      todaysAttendance
        .filter((row) => !!row.punchedInAt)
        .map((row) => String(row.employee))
    );

    const presentToday = presentEmployeeIds.size;

    const approvedLeavesToday = await Leave.find({
      status: "Approved",
      fromDate: { $lte: endOfDay },
      toDate: { $gte: startOfDay },
    })
      .select("_id employee fromDate toDate status")
      .lean();

    const onLeaveEmployeeIds = new Set(
      approvedLeavesToday.map((leave) => String(leave.employee))
    );

    let absentToday = 0;

    for (const emp of employees) {
      const empId = String(emp._id);
      const isPresent = presentEmployeeIds.has(empId);
      const isOnLeave = onLeaveEmployeeIds.has(empId);

      if (!isPresent && !isOnLeave) {
        absentToday += 1;
      }
    }

    return res.status(200).json({
      success: true,
      workDate,
      stats: {
        totalEmployees,
        presentToday,
        absentToday,
        onLeaveToday: onLeaveEmployeeIds.size,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats",
      error: err.message || "Server error",
    });
  }
};

export const getDashboardLeaveStats = async (req, res) => {
  try {
    const { month } = req.query;
    const { start, end } = getMonthRange(month);

    const leaves = await Leave.find({
      createdAt: { $gte: start, $lte: end },
    })
      .select("_id status createdAt")
      .lean();

    const stats = {
      applied: leaves.length,
      approved: leaves.filter((l) => l.status === "Approved").length,
      pending: leaves.filter((l) => l.status === "Pending").length,
      rejected: leaves.filter((l) => l.status === "Rejected").length,
    };

    return res.status(200).json({
      success: true,
      month:
        month ||
        `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      stats,
    });
  } catch (err) {
    console.error("getDashboardLeaveStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard leave stats",
      error: err.message || "Server error",
    });
  }
};