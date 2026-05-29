import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Hourglass,
  CalendarClock,
  Clock4,
  SunMedium,
  MoonStar,
  Clock,
  Inbox,
  RefreshCw,
  IndianRupee,
  Bell,
  Search,
  ChevronRight,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotificationById,
} from "../services/notificationService.js";

const API_BASE = "http://localhost:5000";

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const fmtMoney = (n) => {
  const num = Number(n || 0);
  return `₹ ${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const monthLabel = (ym) => {
  if (!ym || !ym.includes("-")) return ym || "";
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "long" });
};

const formatNotificationTime = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "";
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

  const hoverBg = darkMode ? "hover:bg-slate-800/70" : "hover:bg-slate-100";
  const commonTransition = "transition-all duration-300 ease-in-out";

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);

  const [payrollMonth] = useState(getCurrentMonth());

  const [payrollStats, setPayrollStats] = useState({
    totalPayroll: 0,
    averageSalary: 0,
    employeesPaid: 0,
    monthlyGrowth: 0,
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
  });

  const [leaveStats, setLeaveStats] = useState({
    applied: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPayroll, setLoadingPayroll] = useState(false);
  const [loadingDashboardStats, setLoadingDashboardStats] = useState(false);
  const [loadingLeaveStats, setLoadingLeaveStats] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
  }, [token]);

  const fetchTotals = async () => {
    try {
      setLoadingStats(true);

      const employeesRes = await axiosAuth.get("/api/admin/employees");
      const employees = employeesRes?.data?.employees || [];
      setTotalEmployees(Array.isArray(employees) ? employees.length : 0);

      const depRes = await axiosAuth.get("/api/departments");
      const departments = depRes?.data?.departments || [];
      setTotalDepartments(Array.isArray(departments) ? departments.length : 0);
    } catch (err) {
      console.error("Dashboard totals error:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPayroll = async () => {
    try {
      setLoadingPayroll(true);

      const res = await axiosAuth.get(
        `/api/admin/salary/summary?month=${encodeURIComponent(payrollMonth)}`
      );

      const stats = res?.data?.stats || {};

      setPayrollStats({
        totalPayroll: Number(stats.totalPayroll || 0),
        averageSalary: Number(stats.averageSalary || 0),
        employeesPaid: Number(stats.employeesPaid || 0),
        monthlyGrowth: Number(stats.monthlyGrowth || 0),
      });
    } catch (err) {
      console.error("Dashboard payroll error:", err);
      setPayrollStats({
        totalPayroll: 0,
        averageSalary: 0,
        employeesPaid: 0,
        monthlyGrowth: 0,
      });
    } finally {
      setLoadingPayroll(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoadingDashboardStats(true);

      const res = await axiosAuth.get("/api/admin/dashboard/stats");
      const stats = res?.data?.stats || {};

      setDashboardStats({
        totalEmployees: Number(stats.totalEmployees || 0),
        presentToday: Number(stats.presentToday || 0),
        absentToday: Number(stats.absentToday || 0),
        onLeaveToday: Number(stats.onLeaveToday || 0),
      });
    } catch (err) {
      console.error("Dashboard attendance stats error:", err);
      setDashboardStats({
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
      });
    } finally {
      setLoadingDashboardStats(false);
    }
  };

  const fetchLeaveStats = async () => {
    try {
      setLoadingLeaveStats(true);

      const res = await axiosAuth.get(
        `/api/admin/dashboard/leave-stats?month=${encodeURIComponent(
          payrollMonth
        )}`
      );

      const stats = res?.data?.stats || {};

      setLeaveStats({
        applied: Number(stats.applied || 0),
        approved: Number(stats.approved || 0),
        pending: Number(stats.pending || 0),
        rejected: Number(stats.rejected || 0),
      });
    } catch (err) {
      console.error("Dashboard leave stats error:", err);
      setLeaveStats({
        applied: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      });
    } finally {
      setLoadingLeaveStats(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await getNotifications();
      setNotifications(res?.data?.data || []);
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotificationById(id);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Notification delete error:", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      console.error("Notification mark read error:", err);
    }
  };

  const refreshDashboard = async () => {
    await Promise.all([
      fetchTotals(),
      fetchPayroll(),
      fetchDashboardStats(),
      fetchLeaveStats(),
      fetchNotifications(),
    ]);
  };

  useEffect(() => {
    refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const statsTop = useMemo(() => {
    return [
      {
        label: "Total Employees",
        value: loadingStats ? "..." : totalEmployees,
        accent: "bg-emerald-500",
        icon: <Users className="w-5 h-5 text-white" />,
      },
      {
        label: "Total Departments",
        value: loadingStats ? "..." : totalDepartments,
        accent: "bg-amber-500",
        icon: <Building2 className="w-5 h-5 text-white" />,
      },
      {
        label: "Monthly Payroll",
        value: loadingPayroll ? "..." : fmtMoney(payrollStats.totalPayroll),
        accent: "bg-rose-500",
        icon: <WalletCards className="w-5 h-5 text-white" />,
      },
      {
        label: "Average Salary",
        value: loadingPayroll ? "..." : fmtMoney(payrollStats.averageSalary),
        accent: "bg-violet-500",
        icon: <IndianRupee className="w-5 h-5 text-white" />,
      },
    ];
  }, [loadingStats, loadingPayroll, totalEmployees, totalDepartments, payrollStats]);

  const leaveDetails = [
    {
      label: "Leave Applied",
      value: loadingLeaveStats ? "..." : leaveStats.applied,
      accent: "bg-sky-500",
      icon: <CalendarDays className="w-5 h-5 text-white" />,
    },
    {
      label: "Leave Approved",
      value: loadingLeaveStats ? "..." : leaveStats.approved,
      accent: "bg-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
    },
    {
      label: "Leave Pending",
      value: loadingLeaveStats ? "..." : leaveStats.pending,
      accent: "bg-amber-500",
      icon: <Hourglass className="w-5 h-5 text-white" />,
    },
    {
      label: "Leave Rejected",
      value: loadingLeaveStats ? "..." : leaveStats.rejected,
      accent: "bg-rose-500",
      icon: <XCircle className="w-5 h-5 text-white" />,
    },
  ];

  const attendanceDetails = [
    {
      label: "Present Today",
      value: loadingDashboardStats ? "..." : dashboardStats.presentToday,
      accent: "bg-emerald-500",
      icon: <ClipboardCheck className="w-5 h-5 text-white" />,
    },
    {
      label: "Absent Today",
      value: loadingDashboardStats ? "..." : dashboardStats.absentToday,
      accent: "bg-rose-500",
      icon: <XCircle className="w-5 h-5 text-white" />,
    },
    {
      label: "On Leave",
      value: loadingDashboardStats ? "..." : dashboardStats.onLeaveToday,
      accent: "bg-sky-500",
      icon: <CalendarClock className="w-5 h-5 text-white" />,
    },
    {
      label: "Late Check-ins",
      value: "0",
      accent: "bg-amber-500",
      icon: <Clock4 className="w-5 h-5 text-white" />,
    },
  ];

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      path: "/admindashboard",
    },
    {
      label: "Employees",
      icon: <Users className="w-4 h-4" />,
      path: "/admin/employees",
    },
    {
      label: "Departments",
      icon: <Building2 className="w-4 h-4" />,
      path: "/admin/departments",
    },
    {
      label: "Leaves",
      icon: <CalendarDays className="w-4 h-4" />,
      path: "/admin/leaves",
    },
    {
      label: "Salary",
      icon: <WalletCards className="w-4 h-4" />,
      path: "/admin/salary",
    },
    {
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      path: "/admin/settings",
    },
    {
      label: "Punch",
      icon: <Clock className="w-4 h-4" />,
      path: "/admin/punch",
    },
    {
      label: "Message",
      icon: <Inbox className="w-4 h-4" />,
      path: "/admin/inbox",
    },
  ];

  const isActivePath = (itemPath) => {
    if (itemPath === "/admindashboard") {
      return location.pathname === "/admindashboard";
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`min-h-screen flex ${bgMain} ${commonTransition}`}
    >
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`hidden md:flex w-64 flex-col border-r backdrop-blur-xl ${navBg} ${commonTransition}`}
      >
        <div
          className={`px-5 py-5 border-b ${
            darkMode ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-emerald-500">
            Employee MS
          </span>
          <p className={`mt-1 text-xs ${subText}`}>Admin Panel</p>
        </div>

        <div className="px-4 pt-4">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-slate-50"
            } ${commonTransition}`}
          >
            <Search className={`w-4 h-4 ${subText}`} />
            <input
              type="text"
              placeholder="Search menu..."
              className={`w-full bg-transparent outline-none text-sm ${
                darkMode
                  ? "placeholder:text-slate-500"
                  : "placeholder:text-slate-400"
              }`}
            />
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 text-sm">
          {menuItems.map((item) => {
            const active = isActivePath(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-3 ${commonTransition} ${
                  active
                    ? "bg-emerald-500 text-white shadow-md"
                    : `${darkMode ? "text-slate-200" : "text-slate-700"} ${hoverBg}`
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 ${active ? "opacity-100" : "opacity-40"}`}
                />
              </button>
            );
          })}
        </nav>

        <div
          className={`px-4 py-4 border-t ${
            darkMode ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <button
            onClick={() => navigate("/login")}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium border ${
              darkMode
                ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            } ${commonTransition}`}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col">
        <div
          className={`w-full border-b backdrop-blur-xl sticky top-0 z-20 ${headerBg} ${commonTransition}`}
        >
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <div className="flex flex-col">
              <span className={`text-xs uppercase tracking-[0.22em] ${subText}`}>
                Dashboard
              </span>
              <span className="text-sm md:text-lg font-semibold">
                Welcome, Admin
              </span>
            </div>

            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className={`relative inline-flex items-center justify-center rounded-full border p-2.5 ${
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                } shadow-sm ${commonTransition}`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 top-14 w-80 rounded-2xl border shadow-xl p-4 ${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-200"
                    } ${commonTransition}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Notifications</h4>
                      <button
                        onClick={fetchNotifications}
                        className={`text-xs px-2 py-1 rounded-lg border ${
                          darkMode
                            ? "border-slate-700 hover:bg-slate-800"
                            : "border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {loadingNotifications ? (
                        <div className="text-sm opacity-70">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div
                          className={`rounded-xl p-3 text-sm ${
                            darkMode
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item._id}
                            className={`rounded-xl p-3 border ${
                              darkMode
                                ? "bg-slate-800 border-slate-700"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">
                                  {item.title}
                                </p>
                                <p className="text-xs mt-1 opacity-80 leading-5">
                                  {item.message}
                                </p>
                                <p className="text-[11px] mt-2 opacity-60">
                                  {formatNotificationTime(item.createdAt)}
                                </p>

                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                  {!item.isRead && (
                                    <button
                                      onClick={() => handleMarkAsRead(item._id)}
                                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                    >
                                      <CheckCheck className="w-3 h-3" />
                                      Mark read
                                    </button>
                                  )}

                                  {!item.isRead && (
                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] bg-rose-500/15 text-rose-400">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  handleDeleteNotification(item._id)
                                }
                                className={`p-2 rounded-lg ${
                                  darkMode
                                    ? "hover:bg-slate-700 text-rose-400"
                                    : "hover:bg-slate-200 text-rose-500"
                                }`}
                                title="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center rounded-full border p-2.5 shadow-sm ${
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                } ${commonTransition}`}
              >
                {darkMode ? (
                  <SunMedium className="w-4 h-4" />
                ) : (
                  <MoonStar className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => navigate("/login")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border shadow-sm ${
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                } ${commonTransition}`}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-6 md:space-y-7">
          <div
            className={`rounded-3xl border p-5 md:p-6 shadow-sm ${
              darkMode
                ? "border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950"
                : "border-slate-200 bg-gradient-to-r from-emerald-50 to-white"
            } ${commonTransition}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Dashboard Overview
                </h2>
                <p className={`text-sm mt-2 ${subText}`}>
                  Payroll month: {monthLabel(payrollMonth)}
                </p>
              </div>

              <button
                onClick={refreshDashboard}
                className={`inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${
                  darkMode
                    ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                } ${commonTransition}`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingStats ||
                    loadingPayroll ||
                    loadingDashboardStats ||
                    loadingLeaveStats
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh Dashboard
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {statsTop.map((stat, i) => (
              <motion.button
                type="button"
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => {
                  if (
                    stat.label === "Monthly Payroll" ||
                    stat.label === "Average Salary"
                  ) {
                    navigate("/admin/salary");
                  }
                }}
                className={`text-left flex items-center justify-between rounded-3xl border px-5 py-4 shadow-sm hover:shadow-lg ${commonTransition} ${cardBg} ${
                  stat.label === "Monthly Payroll" ||
                  stat.label === "Average Salary"
                    ? "cursor-pointer hover:scale-[1.02]"
                    : "cursor-default"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-medium ${subText}`}>
                    {stat.label}
                  </span>
                  <span className="text-xl md:text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <div className="flex items-center justify-center rounded-2xl p-3 shadow-inner text-white">
                  <div
                    className={`${stat.accent} rounded-2xl p-2.5 flex items-center justify-center`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`rounded-3xl border px-5 py-5 shadow-sm ${cardBg} ${commonTransition}`}
            >
              <p className={`text-xs font-medium ${subText}`}>Employees Paid</p>
              <h3 className="text-2xl font-bold mt-2">
                {loadingPayroll ? "..." : payrollStats.employeesPaid}
              </h3>
            </div>

            <div
              className={`rounded-3xl border px-5 py-5 shadow-sm ${cardBg} ${commonTransition}`}
            >
              <p className={`text-xs font-medium ${subText}`}>Monthly Growth</p>
              <h3 className="text-2xl font-bold mt-2">
                {loadingPayroll
                  ? "..."
                  : `${payrollStats.monthlyGrowth >= 0 ? "+" : ""}${payrollStats.monthlyGrowth.toFixed(
                      1
                    )}%`}
              </h3>
            </div>

            <div
              className={`rounded-3xl border px-5 py-5 shadow-sm cursor-pointer hover:shadow-lg ${cardBg} ${commonTransition}`}
              onClick={() => navigate("/admin/salary")}
            >
              <p className={`text-xs font-medium ${subText}`}>
                Open Salary Management
              </p>
              <h3 className="text-base font-semibold mt-3 text-emerald-500">
                View payroll details →
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className={`rounded-3xl border shadow-sm overflow-hidden ${cardBg} ${commonTransition}`}
            >
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${
                  darkMode ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                  Leave Details
                </h3>
                <span className={`text-[11px] ${subText}`}>This month</span>
              </div>

              <div
                className={`divide-y ${
                  darkMode ? "divide-slate-800" : "divide-slate-100"
                }`}
              >
                {leaveDetails.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2.5 ${item.accent} shadow-inner`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className={`text-xs ${subText}`}>
                          Across all departments
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className={`rounded-3xl border shadow-sm overflow-hidden ${cardBg} ${commonTransition}`}
            >
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${
                  darkMode ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-sky-500" />
                  Attendance Summary
                </h3>
                <span className={`text-[11px] ${subText}`}>Today</span>
              </div>

              <div
                className={`divide-y ${
                  darkMode ? "divide-slate-800" : "divide-slate-100"
                }`}
              >
                {attendanceDetails.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2.5 ${item.accent} shadow-inner`}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className={`text-xs ${subText}`}>
                          Auto-synced from backend
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;