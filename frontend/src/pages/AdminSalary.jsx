import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Users,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Clock3,
  Building2,
  CalendarDays,
  ReceiptText,
  Percent,
  Plane,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const fmtMoney = (n) => {
  const num = Number(n || 0);
  return `₹ ${num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const monthLabel = (ym) => {
  if (!ym || !ym.includes("-")) return ym || "";
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString([], { year: "numeric", month: "long" });
};

const getDefaultMonth = () => new Date().toISOString().slice(0, 7);

const minsToWorked = (mins) => {
  const total = Number(mins || 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const AdminSalary = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [month, setMonth] = useState(getDefaultMonth());
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalPayroll: 0,
    totalGrossPayroll: 0,
    totalTax: 0,
    averageSalary: 0,
    employeesPaid: 0,
    monthlyGrowth: 0,
  });

  const [rows, setRows] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    type: "ok",
    message: "",
  });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });

    window.setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 2200);
  }, []);

  const headers = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [resSummary, resEmployees] = await Promise.all([
        fetch(
          `${API_BASE}/admin/salary/summary?month=${encodeURIComponent(month)}`,
          { headers }
        ),
        fetch(
          `${API_BASE}/admin/salary/employees?month=${encodeURIComponent(month)}`,
          { headers }
        ),
      ]);

      const summaryData = await safeJson(resSummary);
      const employeesData = await safeJson(resEmployees);

      if (!resSummary.ok) {
        throw new Error(
          summaryData?.error ||
            summaryData?.message ||
            "Failed to load salary summary"
        );
      }

      if (!resEmployees.ok) {
        throw new Error(
          employeesData?.error ||
            employeesData?.message ||
            "Failed to load salary employees"
        );
      }

      setStats(
        summaryData?.stats || {
          totalPayroll: 0,
          totalGrossPayroll: 0,
          totalTax: 0,
          averageSalary: 0,
          employeesPaid: 0,
          monthlyGrowth: 0,
        }
      );

      setRows(Array.isArray(employeesData?.rows) ? employeesData.rows : []);
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [headers, month]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredRows = useMemo(() => {
    const term = String(q || "").trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((r) => {
      const emp = r?.employee || {};
      const dept = emp?.department?.name || "";

      const hay = [emp.name, emp.email, emp.employeeId, dept]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(term);
    });
  }, [q, rows]);

  const paidBadge = (status) => {
    const paid = status === "paid";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          paid
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-amber-500/20 text-amber-400"
        }`}
      >
        {paid ? "Paid" : "Unpaid"}
      </span>
    );
  };

  const markPaid = useCallback(
    async (employeeId) => {
      if (!employeeId || acting) return;

      setActing(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/admin/salary/mark-paid`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            employeeId,
            month,
            notes: "",
          }),
        });

        const data = await safeJson(res);

        if (!res.ok) {
          throw new Error(data?.error || data?.message || "Failed to mark paid");
        }

        showToast("ok", "Marked as Paid ✅");
        await fetchAll();
      } catch (e) {
        const msg = e?.message || "Mark paid failed";
        setError(msg);
        showToast("bad", msg);
      } finally {
        setActing(false);
      }
    },
    [acting, fetchAll, headers, month, showToast]
  );

  const statCards = useMemo(() => {
    const growthText =
      (Number(stats.monthlyGrowth || 0) >= 0 ? "+" : "") +
      `${Number(stats.monthlyGrowth || 0).toFixed(1)}%`;

    return [
      {
        label: "Net Payroll",
        value: fmtMoney(stats.totalPayroll),
        icon: <Wallet className="w-6 h-6 text-white" />,
        bg: "from-indigo-500 to-purple-600",
      },
      {
        label: "Gross Payroll",
        value: fmtMoney(stats.totalGrossPayroll),
        icon: <ReceiptText className="w-6 h-6 text-white" />,
        bg: "from-emerald-500 to-teal-600",
      },
      {
        label: "Total Tax",
        value: fmtMoney(stats.totalTax),
        icon: <Percent className="w-6 h-6 text-white" />,
        bg: "from-amber-500 to-orange-600",
      },
      {
        label: "Employees Paid",
        value: String(stats.employeesPaid || 0),
        icon: <Users className="w-6 h-6 text-white" />,
        bg: "from-pink-500 to-rose-600",
      },
      {
        label: "Average Net Salary",
        value: fmtMoney(stats.averageSalary),
        icon: <IndianRupee className="w-6 h-6 text-white" />,
        bg: "from-sky-500 to-cyan-600",
      },
      {
        label: "Monthly Growth",
        value: growthText,
        icon: <TrendingUp className="w-6 h-6 text-white" />,
        bg: "from-violet-500 to-fuchsia-600",
      },
    ];
  }, [stats]);

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className={`fixed top-5 right-5 z-[999] px-4 py-3 rounded-2xl border ${
              darkMode
                ? "bg-zinc-900/80 border-white/10"
                : "bg-white/90 border-black/10"
            } shadow-xl backdrop-blur flex items-center gap-2`}
          >
            {toast.type === "ok" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <div className="text-sm font-semibold">{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <ArrowLeft
            className="cursor-pointer hover:opacity-70"
            onClick={() => navigate(-1)}
          />

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Salary Management
            </h1>
            <p
              className={`text-sm ${
                darkMode ? "text-white/60" : "text-zinc-600"
              }`}
            >
              {monthLabel(month)} • Attendance + paid Saturdays + approved paid
              leave - tax
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`px-3 py-2 rounded-xl border ${
              darkMode
                ? "border-white/10 bg-zinc-900"
                : "border-black/10 bg-white"
            }`}
          >
            <label
              className={`text-xs font-semibold ${
                darkMode ? "text-white/60" : "text-zinc-600"
              }`}
            >
              Month
            </label>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={`ml-2 bg-transparent outline-none font-semibold ${
                darkMode ? "text-white" : "text-zinc-900"
              }`}
            />
          </div>

          <button
            onClick={fetchAll}
            disabled={loading}
            className={`px-4 py-2 rounded-xl border font-semibold flex items-center gap-2 transition ${
              darkMode
                ? "bg-zinc-900 border-white/10 hover:bg-zinc-800"
                : "bg-white border-black/10 hover:bg-zinc-50"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div
          className={`mb-6 p-4 rounded-2xl border ${
            darkMode
              ? "bg-zinc-900 border-white/10"
              : "bg-white border-black/10"
          }`}
        >
          <div className="text-sm font-semibold text-rose-400">{error}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl p-5 bg-gradient-to-br ${stat.bg} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {loading ? "…" : stat.value}
                </h3>
              </div>

              <div className="bg-white/20 p-3 rounded-xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div
        className={`mb-4 rounded-2xl p-4 border ${
          darkMode ? "bg-zinc-900 border-white/10" : "bg-white border-black/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              darkMode ? "bg-white/5" : "bg-black/5"
            }`}
          >
            <Search className="w-4 h-4" />
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, employeeId, department..."
            className={`w-full bg-transparent outline-none text-sm font-semibold ${
              darkMode ? "placeholder:text-white/40" : "placeholder:text-zinc-500"
            }`}
          />

          <div
            className={`text-xs font-semibold ${
              darkMode ? "text-white/50" : "text-zinc-500"
            }`}
          >
            {filteredRows.length}/{rows.length}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-6 shadow-xl ${
          darkMode ? "bg-zinc-900" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="text-lg font-semibold">Employee Salary List</h2>

          <div
            className={`text-xs font-semibold ${
              darkMode ? "text-white/60" : "text-zinc-600"
            }`}
          >
            Month: {monthLabel(month)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1250px]">
            <thead>
              <tr
                className={`text-left border-b ${
                  darkMode ? "border-white/10" : "border-black/10"
                }`}
              >
                <th className="pb-3">Employee</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Rate</th>
                <th className="pb-3">Worked</th>
                <th className="pb-3">Weekends</th>
                <th className="pb-3">Paid Leave</th>
                <th className="pb-3">Gross</th>
                <th className="pb-3">Tax</th>
                <th className="pb-3">Net</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-6 text-center opacity-70 font-semibold"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredRows.length ? (
                filteredRows.map((r) => {
                  const emp = r?.employee || {};
                  const dept = emp?.department?.name || "—";
                  const status = r?.status || "unpaid";
                  const workedMins = Number(r?.workedMinutes || 0);
                  const worked = minsToWorked(workedMins);

                  const hourlyRate = Number(
                    r?.hourlyRate || emp?.department?.hourlyRate || emp?.hourlyRate || 0
                  );

                  return (
                    <tr
                      key={emp._id}
                      className={`border-b transition ${
                        darkMode
                          ? "border-white/5 hover:bg-white/5"
                          : "border-black/5 hover:bg-black/5"
                      }`}
                    >
                      <td className="py-3 pr-4">
                        <div className="font-semibold">{emp.name || "—"}</div>

                        <div
                          className={`text-xs ${
                            darkMode ? "text-white/50" : "text-zinc-500"
                          }`}
                        >
                          {emp.email || "—"}{" "}
                          {emp.employeeId ? `• ID: ${emp.employeeId}` : ""}
                        </div>
                      </td>

                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 opacity-70" />
                          <span>{dept}</span>
                        </div>
                      </td>

                      <td className="py-3 pr-4 font-semibold">
                        {fmtMoney(hourlyRate)}/hr
                      </td>

                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-4 h-4 opacity-70" />

                          <div>
                            <div>{worked}</div>
                            <div className="text-xs opacity-60">
                              {fmtMoney(r?.workedPay)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 opacity-70" />

                          <div>
                            <div>{Number(r?.weekendDays || 0)} Saturdays</div>
                            <div className="text-xs opacity-60">
                              {Number(r?.weekendHours || 0)} hrs •{" "}
                              {fmtMoney(r?.weekendPay)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 opacity-70" />

                          <div>
                            <div>{Number(r?.paidLeaveDays || 0)} day(s)</div>
                            <div className="text-xs opacity-60">
                              {Number(r?.paidLeaveHours || 0)} hrs •{" "}
                              {fmtMoney(r?.paidLeavePay)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 pr-4 font-semibold">
                        {fmtMoney(r?.grossPay)}
                      </td>

                      <td className="py-3 pr-4">
                        <div>
                          <div>{Number(r?.taxPercent || 0)}%</div>
                          <div className="text-xs opacity-60">
                            {fmtMoney(r?.taxAmount)}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 pr-4 font-bold text-emerald-500">
                        {fmtMoney(r?.netPay)}
                      </td>

                      <td className="py-3 pr-4">{paidBadge(status)}</td>

                      <td className="py-3 text-right">
                        {status === "paid" ? (
                          <span
                            className={`text-xs font-semibold ${
                              darkMode ? "text-white/50" : "text-zinc-500"
                            }`}
                          >
                            —
                          </span>
                        ) : (
                          <button
                            disabled={acting}
                            onClick={() => markPaid(emp._id)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                              darkMode
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/20 hover:bg-emerald-500/20"
                                : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15"
                            } ${acting ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            {acting ? "Processing..." : "Mark Paid"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="py-6 text-center opacity-70 font-semibold"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSalary;