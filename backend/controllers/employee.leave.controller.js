import Leave from "../models/Leave.js";

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

export async function createLeave(req, res) {
  try {
    const { leaveType, fromDate, toDate, description } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "From Date and To Date are required" });
    }

    const from = normalizeStartOfDay(fromDate);
    const to = normalizeEndOfDay(toDate);

    if (from > to) {
      return res.status(400).json({ message: "From Date cannot be after To Date" });
    }

    // ✅ BLOCK OVERLAPPING LEAVES (includes "same day twice")
    // overlap condition: existing.from <= new.to AND existing.to >= new.from
    // Also ignore Cancelled leaves
    const overlap = await Leave.findOne({
      employee: req.user.id,
      status: { $ne: "Cancelled" },
      fromDate: { $lte: to },
      toDate: { $gte: from },
    }).lean();

    if (overlap) {
      return res.status(409).json({
        message:
          "You already have a leave request for these dates. You cannot apply leave twice on the same day.",
      });
    }

    const doc = await Leave.create({
      employee: req.user.id,
      leaveType,
      fromDate: from,
      toDate: to,
      description: description || "",
      status: "Pending",
      appliedDate: new Date(),
    });

    return res.status(201).json({ message: "Leave request submitted", leave: doc });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
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
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function getMyLeaveById(req, res) {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, employee: req.user.id }).lean();
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    return res.json({ leave });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// ✅ Cancel leave (Pending only) + optional cancelReason
export async function cancelMyLeave(req, res) {
  try {
    const { cancelReason } = req.body || {};

    const leave = await Leave.findOne({ _id: req.params.id, employee: req.user.id });
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Only Pending leaves can be cancelled" });
    }

    leave.status = "Cancelled";

    // Optional: store why it was cancelled (only if you add field in schema)
    if (typeof cancelReason === "string" && cancelReason.trim()) {
      leave.cancelReason = cancelReason.trim();
    }

    await leave.save();

    return res.json({ message: "Leave cancelled", leave });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
