import mongoose from "mongoose";

const salaryProfileSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    payType: { type: String, enum: ["monthly", "hourly"], default: "monthly" },
    monthlySalary: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("SalaryProfile", salaryProfileSchema);