// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // ✅ must match your model name: mongoose.model("User", userSchema)
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    workDate: { type: String, required: true }, // "YYYY-MM-DD"

    punchedInAt: { type: Date, required: true },
    punchedOutAt: { type: Date, default: null },

    totalMinutes: { type: Number, default: 0 },
    status: { type: String, enum: ["IN", "OUT"], default: "IN" },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, workDate: 1 }, { unique: true });


export default mongoose.model("Attendance", attendanceSchema);

