import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Payroll from "../models/Payroll.js";
import Leave from "../models/Leave.js";

const WEEKEND_HOURS_PER_DAY = 8;
const PAID_LEAVE_HOURS_PER_DAY = 8;

const getDefaultMonth = () => new Date().toISOString().slice(0, 7);

const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

const monthRange = (month) => {
  const [year, mon] = month.split("-").map(Number);

  const startDate = new Date(year, mon - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, mon, 0, 23, 59, 59, 999);

  const startWorkDate = `${year}-${String(mon).padStart(2, "0")}-01`;

  const next = new Date(year, mon, 1);
  const endYear = next.getFullYear();
  const endMonth = String(next.getMonth() + 1).padStart(2, "0");
  const endWorkDate = `${endYear}-${endMonth}-01`;

  return { startDate, endDate, startWorkDate, endWorkDate };
};

const getSaturdayCountInMonth = (month) => {
  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();

  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, mon - 1, day);
    if (d.getDay() === 6) count++;
  }

  return count;
};

const computeHourlyPay = ({ hourlyRate = 0, totalMinutes = 0 }) => {
  const hours = Number(totalMinutes || 0) / 60;
  return round2(hours * Number(hourlyRate || 0));
};

const getEffectiveHourlyRate = (emp) => {
  return Number(emp?.hourlyRate || emp?.department?.hourlyRate || 0);
};

const isPaidLeaveType = (leaveType = "") => {
  const type = String(leaveType || "").trim().toLowerCase();

  return ![
    "unpaid",
    "unpaid leave",
    "leave without pay",
    "lwp",
  ].includes(type);
};

const daysOverlapInclusive = (fromDate, toDate, monthStart, monthEnd) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const start = from > monthStart ? from : monthStart;
  const end = to < monthEnd ? to : monthEnd;

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) return 0;

  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const getPaidLeaveDaysMap = async ({ employeeIds, month }) => {
  const { startDate, endDate } = monthRange(month);

  const leaves = await Leave.find({
    employee: { $in: employeeIds },
    status: "Approved",
    fromDate: { $lte: endDate },
    toDate: { $gte: startDate },
  }).lean();

  const map = new Map();

  for (const leave of leaves) {
    if (!isPaidLeaveType(leave.leaveType)) continue;

    const days = daysOverlapInclusive(
      leave.fromDate,
      leave.toDate,
      startDate,
      endDate
    );

    const key = String(leave.employee);
    map.set(key, (map.get(key) || 0) + days);
  }

  return map;
};

const isMarried = (maritalStatus = "") => {
  return String(maritalStatus || "").trim().toLowerCase() === "married";
};

const calculateNepalAnnualTax = (annualIncome, maritalStatus = "Single") => {
  const income = Number(annualIncome || 0);
  const married = isMarried(maritalStatus);

  const slabs = married
    ? [
        { amount: 600000, rate: 0.01 },
        { amount: 200000, rate: 0.1 },
        { amount: 300000, rate: 0.2 },
        { amount: 900000, rate: 0.3 },
        { amount: 3000000, rate: 0.36 },
        { amount: Infinity, rate: 0.39 },
      ]
    : [
        { amount: 500000, rate: 0.01 },
        { amount: 200000, rate: 0.1 },
        { amount: 300000, rate: 0.2 },
        { amount: 1000000, rate: 0.3 },
        { amount: 3000000, rate: 0.36 },
        { amount: Infinity, rate: 0.39 },
      ];

  let remaining = income;
  let tax = 0;

  for (const slab of slabs) {
    if (remaining <= 0) break;

    const taxable = Math.min(remaining, slab.amount);
    tax += taxable * slab.rate;
    remaining -= taxable;
  }

  return round2(tax);
};

const calculateNepalMonthlyTax = ({
  monthlySalary = 0,
  grossPay = 0,
  maritalStatus = "Single",
}) => {
  const annualBase =
    Number(monthlySalary || 0) > 0
      ? Number(monthlySalary || 0) * 12
      : Number(grossPay || 0) * 12;

  const annualTax = calculateNepalAnnualTax(annualBase, maritalStatus);
  const monthlyTax = annualTax / 12;

  return {
    annualIncome: round2(annualBase),
    annualTax: round2(annualTax),
    monthlyTax: round2(monthlyTax),
  };
};

const getEffectiveTaxPercent = (grossPay, monthlyTax) => {
  const gross = Number(grossPay || 0);
  if (gross <= 0) return 0;
  return round2((Number(monthlyTax || 0) / gross) * 100);
};

const buildSalaryBreakdown = ({
  hourlyRate = 0,
  monthlySalary = 0,
  workedMinutes = 0,
  paidLeaveDays = 0,
  month,
  maritalStatus = "Single",
}) => {
  const saturdayCount = getSaturdayCountInMonth(month);

  const weekendMinutes = saturdayCount * WEEKEND_HOURS_PER_DAY * 60;
  const paidLeaveHours = Number(paidLeaveDays || 0) * PAID_LEAVE_HOURS_PER_DAY;
  const paidLeaveMinutes = paidLeaveHours * 60;

  const workedPay = computeHourlyPay({
    hourlyRate,
    totalMinutes: workedMinutes,
  });

  const weekendPay = computeHourlyPay({
    hourlyRate,
    totalMinutes: weekendMinutes,
  });

  const paidLeavePay = computeHourlyPay({
    hourlyRate,
    totalMinutes: paidLeaveMinutes,
  });

  const grossPay = round2(workedPay + weekendPay + paidLeavePay);

  const taxInfo = calculateNepalMonthlyTax({
    monthlySalary,
    grossPay,
    maritalStatus,
  });

  const taxAmount = Math.min(taxInfo.monthlyTax, grossPay);
  const netPay = round2(grossPay - taxAmount);
  const taxPercent = getEffectiveTaxPercent(grossPay, taxAmount);

  return {
    hourlyRate: Number(hourlyRate || 0),
    monthlySalary: Number(monthlySalary || 0),
    maritalStatus: maritalStatus || "Single",

    workedMinutes: Number(workedMinutes || 0),

    weekendDays: saturdayCount,
    weekendHours: saturdayCount * WEEKEND_HOURS_PER_DAY,
    weekendMinutes,

    paidLeaveDays: Number(paidLeaveDays || 0),
    paidLeaveHours,
    paidLeaveMinutes,

    workedPay,
    weekendPay,
    paidLeavePay,
    grossPay,

    taxPercent,
    taxAmount: round2(taxAmount),
    annualTaxableIncome: taxInfo.annualIncome,
    annualTax: taxInfo.annualTax,

    netPay,
  };
};

export const getSalarySummary = async (req, res) => {
  try {
    const month = String(req.query.month || "").trim() || getDefaultMonth();
    const { startWorkDate, endWorkDate } = monthRange(month);

    const employees = await User.find({
      role: "employee",
      status: { $ne: "Inactive" },
    })
      .populate("department", "name code hourlyRate")
      .lean();

    const employeeIds = employees.map((e) => e._id);

    const paidLeaveMap = await getPaidLeaveDaysMap({
      employeeIds,
      month,
    });

    const minutesAgg = await Attendance.aggregate([
      {
        $match: {
          employee: { $in: employeeIds },
          workDate: { $gte: startWorkDate, $lt: endWorkDate },
          punchedOutAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$employee",
          totalMinutes: { $sum: "$totalMinutes" },
        },
      },
    ]);

    const minutesMap = new Map(
      minutesAgg.map((x) => [String(x._id), Number(x.totalMinutes || 0)])
    );

    const payroll = await Payroll.find({
      month,
      employee: { $in: employeeIds },
    }).lean();

    const payrollMap = new Map(payroll.map((p) => [String(p.employee), p]));

    let totalGrossPayroll = 0;
    let totalNetPayroll = 0;
    let totalTax = 0;
    let paidCount = 0;

    for (const emp of employees) {
      const workedMinutes = minutesMap.get(String(emp._id)) || 0;
      const paidLeaveDays = paidLeaveMap.get(String(emp._id)) || 0;
      const hourlyRate = getEffectiveHourlyRate(emp);

      const salary = buildSalaryBreakdown({
        hourlyRate,
        monthlySalary: Number(emp.monthlySalary || 0),
        workedMinutes,
        paidLeaveDays,
        month,
        maritalStatus: emp.maritalStatus || "Single",
      });

      totalGrossPayroll += salary.grossPay;
      totalNetPayroll += salary.netPay;
      totalTax += salary.taxAmount;

      if (payrollMap.get(String(emp._id))?.status === "paid") {
        paidCount++;
      }
    }

    const averageSalary = employees.length
      ? totalNetPayroll / employees.length
      : 0;

    return res.json({
      success: true,
      month,
      stats: {
        totalPayroll: round2(totalNetPayroll),
        totalGrossPayroll: round2(totalGrossPayroll),
        totalTax: round2(totalTax),
        averageSalary: round2(averageSalary),
        employeesPaid: paidCount,
        monthlyGrowth: 0,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Salary summary failed",
    });
  }
};

export const getSalaryEmployees = async (req, res) => {
  try {
    const month = String(req.query.month || "").trim() || getDefaultMonth();
    const { startWorkDate, endWorkDate } = monthRange(month);

    const employees = await User.find({
      role: "employee",
      status: { $ne: "Inactive" },
    })
      .populate("department", "name code hourlyRate")
      .lean();

    const employeeIds = employees.map((e) => e._id);

    const paidLeaveMap = await getPaidLeaveDaysMap({
      employeeIds,
      month,
    });

    const minutesAgg = await Attendance.aggregate([
      {
        $match: {
          employee: { $in: employeeIds },
          workDate: { $gte: startWorkDate, $lt: endWorkDate },
          punchedOutAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$employee",
          totalMinutes: { $sum: "$totalMinutes" },
        },
      },
    ]);

    const minutesMap = new Map(
      minutesAgg.map((x) => [String(x._id), Number(x.totalMinutes || 0)])
    );

    const payroll = await Payroll.find({
      month,
      employee: { $in: employeeIds },
    }).lean();

    const payrollMap = new Map(payroll.map((p) => [String(p.employee), p]));

    const rows = employees.map((emp) => {
      const workedMinutes = minutesMap.get(String(emp._id)) || 0;
      const paidLeaveDays = paidLeaveMap.get(String(emp._id)) || 0;
      const hourlyRate = getEffectiveHourlyRate(emp);

      const salary = buildSalaryBreakdown({
        hourlyRate,
        monthlySalary: Number(emp.monthlySalary || 0),
        workedMinutes,
        paidLeaveDays,
        month,
        maritalStatus: emp.maritalStatus || "Single",
      });

      const pr = payrollMap.get(String(emp._id));

      return {
        employee: {
          _id: emp._id,
          name: emp.name,
          email: emp.email,
          employeeId: emp.employeeId || "",
          maritalStatus: emp.maritalStatus || "Single",
          hourlyRate,
          monthlySalary: Number(emp.monthlySalary || 0),
          department: emp.department
            ? {
                _id: emp.department._id,
                name: emp.department.name,
                code: emp.department.code,
                hourlyRate: Number(emp.department.hourlyRate || 0),
              }
            : null,
        },

        month,

        workedMinutes: salary.workedMinutes,
        totalMinutes: salary.workedMinutes,

        weekendDays: salary.weekendDays,
        weekendHours: salary.weekendHours,
        weekendMinutes: salary.weekendMinutes,

        paidLeaveDays: salary.paidLeaveDays,
        paidLeaveHours: salary.paidLeaveHours,
        paidLeaveMinutes: salary.paidLeaveMinutes,
        paidLeavePay: salary.paidLeavePay,

        hourlyRate: salary.hourlyRate,
        monthlySalary: salary.monthlySalary,
        maritalStatus: salary.maritalStatus,

        workedPay: salary.workedPay,
        weekendPay: salary.weekendPay,
        grossPay: salary.grossPay,

        taxPercent: salary.taxPercent,
        taxAmount: salary.taxAmount,
        annualTaxableIncome: salary.annualTaxableIncome,
        annualTax: salary.annualTax,

        netPay: salary.netPay,

        status: pr?.status || "unpaid",
        paidAt: pr?.paidAt || null,
      };
    });

    return res.json({
      success: true,
      month,
      rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Salary list failed",
    });
  }
};

export const markSalaryPaid = async (req, res) => {
  try {
    const { employeeId, month, notes } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: "employeeId required",
      });
    }

    const monthSafe = String(month || "").trim() || getDefaultMonth();
    const { startWorkDate, endWorkDate } = monthRange(monthSafe);

    const emp = await User.findById(employeeId)
      .populate("department", "name code hourlyRate")
      .lean();

    if (!emp || emp.role !== "employee") {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const minutesAgg = await Attendance.aggregate([
      {
        $match: {
          employee: emp._id,
          workDate: { $gte: startWorkDate, $lt: endWorkDate },
          punchedOutAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$employee",
          totalMinutes: { $sum: "$totalMinutes" },
        },
      },
    ]);

    const workedMinutes = Number(minutesAgg?.[0]?.totalMinutes || 0);

    const paidLeaveMap = await getPaidLeaveDaysMap({
      employeeIds: [emp._id],
      month: monthSafe,
    });

    const paidLeaveDays = paidLeaveMap.get(String(emp._id)) || 0;
    const hourlyRate = getEffectiveHourlyRate(emp);

    const salary = buildSalaryBreakdown({
      hourlyRate,
      monthlySalary: Number(emp.monthlySalary || 0),
      workedMinutes,
      paidLeaveDays,
      month: monthSafe,
      maritalStatus: emp.maritalStatus || "Single",
    });

    const payroll = await Payroll.findOneAndUpdate(
      { employee: emp._id, month: monthSafe },
      {
        $set: {
          employee: emp._id,
          month: monthSafe,

          totalMinutes: salary.workedMinutes,
          workedMinutes: salary.workedMinutes,

          weekendDays: salary.weekendDays,
          weekendHours: salary.weekendHours,
          weekendMinutes: salary.weekendMinutes,

          paidLeaveDays: salary.paidLeaveDays,
          paidLeaveHours: salary.paidLeaveHours,
          paidLeaveMinutes: salary.paidLeaveMinutes,
          paidLeavePay: salary.paidLeavePay,

          workedPay: salary.workedPay,
          weekendPay: salary.weekendPay,
          grossPay: salary.grossPay,

          taxPercent: salary.taxPercent,
          taxAmount: salary.taxAmount,

          netPay: salary.netPay,

          status: "paid",
          paidAt: new Date(),
          notes: notes || "",

          salarySource: "employee",
          salarySnapshot: {
            payType: "hourly",
            hourlyRate: salary.hourlyRate,
            monthlySalary: salary.monthlySalary,
            maritalStatus: salary.maritalStatus,
            annualTaxableIncome: salary.annualTaxableIncome,
            annualTax: salary.annualTax,
            paidLeaveDays: salary.paidLeaveDays,
            paidLeaveHours: salary.paidLeaveHours,
            paidLeavePay: salary.paidLeavePay,
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.json({
      success: true,
      payroll,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Mark paid failed",
    });
  }
};