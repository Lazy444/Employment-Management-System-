import User from "../models/User.js";
import Leave from "../models/Leave.js";
import Task from "../models/Task.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const me = await User.findById(userId)
      .select("-password")
      .populate("department", "name code")
      .lean();

    if (!me) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "done",
    });

    const totalLeaveLimit = 18;

    const approvedLeaves = await Leave.find({
      employee: userId,
      status: "Approved",
    }).lean();

    const usedLeaveDays = approvedLeaves.reduce((total, leave) => {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);

      const days =
        Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

      return total + Math.max(days, 0);
    }, 0);

    const leaveBalance = Math.max(totalLeaveLimit - usedLeaveDays, 0);

    return res.json({
      success: true,
      employee: {
        _id: me._id,
        name: me.name,
        email: me.email,
        role: me.role,
        phone: me.phone || "",
        status: me.status || "Active",
        imageUrl: me.imageUrl || me.profileImage || "",
        employeeId: me.employeeId || me.empCode || "",
        dob: me.dob || "",
        gender: me.gender || "",
        maritalStatus: me.maritalStatus || "",
        joinDate: me.joinDate || me.createdAt || "",
        location: me.location || "",
        employeeType: me.employeeType || "Full-time",

        departmentName: me.departmentName || me.department?.name || "",
        department: me.department || null,

        stats: {
          yearsAtCompany: 0,
          projectsCompleted: completedTasks,
          certifications: Array.isArray(me.certifications)
            ? me.certifications.length
            : Number(me.certifications || 0),
          leaveBalance,
        },
      },
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};