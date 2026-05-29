import PDFDocument from "pdfkit";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Payroll from "../models/Payroll.js";

const getDefaultMonth = () => new Date().toISOString().slice(0, 7);

const monthRange = (month) => {
  const [year, mon] = month.split("-").map(Number);

  const startWorkDate = `${year}-${String(mon).padStart(2, "0")}-01`;

  const next = new Date(year, mon, 1);
  const endYear = next.getFullYear();
  const endMonth = String(next.getMonth() + 1).padStart(2, "0");
  const endWorkDate = `${endYear}-${endMonth}-01`;

  return { startWorkDate, endWorkDate };
};

const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;

  return {
    hours: h,
    minutes: r,
    label: h > 0 ? `${h}h ${r}m` : `${r}m`,
  };
};

const monthLabel = (ym) => {
  try {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleDateString([], {
      year: "numeric",
      month: "long",
    });
  } catch {
    return ym;
  }
};

const calculateSalary = ({
  workedMinutes = 0,
  weekendHours = 0,
  hourlyRate = 0,
  taxPercent = 2,
}) => {
  const workedHours = Number(workedMinutes || 0) / 60;

  const workedPay = workedHours * Number(hourlyRate || 0);
  const weekendPay = Number(weekendHours || 0) * Number(hourlyRate || 0);

  const grossPay = workedPay + weekendPay;
  const taxAmount = grossPay * (Number(taxPercent || 0) / 100);
  const netPay = grossPay - taxAmount;

  return {
    workedPay,
    weekendPay,
    grossPay,
    taxAmount,
    netPay,
  };
};

export const getMySalary = async (req, res) => {
  try {
    const month = String(req.query.month || "").trim() || getDefaultMonth();
    const userId = req.user._id;

    const emp = await User.findById(userId).populate("department").lean();

    if (!emp || emp.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Employee access only",
      });
    }

    const { startWorkDate, endWorkDate } = monthRange(month);

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

    const totalMinutes = Number(minutesAgg?.[0]?.totalMinutes || 0);
    const worked = minutesToHM(totalMinutes);

    const pr = await Payroll.findOne({ employee: emp._id, month }).lean();

    return res.json({
      success: true,
      month,
      employee: {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        employeeId: emp.employeeId || "",
        department: emp.department?.name || emp.departmentName || "",
        hourlyRate: Number(emp.hourlyRate || 0),
        monthlySalary: Number(emp.monthlySalary || 0),
      },
      work: {
        totalMinutes,
        hours: worked.hours,
        minutes: worked.minutes,
        label: worked.label,
      },
      payroll: {
        workedMinutes: Number(pr?.workedMinutes || totalMinutes),
        weekendDays: Number(pr?.weekendDays || 0),
        weekendHours: Number(pr?.weekendHours || 0),
        workedPay: Number(pr?.workedPay || 0),
        weekendPay: Number(pr?.weekendPay || 0),
        grossPay: Number(pr?.grossPay || 0),
        taxPercent: Number(pr?.taxPercent || 2),
        taxAmount: Number(pr?.taxAmount || 0),
        netPay: Number(pr?.netPay || 0),
        status: pr?.status || "unpaid",
        paidAt: pr?.paidAt || null,
        notes: pr?.notes || "",
        salarySource: pr?.salarySource || "employee",
        salarySnapshot: pr?.salarySnapshot || {
          payType: "hourly",
          hourlyRate: Number(emp.hourlyRate || 0),
          monthlySalary: Number(emp.monthlySalary || 0),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load salary",
    });
  }
};

export const getMySalaryHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const emp = await User.findById(userId).lean();

    if (!emp || emp.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Employee access only",
      });
    }

    const payrollRows = await Payroll.find({ employee: userId })
      .sort({ month: -1 })
      .lean();

    const history = [];

    for (const pr of payrollRows) {
      const { startWorkDate, endWorkDate } = monthRange(pr.month);

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

      const totalMinutes = Number(minutesAgg?.[0]?.totalMinutes || 0);
      const worked = minutesToHM(totalMinutes);

      history.push({
        _id: pr._id,
        month: pr.month,
        monthLabel: monthLabel(pr.month),

        totalMinutes,
        workedLabel: worked.label,

        workedMinutes: Number(pr.workedMinutes || totalMinutes),
        weekendDays: Number(pr.weekendDays || 0),
        weekendHours: Number(pr.weekendHours || 0),

        workedPay: Number(pr.workedPay || 0),
        weekendPay: Number(pr.weekendPay || 0),
        grossPay: Number(pr.grossPay || 0),

        taxPercent: Number(pr.taxPercent || 2),
        taxAmount: Number(pr.taxAmount || 0),
        netPay: Number(pr.netPay || 0),

        status: pr.status || "unpaid",
        paidAt: pr.paidAt,
        notes: pr.notes || "",

        salarySource: pr.salarySource || "employee",
        salarySnapshot: pr.salarySnapshot || {
          payType: "hourly",
          hourlyRate: Number(emp.hourlyRate || 0),
          monthlySalary: Number(emp.monthlySalary || 0),
        },
      });
    }

    return res.json({
      success: true,
      history,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load salary history",
    });
  }
};

export const downloadSalaryReportPdf = async (req, res) => {
  try {
    const month = String(req.query.month || "").trim() || getDefaultMonth();
    const userId = req.user._id;

    const emp = await User.findById(userId).populate("department").lean();

    if (!emp || emp.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Employee access only",
      });
    }

    const { startWorkDate, endWorkDate } = monthRange(month);

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

    const totalMinutes = Number(minutesAgg?.[0]?.totalMinutes || 0);
    const worked = minutesToHM(totalMinutes);

    const pr = await Payroll.findOne({ employee: emp._id, month }).lean();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="salary_report_${month}.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text("Salary Report", { align: "center" });
    doc.moveDown(0.7);

    doc.fontSize(12).text(`Month: ${monthLabel(month)} (${month})`, {
      align: "center",
    });

    doc.moveDown(1.5);
    doc.fontSize(12).text("Employee Details", { underline: true });
    doc.moveDown(0.5);

    doc.text(`Name: ${emp.name}`);
    doc.text(`Email: ${emp.email}`);
    doc.text(`Employee ID: ${emp.employeeId || "—"}`);
    doc.text(`Department: ${emp.department?.name || emp.departmentName || "—"}`);
    doc.text(`Hourly Rate: ${Number(emp.hourlyRate || 0)}`);
    doc.text(`Monthly Salary: ${Number(emp.monthlySalary || 0)}`);

    doc.moveDown(1.2);
    doc.fontSize(12).text("Work Summary", { underline: true });
    doc.moveDown(0.5);

    doc.text(`Worked Time: ${worked.label} (${totalMinutes} minutes)`);
    doc.text(`Weekend Days Paid: ${Number(pr?.weekendDays || 0)}`);
    doc.text(`Weekend Hours Paid: ${Number(pr?.weekendHours || 0)}`);

    doc.moveDown(1.2);
    doc.fontSize(12).text("Salary Calculation", { underline: true });
    doc.moveDown(0.5);

    doc.text(`Worked Pay: ${Number(pr?.workedPay || 0)}`);
    doc.text(`Weekend Pay: ${Number(pr?.weekendPay || 0)}`);
    doc.text(`Gross Pay: ${Number(pr?.grossPay || 0)}`);
    doc.text(`Tax (${Number(pr?.taxPercent || 2)}%): ${Number(pr?.taxAmount || 0)}`);
    doc.fontSize(13).text(`Net Pay: ${Number(pr?.netPay || 0)}`);

    doc.moveDown(1.2);
    doc.fontSize(12).text("Payment Status", { underline: true });
    doc.moveDown(0.5);

    doc.text(`Status: ${pr?.status || "unpaid"}`);
    doc.text(`Paid At: ${pr?.paidAt ? new Date(pr.paidAt).toLocaleString() : "—"}`);
    doc.text(`Notes: ${pr?.notes || "—"}`);

    doc.moveDown(2);
    doc.fontSize(10).fillColor("gray").text("Generated by EMS Payroll System", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate PDF",
    });
  }
};