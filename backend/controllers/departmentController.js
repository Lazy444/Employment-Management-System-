import mongoose from "mongoose";
import Department from "../models/Department.js";

export const listDepartments = async (req, res) => {
  try {
    const rows = await Department.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "department",
          as: "emps",
        },
      },
      {
        $addFields: {
          employees: { $size: "$emps" },
        },
      },
      {
        $project: {
          emps: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      departments: rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, hourlyRate, isActive } = req.body || {};

    const cleanName = String(name || "").trim();
    const cleanCode = String(code || "").trim().toUpperCase();
    const cleanDescription = String(description || "").trim();
    const numericHourlyRate = Number(hourlyRate);

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        error: "Department name is required",
      });
    }

    if (!Number.isFinite(numericHourlyRate) || numericHourlyRate < 0) {
      return res.status(400).json({
        success: false,
        error: "Valid hourly rate is required",
      });
    }

    const existsByName = await Department.findOne({ name: cleanName });
    if (existsByName) {
      return res.status(409).json({
        success: false,
        error: "Department name already exists",
      });
    }

    if (cleanCode) {
      const existsByCode = await Department.findOne({ code: cleanCode });
      if (existsByCode) {
        return res.status(409).json({
          success: false,
          error: "Department code already exists",
        });
      }
    }

    const dept = await Department.create({
      name: cleanName,
      code: cleanCode,
      description: cleanDescription,
      hourlyRate: numericHourlyRate,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      department: dept,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, hourlyRate, isActive } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid department id",
      });
    }

    const cleanName = String(name || "").trim();
    const cleanCode = String(code || "").trim().toUpperCase();
    const cleanDescription = String(description || "").trim();
    const numericHourlyRate = Number(hourlyRate);

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        error: "Department name is required",
      });
    }

    if (!Number.isFinite(numericHourlyRate) || numericHourlyRate < 0) {
      return res.status(400).json({
        success: false,
        error: "Valid hourly rate is required",
      });
    }

    const existingByName = await Department.findOne({
      name: cleanName,
      _id: { $ne: id },
    });

    if (existingByName) {
      return res.status(409).json({
        success: false,
        error: "Department name already exists",
      });
    }

    if (cleanCode) {
      const existingByCode = await Department.findOne({
        code: cleanCode,
        _id: { $ne: id },
      });

      if (existingByCode) {
        return res.status(409).json({
          success: false,
          error: "Department code already exists",
        });
      }
    }

    const updated = await Department.findByIdAndUpdate(
      id,
      {
        name: cleanName,
        code: cleanCode,
        description: cleanDescription,
        hourlyRate: numericHourlyRate,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
};