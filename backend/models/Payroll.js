import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    month: {
      type: String,
      required: true,
      index: true,
    },

    totalMinutes: { type: Number, default: 0 },
    workedMinutes: { type: Number, default: 0 },

    weekendDays: { type: Number, default: 0 },
    weekendHours: { type: Number, default: 0 },
    weekendMinutes: { type: Number, default: 0 },

    workedPay: { type: Number, default: 0 },
    weekendPay: { type: Number, default: 0 },

    grossPay: { type: Number, default: 0 },

    taxPercent: { type: Number, default: 2 },
    taxAmount: { type: Number, default: 0 },

    netPay: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    paidAt: { type: Date, default: null },
    notes: { type: String, default: "" },

    salarySource: {
      type: String,
      enum: ["employee"],
      default: "employee",
    },

    salarySnapshot: {
      payType: {
        type: String,
        enum: ["hourly", "monthly"],
        default: "hourly",
      },
      hourlyRate: { type: Number, default: 0 },
      monthlySalary: { type: Number, default: 0 },
    },
    paidLeaveDays: { type: Number, default: 0 },
    paidLeaveHours: { type: Number, default: 0 },
    paidLeaveMinutes: { type: Number, default: 0 },
    paidLeavePay: { type: Number, default: 0 },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);