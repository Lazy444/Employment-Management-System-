import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  Clock,
  BookMarked,
  ArrowLeft,
  Calendar,
  Loader2,
  Plus,
  RefreshCw,
  Briefcase,
  CheckCircle2,
  XCircle,
  Hourglass,
  CircleSlash,
  MessageCircle,
  TrendingUp,
  Award,
  Filter,
  ChevronDown,
  Bell,
  SunMedium,
  MoonStar,
  Menu,
  Sparkles,
  Gift,
  ChevronRight,
  Shield,
  History,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  return ((parts[0]?.[0] || "E") + (parts.length > 1 ? parts.at(-1)?.[0] : "")).toUpperCase();
};

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateRelative = (d) => {
  try {
    const date = new Date(d);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(d);
  } catch {
    return "—";
  }
};

const navItems = [
  { label: "My Profile", icon: UserCircle2, path: "/employeeprofile" },
  { label: "Leave", icon: CalendarDays, path: "/employeeleave", active: true },
  { label: "Salary", icon: WalletCards, path: "/employeesalary" },
  { label: "Calendar", icon: Calendar, path: "/calender" },
  { label: "Punch Clock", icon: Clock, path: "/punch-clock" },
  { label: "Message", icon: MessageCircle, path: "/message" },
  { label: "Manager Dashboard", icon: BookMarked, path: "/employeemanager" },
  { label: "Settings", icon: Settings, path: "/employeesettings" },
];

export default function EmployeeLeaves() {
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
  const commonTransition = "transition-all duration-300 ease-in-out";

  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const employeeName = localStorage.getItem("employeeName") || "Employee";
  const initials = getInitials(employeeName);
  const firstName = employeeName.split(" ")[0];

  const fetchLeaves = useCallback(
    async (status = "All") => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/employee-login", { replace: true });
          return;
        }

        const url =
          status === "All"
            ? `${API_BASE}/employees/leaves`
            : `${API_BASE}/employees/leaves?status=${encodeURIComponent(status)}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("employeeName");
          navigate("/employee-login", { replace: true });
          return;
        }

        const text = await res.text();
        let data = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }

        setLeaves(Array.isArray(data?.leaves) ? data.leaves : []);
      } catch (error) {
        console.error(error);
        setLeaves([]);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchLeaves(statusFilter);
  }, [fetchLeaves, statusFilter]);

  const rows = useMemo(() => {
    return leaves.map((l, idx) => ({
      sno: idx + 1,
      id: l._id,
      leaveType: l.leaveType || "—",
      from: formatDate(l.fromDate),
      to: formatDate(l.toDate),
      description: l.description || "—",
      applied: formatDateRelative(l.appliedDate || l.createdAt),
      status: l.status || "Pending",
    }));
  }, [leaves]);

  const cancelLeave = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/employee-login", { replace: true });
        return;
      }

      const res = await fetch(`${API_BASE}/employees/leaves/${id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cancelReason: "Changed plan" }),
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        alert(data?.message || "Failed to cancel leave");
        return;
      }

      fetchLeaves(statusFilter);
    } catch (error) {
      console.error(error);
      alert("Failed to cancel leave");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    navigate("/employee-login", { replace: true });
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    const approved = rows.filter((r) => r.status === "Approved").length;
    const rejected = rows.filter((r) => r.status === "Rejected").length;
    const cancelled = rows.filter((r) => r.status === "Cancelled").length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { total, pending, approved, rejected, cancelled, approvalRate };
  }, [rows]);

  const leaveBalance = useMemo(() => {
    const totalUsed = stats.approved;

    return {
      annual: { used: Math.min(totalUsed, 12), limit: 12 },
      sick: { used: Math.min(Math.floor(totalUsed * 0.3), 10), limit: 10 },
      casual: { used: Math.min(Math.floor(totalUsed * 0.2), 8), limit: 8 },
    };
  }, [stats.approved]);

  const getLeaveTypeIcon = (type) => {
    const icons = {
      Annual: <Gift className="w-4 h-4" />,
      Sick: <AlertCircle className="w-4 h-4" />,
      Casual: <Sparkles className="w-4 h-4" />,
      Unpaid: <Shield className="w-4 h-4" />,
    };

    return icons[type] || <CalendarDays className="w-4 h-4" />;
  };

  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentYear, today.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const leaveDates = useMemo(() => {
    const dates = new Set();

    leaves.forEach((leave) => {
      if (leave.status === "Approved" && leave.fromDate && leave.toDate) {
        const from = new Date(leave.fromDate);
        const to = new Date(leave.toDate);

        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          if (
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          ) {
            dates.add(d.getDate());
          }
        }
      }
    });

    return dates;
  }, [leaves, today]);

  const statusPill = (status) => {
    const base =
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border";

    if (status === "Approved") {
      return `${base} bg-emerald-500/15 text-emerald-500 border-emerald-500/30`;
    }

    if (status === "Rejected") {
      return `${base} bg-rose-500/15 text-rose-500 border-rose-500/30`;
    }

    if (status === "Cancelled") {
      return `${base} bg-slate-500/15 text-slate-500 border-slate-500/30`;
    }

    return `${base} bg-amber-500/15 text-amber-500 border-amber-500/30`;
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
                  <p className={`text-xs truncate ${subText}`}>Employee Portal</p>
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
                        ? "bg-blue-500 text-white shadow-md"
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
                    {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
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
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <p className={`text-[10px] uppercase tracking-[0.2em] ${subText}`}>
                      Leave Management
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
                    {stats.pending > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {stats.pending}
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
                          {stats.pending > 0 ? (
                            <div className={`text-xs ${subText}`}>
                              You have {stats.pending} pending leave request
                              {stats.pending > 1 ? "s" : ""}
                            </div>
                          ) : (
                            <div className={`text-xs ${subText}`}>
                              ✨ No new notifications
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
                    <p className={`text-xs ${subText}`}>Leave Dashboard</p>
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
              className="max-w-7xl space-y-6"
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
                      <CalendarDays className="w-5 h-5 text-blue-500" />
                      <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                        Leave Overview
                      </p>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Professional leave management
                    </h1>
                    <p className={`mt-2 text-sm max-w-2xl ${subText}`}>
                      Track leave requests, monitor balances, and view your monthly
                      calendar in one clean dashboard.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate("/add-new-leave")}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 font-semibold text-slate-950 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add Leave
                    </button>

                    <button
                      onClick={() => fetchLeaves(statusFilter)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 font-medium ${softBorder} ${softBg} ${hoverBg}`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <StatCard icon={Briefcase} label="Total Requests" value={stats.total} cardBg={cardBg} subText={subText} />
                <StatCard icon={Hourglass} label="Pending" value={stats.pending} cardBg={cardBg} subText={subText} />
                <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} cardBg={cardBg} subText={subText} />
                <StatCard icon={XCircle} label="Rejected" value={stats.rejected} cardBg={cardBg} subText={subText} />
                <StatCard icon={CircleSlash} label="Cancelled" value={stats.cancelled} cardBg={cardBg} subText={subText} />
                <StatCard icon={TrendingUp} label="Approval Rate" value={`${stats.approvalRate}%`} cardBg={cardBg} subText={subText} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                  className={`lg:col-span-2 rounded-3xl border p-6 ${cardBg}`}
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-emerald-500" />
                      <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                        Leave Balance
                      </p>
                    </div>
                    <h3 className="text-xl font-semibold">Leave limits and usage</h3>
                    <p className={`mt-1 text-sm ${subText}`}>
                      A simple professional summary of available leave quota.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(leaveBalance).map(([key, data]) => (
                      <div
                        key={key}
                        className={`rounded-2xl border p-5 ${
                          darkMode
                            ? "border-slate-800 bg-slate-950/60"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                              {getLeaveTypeIcon(key.charAt(0).toUpperCase() + key.slice(1))}
                            </div>
                            <p className="text-sm font-semibold capitalize">{key}</p>
                          </div>
                          <span className={`text-xs ${subText}`}>
                            {data.used}/{data.limit}
                          </span>
                        </div>

                        <div
                          className={`h-2 w-full rounded-full overflow-hidden ${
                            darkMode ? "bg-slate-800" : "bg-slate-200"
                          }`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(data.used / data.limit) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-500"
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className={subText}>Remaining</span>
                          <span className="font-semibold text-blue-500">
                            {data.limit - data.used} days
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`rounded-3xl border p-6 ${cardBg}`}
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                        Calendar
                      </p>
                    </div>
                    <h3 className="text-xl font-semibold">
                      {currentMonth} {currentYear}
                    </h3>
                  </div>

                  <div className={`grid grid-cols-7 gap-1 text-center text-xs mb-3 ${subText}`}>
                    {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                      <div key={day} className="py-2 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isToday = day === today.getDate();
                      const hasLeave = day && leaveDates.has(day);

                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                            day
                              ? isToday
                                ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 font-bold"
                                : hasLeave
                                ? "bg-emerald-500/20 border border-emerald-400/30 text-emerald-500"
                                : darkMode
                                ? "bg-slate-950/60 border border-slate-800 text-slate-200"
                                : "bg-slate-50 border border-slate-200 text-slate-700"
                              : "bg-transparent border-transparent"
                          }`}
                        >
                          {day || ""}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className={`rounded-3xl border p-5 ${cardBg}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Filter className={`w-4 h-4 ${subText}`} />
                      <p className="text-sm font-semibold">Filter leave requests</p>
                    </div>
                    <p className={`text-xs mt-1 ${subText}`}>
                      Only pending requests can be cancelled.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`w-full sm:w-[200px] rounded-xl border px-4 py-2.5 text-sm outline-none cursor-pointer appearance-none ${
                          darkMode
                            ? "border-slate-800 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-900"
                        }`}
                      >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <ChevronDown
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${subText}`}
                      />
                    </div>

                    <button
                      onClick={() => fetchLeaves(statusFilter)}
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`rounded-3xl border overflow-hidden ${cardBg}`}
              >
                <div className={`px-6 py-5 border-b ${softBorder}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <History className="w-5 h-5 text-blue-500" />
                    <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                      Leave Records
                    </p>
                  </div>
                  <h3 className="text-xl font-semibold">Leave history</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={darkMode ? "bg-slate-950/60" : "bg-slate-50"}>
                      <tr className={`text-left text-xs font-semibold ${subText}`}>
                        <th className="px-6 py-4">#</th>
                        <th className="px-6 py-4">Leave Type</th>
                        <th className="px-6 py-4">From</th>
                        <th className="px-6 py-4">To</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Applied</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody className={darkMode ? "divide-y divide-slate-800" : "divide-y divide-slate-200"}>
                      {loading ? (
                        <tr>
                          <td className={`px-6 py-12 ${subText}`} colSpan={8}>
                            <div className="flex items-center justify-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              <span className="text-sm">Loading leaves...</span>
                            </div>
                          </td>
                        </tr>
                      ) : rows.length === 0 ? (
                        <tr>
                          <td className={`px-6 py-12 text-center ${subText}`} colSpan={8}>
                            No leave requests found.
                          </td>
                        </tr>
                      ) : (
                        rows.map((r) => (
                          <tr key={r.id} className={hoverBg}>
                            <td className={`px-6 py-4 text-sm ${subText}`}>{r.sno}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                  {getLeaveTypeIcon(r.leaveType)}
                                </div>
                                <span className="font-medium text-sm">{r.leaveType}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 text-sm ${subText}`}>{r.from}</td>
                            <td className={`px-6 py-4 text-sm ${subText}`}>{r.to}</td>
                            <td className={`px-6 py-4 text-sm max-w-[260px] truncate ${subText}`}>
                              {r.description}
                            </td>
                            <td className={`px-6 py-4 text-sm ${subText}`}>{r.applied}</td>
                            <td className="px-6 py-4">
                              <span className={statusPill(r.status)}>
                                {r.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                                {r.status === "Rejected" && <XCircle className="w-3 h-3" />}
                                {r.status === "Pending" && <Hourglass className="w-3 h-3" />}
                                {r.status === "Cancelled" && <CircleSlash className="w-3 h-3" />}
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {r.status === "Pending" ? (
                                <button
                                  onClick={() => cancelLeave(r.id)}
                                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className={subText}>—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
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

              <div className="px-4 py-5">
                <nav className="space-y-1.5">
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
                          item.active ? "bg-blue-500 text-white" : hoverBg
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${softBorder}`}>
                <button
                  onClick={logout}
                  className="w-full rounded-xl border border-rose-500/30 px-4 py-3 text-sm font-medium text-rose-500 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, cardBg, subText }) {
  return (
    <motion.div
      className={`rounded-2xl border p-4 ${cardBg}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className={`text-xs ${subText}`}>{label}</p>
    </motion.div>
  );
}