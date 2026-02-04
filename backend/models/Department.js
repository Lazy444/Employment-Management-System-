// models/Department.js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, trim: true, uppercase: true, default: "" },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;
