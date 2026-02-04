// controllers/adminEmployeeController.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Department from "../models/Department.js";

const safeBody = (req) => req.body || {};
const fileToUrl = (file) => (file ? `/uploads/${file.filename}` : "");

/**
 * POST /api/admin/employees
 */
export const createEmployee = async (req, res) => {
  try {
    const body = safeBody(req);

    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const departmentId = body.departmentId;
    const phone = (body.phone || "").trim();
    const status = body.status || "Active";
    const role = body.role;

    const employeeId = (body.employeeId || "").trim();
    const maritalStatus = body.maritalStatus || "Single";
    const dob = body.dob || "";
    const gender = body.gender || "Male";

    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({
        success: false,
        error: "name, email, password, departmentId are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ success: false, error: "Invalid departmentId" });
    }

    const dep = await Department.findById(departmentId);
    if (!dep) return res.status(404).json({ success: false, error: "Department not found" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const uploaded = req.file ? fileToUrl(req.file) : "";

    const employee = await User.create({
      name,
      email,
      password: hashed,

      role: role && ["employee", "admin", "hr"].includes(role) ? role : "employee",

      department: dep._id,
      departmentName: dep.name,

      phone,
      status,

      employeeId,
      maritalStatus,
      dob: dob ? new Date(dob) : null,
      gender,

      // ✅ SAVE IMAGE CONSISTENTLY
      imageUrl: uploaded,
      profileImage: uploaded,
    });

    return res.status(201).json({
      success: true,
      message: "Employee created",
      employee,
    });
  } catch (err) {
    console.error("createEmployee error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

/**
 * GET /api/admin/employees
 */
export const listEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ["employee", "hr", "admin"] } })
      .populate("department", "name code")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      employees: employees.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || "",
        status: u.status || "Active",

        departmentName: u.departmentName || (u.department?.name ?? ""),
        department: u.department || null,

        employeeId: u.employeeId || u.empCode || "",
        maritalStatus: u.maritalStatus || "Single",
        dob: u.dob || null,
        gender: u.gender || "Male",

        // ✅ IMAGE
        imageUrl: u.imageUrl || u.profileImage || "",

        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (err) {
    console.error("listEmployees error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

/**
 * PUT /api/admin/employees/:id
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const body = safeBody(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid employee id" });
    }

    const employee = await User.findById(id);
    if (!employee) return res.status(404).json({ success: false, error: "Employee not found" });

    const name = body.name ? String(body.name).trim() : "";
    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    const phoneProvided = Object.prototype.hasOwnProperty.call(body, "phone");
    const phone = phoneProvided ? String(body.phone || "").trim() : null;

    const status = body.status ? String(body.status) : "";
    const role = body.role ? String(body.role) : "";
    const departmentId = body.departmentId ? String(body.departmentId) : "";
    const password = body.password ? String(body.password) : "";

    const employeeIdProvided = Object.prototype.hasOwnProperty.call(body, "employeeId");
    const employeeId = employeeIdProvided ? String(body.employeeId || "").trim() : null;

    const maritalStatus = body.maritalStatus ? String(body.maritalStatus) : "";
    const dob = body.dob ? String(body.dob) : "";
    const gender = body.gender ? String(body.gender) : "";

    if (email && email !== employee.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ success: false, error: "Email already exists" });
      employee.email = email;
    }

    if (employeeId !== null && employeeId !== employee.employeeId) {
      if (employeeId !== "") {
        const existsEmpId = await User.findOne({ employeeId });
        if (existsEmpId) return res.status(409).json({ success: false, error: "Employee ID already exists" });
      }
      employee.employeeId = employeeId;
    }

    if (name) employee.name = name;
    if (phoneProvided) employee.phone = phone;
    if (status) employee.status = status;

    if (role) {
      const allowedRoles = ["employee", "admin", "hr"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, error: "Invalid role" });
      }
      employee.role = role;
    }

    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ success: false, error: "Invalid departmentId" });
      }
      const dep = await Department.findById(departmentId);
      if (!dep) return res.status(404).json({ success: false, error: "Department not found" });
      employee.department = dep._id;
      employee.departmentName = dep.name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
      }
      employee.password = await bcrypt.hash(password, 10);
    }

    if (maritalStatus) employee.maritalStatus = maritalStatus;
    if (gender) employee.gender = gender;

    if (dob) {
      const d = new Date(dob);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ success: false, error: "Invalid DOB date format" });
      }
      employee.dob = d;
    }

    if (req.file) {
      const uploaded = fileToUrl(req.file);
      employee.imageUrl = uploaded;
      employee.profileImage = uploaded;
    }

    await employee.save();

    return res.json({ success: true, message: "Employee updated", employee });
  } catch (err) {
    console.error("updateEmployee error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

/**
 * DELETE /api/admin/employees/:id
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) return res.status(404).json({ success: false, error: "Employee not found" });

    if (employee.role === "admin") {
      return res.status(400).json({ success: false, error: "Admin user cannot be deleted" });
    }

    await User.deleteOne({ _id: id });
    return res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    console.error("deleteEmployee error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};
