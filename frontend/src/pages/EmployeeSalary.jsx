/* eslint-disable no-unused-vars */
// src/pages/EmployeeSalary.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  FileDown,
  RefreshCw,
  BadgeDollarSign,
  TrendingUp,
  Receipt,
  BookMarked,
  Calendar,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Bell,
  SunMedium,
  MoonStar,
  Menu,
  X,
  DollarSign,
  Zap,
  Eye,
  ChevronDown,
  CreditCard,
  Banknote,
  History,
  Percent,
  CalendarClock,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const monthLabel = (ym) => {
  if (!ym || !ym.includes("-")) return ym || "—";
  try {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleDateString([], { year: "numeric", month: "long" });
  } catch {
    return ym;
  }
};

const fmtMoney = (n) => {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  } catch {
    return `₹ ${num.toFixed(2)}`;
  }
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  return { h, r, label: h > 0 ? `${h}h ${r}m` : `${r}m` };
};

const navItems = [
  { label: "My Profile", icon: UserCircle2, path: "/employeeprofile" },
  { label: "Leave", icon: CalendarDays, path: "/employeeleave" },
  { label: "Salary", icon: WalletCards, path: "/employeesalary", active: true },
  { label: "Calendar", icon: Calendar, path: "/calender" },
  { label: "Punch Clock", icon: Clock, path: "/punch-clock" },
  { label: "Message", icon: MessageCircle, path: "/message" },
  { label: "Manager Dashboard", icon: BookMarked, path: "/employeemanager" },
  { label: "Settings", icon: Settings, path: "/employeesettings" },
];

export default function EmployeeSalary() {
  const navigate = useNavigate();

  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  const bgMain = darkMode
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";

  const cardBg = darkMode
    ? "bg-slate-900/85 border-slate-800"
    : "bg-white/95 border-slate-200";

  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  const navBg = darkMode
    ? "bg-slate-950 border-slate-800 text-slate-50"
    : "bg-white border-slate-200 text-slate-900";

  const headerBg = darkMode
    ? "bg-slate-900/80 border-slate-800"
    : "bg-white/80 border-slate-200";

  const softBg = darkMode ? "bg-slate-900/70" : "bg-slate-50";
  const softBorder = darkMode ? "border-slate-800" : "border-slate-200";
  const hoverBg = darkMode ? "hover:bg-slate-800/70" : "hover:bg-slate-100";
  const inputBg = darkMode
    ? "border-slate-800 bg-slate-950 text-white"
    : "border-slate-200 bg-white text-slate-900";
  const commonTransition = "transition-all duration-300 ease-in-out";

  const employeeName = localStorage.getItem("employeeName") || "Employee";
  const initials = getInitials(employeeName);
  const firstName = employeeName.split(" ")[0];

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rows, setRows] = useState([]);
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState({ type: "", msg: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    window.clearTimeout(window.__empSalaryToastTimer);
    window.__empSalaryToastTimer = window.setTimeout(
      () => setToast({ type: "", msg: "" }),
      2400
    );
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    navigate("/employee-login", { replace: true });
  }, [navigate]);

  const fetchSalaryHistory = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return logout();

      const res = await fetch(`${API_BASE}/employees/salary/history`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) return logout();

      const data = await res.json();
      setRows(Array.isArray(data?.history) ? data.history : []);
    } catch (e) {
      setRows([]);
      showToast("error", "Failed to load salary history");
    } finally {
      setLoading(false);
    }
  }, [logout, showToast]);

  useEffect(() => {
    fetchSalaryHistory();
  }, [fetchSalaryHistory]);

  const months = useMemo(() => {
    const set = new Set((rows || []).map((r) => r.month).filter(Boolean));
    return ["All", ...Array.from(set).sort().reverse()];
  }, [rows]);

  const statuses = useMemo(() => {
    const set = new Set((rows || []).map((r) => r.status).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = String(q || "").trim().toLowerCase();

    return (rows || []).filter((r) => {
      const okMonth = monthFilter === "All" ? true : r.month === monthFilter;
      const okStatus =
        statusFilter === "All" ? true : String(r.status) === String(statusFilter);

      if (!okMonth || !okStatus) return false;
      if (!term) return true;

      const hay = [
        r.month,
        r.monthLabel,
        r.status,
        r.notes,
        String(r.grossPay),
        String(r.netPay),
        String(r.taxAmount),
        String(r.totalMinutes),
        r.workedLabel,
        fmtDate(r.paidAt),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(term);
    });
  }, [rows, monthFilter, statusFilter, q]);

  const stats = useMemo(() => {
    const total = filteredRows.length;

    const grossTotal = filteredRows.reduce(
      (sum, r) => sum + Number(r.grossPay || 0),
      0
    );

    const netTotal = filteredRows.reduce(
      (sum, r) => sum + Number(r.netPay || 0),
      0
    );

    const taxTotal = filteredRows.reduce(
      (sum, r) => sum + Number(r.taxAmount || 0),
      0
    );

    const totalMinutes = filteredRows.reduce(
      (sum, r) => sum + Number(r.totalMinutes || 0),
      0
    );

    const worked = minutesToHM(totalMinutes);

    const avg = total ? netTotal / total : 0;

    const paidCount = filteredRows.filter(
      (r) => String(r.status || "").toLowerCase() === "paid"
    ).length;

    const unpaidCount = total - paidCount;

    const paidAmount = filteredRows
      .filter((r) => String(r.status || "").toLowerCase() === "paid")
      .reduce((sum, r) => sum + Number(r.netPay || 0), 0);

    const unpaidAmount = netTotal - paidAmount;

    return {
      total,
      paidCount,
      unpaidCount,
      grossTotal,
      netTotal,
      taxTotal,
      avg,
      workedLabel: worked.label,
      paidAmount,
      unpaidAmount,
      totalHours: worked.h + worked.r / 60,
    };
  }, [filteredRows]);

  const statusPillClass = (status) => {
    const s = String(status || "unpaid").toLowerCase();
    const base =
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border";

    if (s === "paid") {
      return `${base} bg-emerald-500/15 text-emerald-500 border-emerald-500/30`;
    }

    return `${base} bg-amber-500/15 text-amber-500 border-amber-500/30`;
  };

  const chip = (tone = "cyan") => {
    const base =
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border";

    const tones = {
      green: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      cyan: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
      amber: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      purple: "bg-purple-500/15 text-purple-500 border-purple-500/30",
      rose: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    };

    return `${base} ${tones[tone] || tones.cyan}`;
  };

  const exportCSV = () => {
    try {
      const header = [
        "Month",
        "Worked",
        "Worked Minutes",
        "Weekend Days",
        "Weekend Hours",
        "Worked Pay",
        "Weekend Pay",
        "Gross Pay",
        "Tax Percent",
        "Tax Amount",
        "Net Pay",
        "Status",
        "Paid At",
        "Notes",
      ];

      const lines = filteredRows.map((r) => [
        r.month,
        r.workedLabel || minutesToHM(r.totalMinutes).label,
        r.totalMinutes || 0,
        r.weekendDays || 0,
        r.weekendHours || 0,
        r.workedPay || 0,
        r.weekendPay || 0,
        r.grossPay || 0,
        r.taxPercent || 0,
        r.taxAmount || 0,
        r.netPay || 0,
        r.status || "unpaid",
        r.paidAt || "",
        (r.notes || "").replaceAll("\n", " "),
      ]);

      const csv = [header, ...lines]
        .map((row) =>
          row
            .map((cell) => {
              const v = String(cell ?? "");
              const needsQuotes =
                v.includes(",") || v.includes('"') || v.includes("\n");
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
      a.download = "salary_history.csv";
      a.click();
      URL.revokeObjectURL(url);

      showToast("success", "CSV downloaded");
    } catch {
      showToast("error", "Failed to export CSV");
    }
  };

  const downloadPdf = async (month) => {
    const m = month || new Date().toISOString().slice(0, 7);
    const token = localStorage.getItem("token");
    if (!token) return logout();

    setActing(true);

    try {
      const res = await fetch(
        `${API_BASE}/employees/salary/report.pdf?month=${encodeURIComponent(m)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401 || res.status === 403) return logout();
      if (!res.ok) throw new Error("PDF download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `salary_report_${m}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      showToast("success", "PDF downloaded");
    } catch (e) {
      showToast("error", e?.message || "PDF download failed");
    } finally {
      setActing(false);
    }
  };

  const viewDetails = (row) => {
    setSelectedMonth(row);
    setShowDetailsModal(true);
  };

  return (
    <div className={`min-h-screen overflow-hidden ${bgMain} ${commonTransition}`}>
      <div className="relative flex min-h-screen">
        <aside
          className={`hidden lg:flex w-[280px] xl:w-[300px] flex-col fixed inset-y-0 left-0 z-30 border-r backdrop-blur-xl ${navBg} ${commonTransition}`}
        >
          <div className={`px-6 py-6 border-b ${softBorder}`}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black flex items-center justify-center">
                EMS
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-[0.18em] text-emerald-500">
                  EMPLOYEE MS
                </h1>
                <p className={`text-xs mt-1 ${subText}`}>Smart portal</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 flex-1 overflow-y-auto">
            <div className={`mb-6 rounded-2xl border p-4 ${cardBg}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/20 flex items-center justify-center">
                  <span className="font-bold text-emerald-500 text-lg">
                    {initials}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{employeeName}</p>
                  <p className={`text-xs truncate ${subText}`}>Salary Dashboard</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`group w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left ${commonTransition} ${
                      item.active
                        ? "bg-amber-500 text-white shadow-md"
                        : `${darkMode ? "text-slate-200" : "text-slate-700"} ${hoverBg}`
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        item.active
                          ? "bg-white/20 text-white"
                          : darkMode
                          ? "bg-slate-900 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className={`p-4 border-t ${softBorder}`}>
            <button
              onClick={logout}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${commonTransition} ${
                darkMode
                  ? "border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                  : "border-rose-300 text-rose-600 hover:bg-rose-50"
              }`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-[280px] xl:ml-[300px] flex flex-col">
          <div
            className={`sticky top-0 z-20 border-b backdrop-blur-xl ${headerBg} ${commonTransition}`}
          >
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border ${softBorder} ${softBg} ${hoverBg} ${commonTransition}`}
                >
                  <Menu className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className={`hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-xl border ${softBorder} ${softBg} ${hoverBg} ${commonTransition}`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <p className={`text-[10px] uppercase tracking-[0.2em] ${subText}`}>
                      Salary Management
                    </p>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    Welcome back, {firstName} 👋
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative h-10 w-10 rounded-xl border flex items-center justify-center ${softBorder} ${softBg} ${hoverBg} ${commonTransition}`}
                  >
                    <Bell className="w-4 h-4" />
                    {stats.unpaidCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {stats.unpaidCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl z-50 ${cardBg}`}
                      >
                        <div className={`p-4 border-b ${softBorder}`}>
                          <p className="text-sm font-semibold">Notifications</p>
                        </div>
                        <div className="p-4">
                          {stats.unpaidCount > 0 ? (
                            <div className={`text-xs ${subText}`}>
                              You have {stats.unpaidCount} unpaid salary record
                              {stats.unpaidCount > 1 ? "s" : ""}
                            </div>
                          ) : (
                            <div className={`text-xs ${subText}`}>
                              ✅ All salaries are up to date
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={toggleTheme}
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center ${softBorder} ${softBg} ${hoverBg} ${commonTransition}`}
                >
                  {darkMode ? (
                    <SunMedium className="w-4 h-4" />
                  ) : (
                    <MoonStar className="w-4 h-4" />
                  )}
                </button>

                <div
                  className={`hidden md:flex items-center gap-3 rounded-xl border px-3 py-1.5 ${softBorder} ${softBg}`}
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-500/20 flex items-center justify-center">
                    <span className="font-bold text-emerald-500 text-sm">
                      {initials}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {employeeName}
                    </p>
                    <p className={`text-xs ${subText}`}>Salary Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`rounded-3xl border p-6 md:p-8 ${cardBg}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <WalletCards className="w-5 h-5 text-amber-500" />
                      <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                        Salary Overview
                      </p>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Professional salary management
                    </h1>
                    <p className={`mt-2 text-sm max-w-2xl ${subText}`}>
                      View your worked time, paid Saturdays, tax deduction,
                      admin-approved payroll status, and download salary PDFs.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={fetchSalaryHistory}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium ${softBorder} ${softBg} ${hoverBg}`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>

                    <button
                      onClick={exportCSV}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium ${softBorder} ${softBg} ${hoverBg}`}
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>

                    <button
                      onClick={() =>
                        downloadPdf(monthFilter !== "All" ? monthFilter : undefined)
                      }
                      disabled={acting}
                      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 font-semibold text-slate-950 shadow-lg ${
                        acting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      <FileDown className="w-4 h-4" />
                      {acting ? "Preparing..." : "Download PDF"}
                    </button>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {toast.msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`rounded-2xl border px-4 py-3 flex items-center gap-2 ${
                      toast.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {toast.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{toast.msg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Receipt} label="Total Records" value={stats.total} cardBg={cardBg} subText={subText} tone="amber" />
                <StatCard icon={CheckCircle2} label="Paid Months" value={stats.paidCount} cardBg={cardBg} subText={subText} tone="emerald" />
                <StatCard icon={Clock} label="Worked Hours" value={`${stats.totalHours.toFixed(1)}h`} cardBg={cardBg} subText={subText} tone="cyan" />
                <StatCard icon={DollarSign} label="Total Net Earnings" value={fmtMoney(stats.netTotal)} cardBg={cardBg} subText={subText} tone="purple" small />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <MoneyCard icon={Banknote} title="Paid Amount" subtitle={`${stats.paidCount} months paid`} value={fmtMoney(stats.paidAmount)} tone="emerald" />
                <MoneyCard icon={AlertTriangle} title="Pending Amount" subtitle={`${stats.unpaidCount} months pending`} value={fmtMoney(stats.unpaidAmount)} tone="amber" />
                <MoneyCard icon={Percent} title="Total Tax" subtitle="Nepal tax slab deduction" value={fmtMoney(stats.taxTotal)} tone="rose" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-3xl border p-5 ${cardBg}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex flex-wrap gap-3">
                    <SelectBox value={monthFilter} onChange={setMonthFilter} darkMode={darkMode} inputBg={inputBg} subText={subText}>
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m === "All" ? "📅 All Months" : `${monthLabel(m)} (${m})`}
                        </option>
                      ))}
                    </SelectBox>

                    <SelectBox value={statusFilter} onChange={setStatusFilter} darkMode={darkMode} inputBg={inputBg} subText={subText}>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s === "All"
                            ? "🔍 All Status"
                            : s === "paid"
                            ? "✅ Paid"
                            : "⏳ Unpaid"}
                        </option>
                      ))}
                    </SelectBox>

                    <span className={chip("green")}>
                      <BadgeDollarSign className="w-4 h-4" />
                      Net: {fmtMoney(stats.netTotal)}
                    </span>

                    <span className={chip("purple")}>
                      <TrendingUp className="w-4 h-4" />
                      Avg Net: {fmtMoney(stats.avg)}
                    </span>
                  </div>

                  <div className="lg:ml-auto relative flex-1 lg:flex-initial">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search month, notes, status, amount..."
                      className={`w-full lg:w-[320px] pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none ${inputBg}`}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className={`rounded-3xl border overflow-hidden ${cardBg}`}
              >
                <div className={`px-6 py-5 border-b ${softBorder} flex items-center justify-between gap-3 flex-wrap`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <History className="w-5 h-5 text-amber-500" />
                      <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                        Payslip Records
                      </p>
                    </div>
                    <h3 className="text-xl font-semibold">Salary history</h3>
                    <p className={`mt-1 text-sm ${subText}`}>
                      Showing <span className="font-semibold">{filteredRows.length}</span> record(s)
                    </p>
                  </div>

                  <div className={`text-xs flex items-center gap-2 ${subText}`}>
                    <Zap className="w-3 h-3 text-amber-500" />
                    Salary matches admin payroll record
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={darkMode ? "bg-slate-950/60" : "bg-slate-50"}>
                      <tr className={`text-left text-xs font-semibold ${subText}`}>
                        <th className="px-6 py-4">MONTH</th>
                        <th className="px-6 py-4">WORKED</th>
                        <th className="px-6 py-4">WEEKENDS</th>
                        <th className="px-6 py-4">PAY</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4">PAID AT</th>
                        <th className="px-6 py-4">NOTES</th>
                        <th className="px-6 py-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody className={darkMode ? "divide-y divide-slate-800" : "divide-y divide-slate-200"}>
                      {loading ? (
                        <tr>
                          <td className={`px-6 py-12 ${subText}`} colSpan={8}>
                            <div className="flex items-center justify-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                              <span className="text-sm">Loading salary history...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredRows.length === 0 ? (
                        <tr>
                          <td className={`px-6 py-12 text-center ${subText}`} colSpan={8}>
                            No salary records found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((r, idx) => (
                          <tr key={r._id || `${r.month}-${idx}`} className={hoverBg}>
                            <td className="px-6 py-4">
                              <div className="font-semibold">{r.month}</div>
                              <div className={`text-xs mt-1 ${subText}`}>
                                {r.monthLabel || monthLabel(r.month)}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="inline-flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cyan-500" />
                                <span className="font-semibold">
                                  {r.workedLabel || minutesToHM(r.totalMinutes).label}
                                </span>
                              </div>
                              <div className={`text-xs mt-1 ${subText}`}>
                                {Number(r.totalMinutes || 0)} minutes
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="inline-flex items-center gap-2">
                                <CalendarClock className="w-4 h-4 text-violet-500" />
                                <span className="font-semibold">
                                  {Number(r.weekendDays || 0)} Saturdays
                                </span>
                              </div>
                              <div className={`text-xs mt-1 ${subText}`}>
                                {Number(r.weekendHours || 0)} hrs paid
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="font-bold text-base">
                                Gross: {fmtMoney(r.grossPay)}
                              </div>
                              <div className={`text-xs mt-1 ${subText}`}>
                                Tax: {fmtMoney(r.taxAmount)} ({r.taxPercent || 0}%)
                              </div>
                              <div className="text-xs text-emerald-500 mt-1 font-semibold">
                                Net: {fmtMoney(r.netPay)}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className={statusPillClass(r.status)}>
                                {String(r.status || "unpaid").toUpperCase()}
                              </span>
                            </td>

                            <td className={`px-6 py-4 text-sm ${subText}`}>
                              {fmtDate(r.paidAt)}
                            </td>

                            <td className="px-6 py-4">
                              <div className={`max-w-[250px] truncate text-sm ${subText}`}>
                                {r.notes || "—"}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => viewDetails(r)}
                                  className={`rounded-lg border p-2 ${softBorder} ${softBg} ${hoverBg}`}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => downloadPdf(r.month)}
                                  disabled={acting}
                                  className={`rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-500 hover:bg-emerald-500/20 ${
                                    acting ? "opacity-60 cursor-not-allowed" : ""
                                  }`}
                                  title="Download PDF"
                                >
                                  <FileDown className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className={`px-6 py-4 border-t ${softBorder} flex items-center justify-between gap-3 flex-wrap text-xs`}>
                  <div className={`inline-flex items-center gap-2 ${subText}`}>
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    Payroll is based on attendance, Saturdays, tax, and admin payment status.
                  </div>
                  <div className={subText}>
                    Selected month PDF:{" "}
                    <span className="font-semibold">
                      {monthFilter === "All" ? "Current month" : monthFilter}
                    </span>
                  </div>
                </div>
              </motion.div>

              <p className={`text-center text-xs py-4 ${subText}`}>
                💰 Your salary records are securely stored and synced with admin payroll.
              </p>
            </motion.div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className={`fixed top-0 left-0 bottom-0 w-[280px] z-50 border-r lg:hidden ${navBg}`}
            >
              <div className={`px-6 py-6 border-b ${softBorder}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black flex items-center justify-center">
                      EMS
                    </div>
                    <div>
                      <h1 className="text-sm font-bold tracking-[0.18em] text-emerald-500">
                        EMPLOYEE MS
                      </h1>
                      <p className={`text-xs mt-1 ${subText}`}>Salary Portal</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className={`h-8 w-8 rounded-lg border flex items-center justify-center ${softBorder} ${softBg}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className={`mb-6 rounded-2xl border p-4 ${cardBg}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-emerald-500/20 flex items-center justify-center">
                      <span className="font-bold text-emerald-500 text-lg">
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {employeeName}
                      </p>
                      <p className={`text-xs truncate ${subText}`}>Salary Dashboard</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left ${commonTransition} ${
                          item.active ? "bg-amber-500 text-white" : hoverBg
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${softBorder}`}>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-500"
                >
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailsModal && selectedMonth && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowDetailsModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50"
            >
              <div className={`rounded-2xl border shadow-2xl overflow-hidden ${cardBg}`}>
                <div className={`px-6 py-4 border-b ${softBorder}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WalletCards className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold">Salary Details</h3>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center ${softBorder} ${softBg}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <Detail label="Month" value={selectedMonth.monthLabel || monthLabel(selectedMonth.month)} subText={subText} />
                  <Detail label="Worked Hours" value={selectedMonth.workedLabel || minutesToHM(selectedMonth.totalMinutes).label} subText={subText} />
                  <Detail label="Worked Pay" value={fmtMoney(selectedMonth.workedPay)} subText={subText} />
                  <Detail label="Weekend Pay" value={fmtMoney(selectedMonth.weekendPay)} subText={subText} />
                  <Detail label="Weekend Days" value={`${selectedMonth.weekendDays} Saturdays (${selectedMonth.weekendHours} hrs)`} subText={subText} />
                  <Detail label="Gross Pay" value={fmtMoney(selectedMonth.grossPay)} subText={subText} />
                  <Detail label="Tax" value={`${selectedMonth.taxPercent || 0}% (${fmtMoney(selectedMonth.taxAmount)})`} subText={subText} />

                  <div>
                    <p className={`text-xs ${subText}`}>Net Pay</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {fmtMoney(selectedMonth.netPay)}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs ${subText}`}>Status</p>
                    <span className={statusPillClass(selectedMonth.status)}>
                      {String(selectedMonth.status || "unpaid").toUpperCase()}
                    </span>
                  </div>

                  {selectedMonth.paidAt && (
                    <Detail label="Paid At" value={fmtDate(selectedMonth.paidAt)} subText={subText} />
                  )}

                  {selectedMonth.notes && (
                    <Detail label="Notes" value={selectedMonth.notes} subText={subText} />
                  )}
                </div>

                <div className={`px-6 py-4 border-t ${softBorder} flex justify-end`}>
                  <button
                    onClick={() => downloadPdf(selectedMonth.month)}
                    disabled={acting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, cardBg, subText, tone = "amber", small }) {
  const toneClass = {
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  }[tone];

  return (
    <motion.div
      className={`rounded-2xl border p-4 ${cardBg}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${toneClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`${small ? "text-lg" : "text-2xl"} font-bold`}>
          {value}
        </span>
      </div>
      <p className={`text-xs ${subText}`}>{label}</p>
    </motion.div>
  );
}

function MoneyCard({ icon: Icon, title, subtitle, value, tone }) {
  const styles = {
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-500",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-500",
    rose: "border-rose-500/20 bg-rose-500/5 text-rose-500",
  };

  return (
    <motion.div
      className={`rounded-2xl border p-5 ${styles[tone]}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${styles[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs opacity-80">{subtitle}</p>
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}

function SelectBox({ value, onChange, children, inputBg, subText }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full sm:w-[220px] rounded-xl border px-4 py-2.5 text-sm outline-none appearance-none cursor-pointer ${inputBg}`}
      >
        {children}
      </select>
      <ChevronDown
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${subText}`}
      />
    </div>
  );
}

function Detail({ label, value, subText }) {
  return (
    <div>
      <p className={`text-xs ${subText}`}>{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}