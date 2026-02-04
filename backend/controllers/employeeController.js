// controllers/employeeController.js
import User from "../models/User.js";

export const getMyProfile = async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .select("-password")
      .populate("department", "name code")
      .lean();

    if (!me) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({
      success: true,
      employee: {
        _id: me._id,
        name: me.name,
        email: me.email,
        role: me.role,
        phone: me.phone || "",
        status: me.status || "Active",

        // ✅ THIS MAKES IMAGE WORK
        imageUrl: me.imageUrl || me.profileImage || "",

        employeeId: me.employeeId || me.empCode || "",
        dob: me.dob || "",
        gender: me.gender || "",
        maritalStatus: me.maritalStatus || "",

        departmentName: me.departmentName || (me.department?.name ?? ""),
        department: me.department
          ? { _id: me.department._id, name: me.department.name, code: me.department.code }
          : null,
      },
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};
