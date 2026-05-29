import Leave from "../models/Leave.js";

const LEAVE_LIMITS = {
  "Annual Leave": 18,
  "Home Leave": 18,
  "Sick Leave": 12,
  "Casual Leave": 0,
  "Unpaid Leave": 0,
  Other: 0,
};

const normalizeStartOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const normalizeEndOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getMonthStart = (d) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), 1, 0, 0, 0, 0);
};

const getMonthEnd = (d) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth() + 1, 0, 23, 59, 59, 999);
};

const getLeaveDays = (fromDate, toDate) => {
  const from = normalizeStartOfDay(fromDate);
  const to = normalizeStartOfDay(toDate);
  return Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
};

const normalizeLeaveType = (type = "") => {
  const t = String(type).trim().toLowerCase();

  if (t === "annual" || t === "annual leave") return "Annual Leave";
  if (t === "home" || t === "home leave") return "Home Leave";
  if (t === "sick" || t === "sick leave") return "Sick Leave";
  if (t === "casual" || t === "casual leave") return "Casual Leave";
  if (t === "unpaid" || t === "unpaid leave" || t === "lwp") return "Unpaid Leave";
  if (t === "other") return "Other";

  return type;
};

const calculateUsedLeaveByType = async ({ employeeId, year }) => {
  const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  const approvedLeaves = await Leave.find({
    employee: employeeId,
    status: "Approved",
    fromDate: { $lte: yearEnd },
    toDate: { $gte: yearStart },
  }).lean();

  const used = {
    "Annual Leave": 0,
    "Home Leave": 0,
    "Sick Leave": 0,
    "Casual Leave": 0,
    "Unpaid Leave": 0,
    Other: 0,
  };

  for (const leave of approvedLeaves) {
    const type = normalizeLeaveType(leave.leaveType);

    const start = new Date(leave.fromDate) < yearStart ? yearStart : leave.fromDate;
    const end = new Date(leave.toDate) > yearEnd ? yearEnd : leave.toDate;

    const days = getLeaveDays(start, end);

    if (used[type] !== undefined) {
      used[type] += days;
    }
  }

  return used;
};

export async function createLeave(req, res) {
  try {
    const { leaveType, fromDate, toDate, description } = req.body;

    if (!leaveType || !fromDate || !toDate) {
      return res.status(400).json({
        message: "Leave Type, From Date and To Date are required",
      });
    }

    const normalizedType = normalizeLeaveType(leaveType);
    const from = normalizeStartOfDay(fromDate);
    const to = normalizeEndOfDay(toDate);
    const todayStart = getTodayStart();

    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime())) {
      return res.status(400).json({
        message: "Invalid leave dates",
      });
    }

    if (from > to) {
      return res.status(400).json({
        message: "From Date cannot be after To Date",
      });
    }

    if (from < todayStart) {
      return res.status(400).json({
        message: "You cannot apply leave on previous dates",
      });
    }

    const requestedDays = getLeaveDays(from, to);
    const year = from.getFullYear();

    if (LEAVE_LIMITS[normalizedType] !== undefined && LEAVE_LIMITS[normalizedType] > 0) {
      const used = await calculateUsedLeaveByType({
        employeeId: req.user.id,
        year,
      });

      const alreadyUsed = used[normalizedType] || 0;
      const limit = LEAVE_LIMITS[normalizedType];
      const remaining = Math.max(limit - alreadyUsed, 0);

      if (requestedDays > remaining) {
        return res.status(409).json({
          message: `You only have ${remaining} ${normalizedType} day(s) left for ${year}`,
          leaveType: normalizedType,
          limit,
          used: alreadyUsed,
          remaining,
          requestedDays,
        });
      }
    }

    const monthStart = getMonthStart(from);
    const monthEnd = getMonthEnd(from);

    const existingMonthlyLeave = await Leave.findOne({
      employee: req.user.id,
      status: { $ne: "Cancelled" },
      fromDate: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    if (existingMonthlyLeave) {
      return res.status(409).json({
        message: "You can apply only one leave request in a single month",
      });
    }

    const overlap = await Leave.findOne({
      employee: req.user.id,
      status: { $ne: "Cancelled" },
      fromDate: { $lte: to },
      toDate: { $gte: from },
    }).lean();

    if (overlap) {
      return res.status(409).json({
        message: "You already have a leave request for these dates",
      });
    }

    const doc = await Leave.create({
      employee: req.user.id,
      leaveType: normalizedType,
      fromDate: from,
      toDate: to,
      description: description || "",
      status: "Pending",
      appliedDate: new Date(),
    });

    return res.status(201).json({
      message: "Leave request submitted",
      leave: doc,
    });
  } catch (err) {
    console.error("Create leave error:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
}

export async function getMyLeaves(req, res) {
  try {
    const { status } = req.query;

    const filter = { employee: req.user.id };
    if (status && status !== "All") filter.status = status;

    const leaves = await Leave.find(filter).sort({ createdAt: -1 }).lean();

    return res.json({ leaves });
  } catch (err) {
    console.error("Get leaves error:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
}

export async function getMyLeaveBalance(req, res) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const used = await calculateUsedLeaveByType({
      employeeId: req.user.id,
      year,
    });

    const balance = Object.keys(LEAVE_LIMITS).map((type) => {
      const limit = LEAVE_LIMITS[type];
      const usedDays = used[type] || 0;

      return {
        leaveType: type,
        limit,
        used: usedDays,
        remaining: Math.max(limit - usedDays, 0),
      };
    });

    return res.json({
      success: true,
      year,
      balance,
    });
  } catch (err) {
    console.error("Leave balance error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load leave balance",
    });
  }
}

export async function getMyLeaveById(req, res) {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user.id,
    }).lean();

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    return res.json({ leave });
  } catch (err) {
    console.error("Get leave by id error:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
}

export async function cancelMyLeave(req, res) {
  try {
    const { cancelReason } = req.body || {};

    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user.id,
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Only Pending leaves can be cancelled",
      });
    }

    leave.status = "Cancelled";

    if (typeof cancelReason === "string" && cancelReason.trim()) {
      leave.cancelReason = cancelReason.trim();
    }

    await leave.save();

    return res.json({
      message: "Leave cancelled",
      leave,
    });
  } catch (err) {
    console.error("Cancel leave error:", err);

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
}