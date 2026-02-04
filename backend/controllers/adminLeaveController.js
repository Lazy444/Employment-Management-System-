// controllers/adminLeaveController.js
import Leave from "../models/Leave.js";

export const listLeaves = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && status !== "All") filter.status = status;

    const leaves = await Leave.find(filter)
      .populate({
        path: "employee",
        select: "name email phone role status department departmentName",
        populate: { path: "department", select: "name code" },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, leaves });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ success: false, error: "Leave not found" });

    if (leave.status !== "Pending") {
      return res.status(400).json({ success: false, error: "Only Pending leaves can be approved" });
    }

    leave.status = "Approved";
    leave.adminNote = typeof note === "string" ? note.trim() : "";
    leave.rejectReason = "";
    leave.decidedBy = req.user._id;
    leave.decidedAt = new Date();

    await leave.save();

    return res.json({ success: true, message: "Leave approved", leave });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, rejectReason } = req.body || {};

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ success: false, error: "Leave not found" });

    if (leave.status !== "Pending") {
      return res.status(400).json({ success: false, error: "Only Pending leaves can be rejected" });
    }

    leave.status = "Rejected";
    leave.adminNote = typeof note === "string" ? note.trim() : "";
    leave.rejectReason = typeof rejectReason === "string" ? rejectReason.trim() : "";
    leave.decidedBy = req.user._id;
    leave.decidedAt = new Date();

    await leave.save();

    return res.json({ success: true, message: "Leave rejected", leave });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};
