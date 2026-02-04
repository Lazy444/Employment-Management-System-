// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    password: { type: String, required: true }, // bcrypt hash

    // ✅ MUST MATCH your frontend role dropdown + admin controller
    role: {
      type: String,
      enum: ["admin", "employee", "hr"],
      required: true,
      default: "employee",
    },

    // ✅ matches EmployeeList normalization: u.imageUrl || u.profileImage || u.image
   imageUrl: { type: String, default: "" },

    // ✅ extra fields used in EmployeeList
    employeeId: { type: String, trim: true, default: "" },

    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
      default: "Single",
    },

    dob: { type: Date, default: null },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    // ✅ Department support
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    departmentName: { type: String, trim: true, default: "" }, // snapshot

    phone: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
