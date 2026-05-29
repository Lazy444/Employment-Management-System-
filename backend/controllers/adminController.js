
// controllers/adminEmployeeController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const cleanNumber = (value) => {
  const n = Number(value || 0);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// ✅ normalize marital status
const normalizeMaritalStatus = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "married") return "Married";
  return "Single";
};

export const listEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: { $in: ["employee", "hr", "admin"] },
    })
      .select("-password")
      .populate("department", "name code")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      employees,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      departmentId,
      status,
      role,
      employeeId,
      maritalStatus,
      dob,
      gender,
      hourlyRate,
      monthlySalary,
    } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({ success: false, error: "Name is required" });
    }

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        error: "Department is required",
      });
    }

    const numericHourlyRate = cleanNumber(hourlyRate);
    const numericMonthlySalary = cleanNumber(monthlySalary);

    if (numericHourlyRate === null) {
      return res.status(400).json({
        success: false,
        error: "Valid hourly rate is required",
      });
    }

    if (numericMonthlySalary === null) {
      return res.status(400).json({
        success: false,
        error: "Valid monthly salary is required",
      });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const employee = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || "",
      department: departmentId,
      status: status || "Active",
      role: role || "employee",
      employeeId: employeeId || "",
      maritalStatus: normalizeMaritalStatus(maritalStatus), // ✅ FIX
      dob: dob || "",
      gender: gender || "Male",
      imageUrl,
      hourlyRate: numericHourlyRate,
      monthlySalary: numericMonthlySalary,
    });

    const safeEmployee = await User.findById(employee._id)
      .select("-password")
      .populate("department", "name code");

    return res.status(201).json({
      success: true,
      employee: safeEmployee,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      phone,
      departmentId,
      status,
      role,
      employeeId,
      maritalStatus,
      dob,
      gender,
      hourlyRate,
      monthlySalary,
    } = req.body;

    const numericHourlyRate = cleanNumber(hourlyRate);
    const numericMonthlySalary = cleanNumber(monthlySalary);

    if (numericHourlyRate === null) {
      return res.status(400).json({
        success: false,
        error: "Valid hourly rate is required",
      });
    }

    if (numericMonthlySalary === null) {
      return res.status(400).json({
        success: false,
        error: "Valid monthly salary is required",
      });
    }

    const updateData = {
      name: String(name || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      phone: phone || "",
      department: departmentId,
      status: status || "Active",
      role: role || "employee",
      employeeId: employeeId || "",
      maritalStatus: normalizeMaritalStatus(maritalStatus), // ✅ FIX
      dob: dob || "",
      gender: gender || "Male",
      hourlyRate: numericHourlyRate,
      monthlySalary: numericMonthlySalary,
    };

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters",
        });
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("department", "name code");

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.json({
      success: true,
      employee: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};
