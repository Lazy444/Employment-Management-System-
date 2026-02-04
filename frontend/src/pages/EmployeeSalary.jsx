import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  Receipt,
  BadgeDollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// ✅ If your server mounts: app.use("/api/employees", employeeRoutes)
// Then your salary endpoint can be like: GET /api/employees/salary or /api/employees/salary?month=...
const API_BASE = "http://localhost:5000/api";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const formatMoney = (n) => {
  const num = Number(n || 0);
  try {
    return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
};

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
};

// ---------- Demo salary data (works without backend) ----------
const DEMO_SALARY = [
  {
    _id: "sal_2026_01",
    month: "2026-01",
    payDate: "2026-02-01",
    base: 2200,
    overtime: 120,
    bonus: 80,
    deductions: 150,
    status: "Paid",
    notes: "Monthly payroll processed successfully.",
  },
  {
    _id: "sal_2025_12",
    month: "2025-12",
    payDate: "2026-01-01",
    base: 2200,
    overtime: 0,
    bonus: 50,
    deductions: 120,
    status: "Paid",
    notes: "Includes holiday adjustment.",
  },
  {
    _id: "sal_2025_11",
    month: "2025-11",
    payDate: "2025-12-01",
    base: 2200,
    overtime: 90,
    bonus: 0,
    deductions: 110,
    status: "Paid",
    notes: "Overtime included.",
  },
  {
    _id: "sal_2025_10",
    month: "2025-10",
    payDate: "2025-11-01",
    base: 2200,
    overtime: 30,
    bonus: 0,
    deductions: 95,
    status: "Paid",
    notes: "Standard payroll.",
  },
];

const pill = (status) => {
  const base =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border";
  if (status === "Paid")
    return `${base} bg-emerald-500/10 text-emerald-300 border-emerald-500/30`;
  if (status === "Pending")
    return `${base} bg-amber-500/10 text-amber-300 border-amber-500/30`;
  if (status === "On Hold")
    return `${base} bg-rose-500/10 text-rose-300 border-rose-500/30`;
  return `${base} bg-slate-500/10 text-slate-200 border-slate-500/20`;
};

export default function EmployeeSalary() {
  const navigate = useNavigate();

  const employeeName = localStorage.getItem("employeeName") || "employee";
  const initials = getInitials(employeeName);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState({ type: "", msg: "" });

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    window.clearTimeout(window.__empSalaryToastTimer);
    window.__empSalaryToastTimer = window.setTimeout(
      () => setToast({ type: "", msg: "" }),
      2500
    );
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    navigate("/employee-login", { replace: true });
  };

  const calcNet = (s) => {
    const base = Number(s.base || 0);
    const overtime = Number(s.overtime || 0);
    const bonus = Number(s.bonus || 0);
    const deductions = Number(s.deductions || 0);
    return base + overtime + bonus - deductions;
  };

  // ✅ Fetch salary from backend (optional), fallback to demo
  const fetchSalary = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/employee-login");
        return;
      }

      // --------------------------
      // If you ALREADY have a backend salary endpoint,
      // uncomment this and update endpoint.
      //
      // const qs = new URLSearchParams();
      // if (monthFilter !== "All") qs.set("month", monthFilter);
      // if (statusFilter !== "All") qs.set("status", statusFilter);
      //
      // const res = await fetch(`${API_BASE}/employees/salary?${qs.toString()}`, {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      //
      // if (res.status === 401 || res.status === 403) {
      //   localStorage.removeItem("token");
      //   navigate("/employee-login");
      //   return;
      // }
      //
      // const text = await res.text();
      // const data = text ? JSON.parse(text) : {};
      // setRows(Array.isArray(data?.salary) ? data.salary : []);
      // --------------------------

      // ✅ Demo fallback (works now)
      setRows(DEMO_SALARY);
    } catch (e) {
      setRows([]);
      showToast("error", "Failed to load salary");
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    fetchSalary();
  }, [fetchSalary]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const okMonth = monthFilter === "All" ? true : r.month === monthFilter;
      const okStatus =
        statusFilter === "All" ? true : String(r.status) === String(statusFilter);
      return okMonth && okStatus;
    });
  }, [rows, monthFilter, statusFilter]);

  const months = useMemo(() => {
    const set = new Set(rows.map((r) => r.month));
    return ["All", ...Array.from(set).sort().reverse()];
  }, [rows]);

  const statuses = useMemo(() => {
    const set = new Set(rows.map((r) => r.status));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const stats = useMemo(() => {
    const totalPayslips = filteredRows.length;
    const netTotal = filteredRows.reduce((sum, s) => sum + calcNet(s), 0);
    const last = filteredRows[0];
    const lastNet = last ? calcNet(last) : 0;
    const avgNet = totalPayslips ? netTotal / totalPayslips : 0;

    const trend =
      filteredRows.length >= 2 ? calcNet(filteredRows[0]) - calcNet(filteredRows[1]) : 0;

    return {
      totalPayslips,
      netTotal,
      lastNet,
      avgNet,
      trend,
    };
  }, [filteredRows]);

  const exportCSV = () => {
    try {
      const header = [
        "Month",
        "Pay Date",
        "Base",
        "Overtime",
        "Bonus",
        "Deductions",
        "Net",
        "Status",
        "Notes",
      ];
      const lines = filteredRows.map((s) => [
        s.month,
        s.payDate,
        s.base,
        s.overtime,
        s.bonus,
        s.deductions,
        calcNet(s),
        s.status,
        (s.notes || "").replaceAll("\n", " "),
      ]);

      const csv = [header, ...lines]
        .map((row) =>
          row
            .map((cell) => {
              const v = String(cell ?? "");
              const needsQuotes = v.includes(",") || v.includes('"') || v.includes("\n");
              const escaped = v.replaceAll('"', '""');
              return needsQuotes ? `"${escaped}"` : escaped;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "salary_export.csv";
      a.click();
      URL.revokeObjectURL(url);

      showToast("success", "CSV downloaded");
    } catch {
      showToast("error", "Failed to export CSV");
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-20 right-[-120px] w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="w-[280px] min-h-screen border-r border-white/10 bg-gradient-to-b from-[#0B1024] to-[#070B18]">
          <div className="px-6 pt-6 pb-4">
            <div className="text-emerald-300 font-extrabold tracking-widest text-sm">
              EMPLOYEE MS
            </div>
            <div className="text-slate-400 text-xs mt-1">Employee Portal</div>
          </div>

          <div className="px-4 mt-2 space-y-2">
            <button
              onClick={() => navigate("/employeeprofile")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-white/0 hover:bg-white/5 border border-white/0 hover:border-white/10 transition"
            >
              <UserCircle2 className="w-4 h-4 text-emerald-200" />
              <span className="text-sm font-semibold text-emerald-100">My Profile</span>
            </button>

            <button
              onClick={() => navigate("/employeeleave")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-white/0 hover:bg-white/5 border border-white/0 hover:border-white/10 transition"
            >
              <CalendarDays className="w-4 h-4 text-slate-200" />
              <span className="text-sm">Leave</span>
            </button>

            <button
              onClick={() => navigate("/employeesalary")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-emerald-500/15 border border-emerald-500/25"
            >
              <WalletCards className="w-4 h-4 text-slate-200" />
              <span className="text-sm">Salary</span>
            </button>

            <button
              onClick={() => navigate("/employeesettings")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-white/0 hover:bg-white/5 border border-white/0 hover:border-white/10 transition"
            >
              <Settings className="w-4 h-4 text-slate-200" />
              <span className="text-sm">Setting</span>
            </button>
          </div>

          <div className="absolute bottom-5 left-4 right-4">
            <button
              onClick={logout}
              className="w-24 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-200" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="h-16 px-8 flex items-center justify-between border-b border-white/10 bg-white/0">
            <div className="text-slate-300 text-sm tracking-wide">
              Welcome, <span className="text-white font-semibold">{employeeName}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                title="Theme"
              >
                <span className="text-slate-200 text-sm">☼</span>
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
              >
                Logout
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 grid place-items-center">
                <span className="font-bold text-emerald-200">{getInitials(employeeName)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-slate-400 uppercase">
                  Salary
                </div>
                <h1 className="text-3xl font-extrabold mt-1">Salary & Payslips</h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportCSV}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-slate-200" />
                  Export CSV
                </button>

                <button
                  onClick={() => {
                    showToast("success", "Payslip download (demo)");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/20 transition shadow-[0_0_18px_rgba(16,185,129,0.08)]"
                >
                  + Download Latest
                </button>
              </div>
            </div>

            {/* Toast */}
            {toast.msg ? (
              <div
                className={`mb-6 rounded-2xl border px-4 py-3 flex items-center gap-2 ${
                  toast.type === "success"
                    ? "border-emerald-500/25 bg-emerald-500/10"
                    : "border-rose-500/25 bg-rose-500/10"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-200" />
                )}
                <span className="text-sm text-slate-100">{toast.msg}</span>
              </div>
            ) : null}

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Payslips</div>
                <div className="text-2xl font-bold mt-1">{stats.totalPayslips}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Latest Net</div>
                <div className="text-2xl font-bold mt-1 text-emerald-200">
                  {formatMoney(stats.lastNet)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Average Net</div>
                <div className="text-2xl font-bold mt-1 text-cyan-200">
                  {formatMoney(stats.avgNet)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Trend</div>
                <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                  {stats.trend >= 0 ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-emerald-200" />
                      <span className="text-emerald-200">{formatMoney(stats.trend)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-rose-200" />
                      <span className="text-rose-200">{formatMoney(stats.trend)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-[220px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-100"
                  >
                    {months.map((m) => (
                      <option key={m} value={m} className="bg-[#0B1024]">
                        {m === "All" ? "All Months" : m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-[180px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-100"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s} className="bg-[#0B1024]">
                        {s === "All" ? "All Status" : s}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={fetchSalary}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm flex items-center gap-2"
                >
                  <Filter className="w-4 h-4 text-slate-200" />
                  Apply
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Showing <span className="text-slate-200 font-semibold">{filteredRows.length}</span>{" "}
                payslip(s)
              </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-left text-xs font-semibold text-slate-300">
                      <th className="px-6 py-4">MONTH</th>
                      <th className="px-6 py-4">PAY DATE</th>
                      <th className="px-6 py-4">BASE</th>
                      <th className="px-6 py-4">OT</th>
                      <th className="px-6 py-4">BONUS</th>
                      <th className="px-6 py-4">DEDUCTIONS</th>
                      <th className="px-6 py-4">NET</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4">ACTION</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-300" colSpan={9}>
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                            Loading salary...
                          </div>
                        </td>
                      </tr>
                    ) : filteredRows.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-300" colSpan={9}>
                          No salary records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((s) => {
                        const net = calcNet(s);
                        return (
                          <tr key={s._id} className="hover:bg-white/5 transition">
                            <td className="px-6 py-4 text-slate-100 font-medium">{s.month}</td>
                            <td className="px-6 py-4 text-slate-200">{formatDate(s.payDate)}</td>
                            <td className="px-6 py-4 text-slate-200">{formatMoney(s.base)}</td>
                            <td className="px-6 py-4 text-slate-200">{formatMoney(s.overtime)}</td>
                            <td className="px-6 py-4 text-slate-200">{formatMoney(s.bonus)}</td>
                            <td className="px-6 py-4 text-slate-200">{formatMoney(s.deductions)}</td>
                            <td className="px-6 py-4 text-slate-100 font-semibold">
                              {formatMoney(net)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={pill(s.status)}>{s.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => showToast("success", "Payslip opened (demo)")}
                                className="px-3 py-1.5 rounded-xl text-sm font-semibold border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15 transition inline-flex items-center gap-2"
                              >
                                <Receipt className="w-4 h-4" />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between gap-3">
                <div>
                  Total Net (filtered):{" "}
                  <span className="text-slate-100 font-semibold">
                    {formatMoney(stats.netTotal)}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 text-slate-400">
                  <BadgeDollarSign className="w-4 h-4 text-emerald-200" />
                  Payroll shown for your account (demo / backend-ready)
                </div>
              </div>
            </div>

            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}
