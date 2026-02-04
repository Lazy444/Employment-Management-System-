// models/Leave.js
import { Schema, model } from "mongoose";

const LeaveSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    leaveType: {
      type: String,
      required: true,
      trim: true,
      enum: ["Sick Leave", "Annual Leave", "Casual Leave", "Unpaid Leave", "Other"],
      default: "Other",
    },

    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    description: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
      index: true,
    },

    appliedDate: { type: Date, default: Date.now },

    // ✅ already in your schema
    cancelReason: { type: String, default: "", trim: true },

    // ✅ NEW: Admin action fields
    adminNote: { type: String, default: "", trim: true },
    rejectReason: { type: String, default: "", trim: true },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    decidedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model("Leave", LeaveSchema);
