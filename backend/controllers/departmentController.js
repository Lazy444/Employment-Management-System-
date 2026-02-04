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
      { $addFields: { employees: { $size: "$emps" } } },
      { $project: { emps: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({ success: true, departments: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Department name is required" });
    }

    const exists = await Department.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ success: false, error: "Department already exists" });

    const dept = await Department.create({
      name: name.trim(),
      code: (code || "").trim(),
      description: (description || "").trim(),
      isActive: true,
    });

    return res.status(201).json({ success: true, department: dept });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
};
