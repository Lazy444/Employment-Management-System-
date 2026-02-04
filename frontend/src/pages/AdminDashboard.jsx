// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "http://localhost:5000";

const leaveDetails = [
  {
    label: "Leave Applied",
    value: 6,
    accent: "bg-sky-500",
    icon: <CalendarDays className="w-5 h-5 text-white" />,
  },
  {
    label: "Leave Approved",
    value: 4,
    accent: "bg-emerald-500",
    icon: <CheckCircle2 className="w-5 h-5 text-white" />,
  },
  {
    label: "Leave Pending",
    value: 1,
    accent: "bg-amber-500",
    icon: <Hourglass className="w-5 h-5 text-white" />,
  },
  {
    label: "Leave Rejected",
    value: 1,
    accent: "bg-rose-500",
    icon: <XCircle className="w-5 h-5 text-white" />,
  },
];

const attendanceDetails = [
  {
    label: "Present Today",
    value: 42,
    accent: "bg-emerald-500",
    icon: <ClipboardCheck className="w-5 h-5 text-white" />,
  },
  {
    label: "Absent",
    value: 3,
    accent: "bg-rose-500",
    icon: <XCircle className="w-5 h-5 text-white" />,
  },
  {
    label: "On Leave",
    value: 3,
    accent: "bg-sky-500",
    icon: <CalendarClock className="w-5 h-5 text-white" />,
  },
  {
    label: "Late Check-ins",
    value: 2,
    accent: "bg-amber-500",
    icon: <Clock4 className="w-5 h-5 text-white" />,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  const bgMain = darkMode ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-900";
  const cardBg = darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  // ✅ totals from backend
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
  }, [token]);

  // ✅ fetch counts
  const fetchTotals = async () => {
    try {
      setLoadingStats(true);

      // employees endpoint (admin)
      const employeesRes = await axiosAuth.get("/api/admin/employees");
      const employees = employeesRes?.data?.employees || [];
      setTotalEmployees(Array.isArray(employees) ? employees.length : 0);

      // departments endpoint (admin)
      const depRes = await axiosAuth.get("/api/departments");
      const departments = depRes?.data?.departments || [];
      setTotalDepartments(Array.isArray(departments) ? departments.length : 0);
    } catch (err) {
      console.error("Dashboard totals error:", err);
      // keep totals as-is (0) if error
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Top stats now dynamic
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
        value: "$25,800", // keep as demo until you build payroll module
        accent: "bg-rose-500",
        icon: <WalletCards className="w-5 h-5 text-white" />,
      },
    ];
  }, [loadingStats, totalEmployees, totalDepartments]);

  // ✅ Sidebar items (FIXED dashboard path)
  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      path: "/admindashboard", // ✅ FIXED (matches App.jsx)
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
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-h-screen flex ${bgMain}`}
    >
      {/* SIDEBAR */}
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.28 }}
        className={`hidden md:flex w-60 flex-col border-r ${
          darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-900 text-slate-50"
        }`}
      >
        <div className="px-5 py-4 border-b border-slate-800">
          <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Employee MS
          </span>
          <p className="mt-1 text-xs text-slate-300">Admin Panel</p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          {menuItems.map((item) => {
            const active = isActivePath(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-200 hover:bg-slate-800/70"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <button
            onClick={() => navigate("/login")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div
          className={`w-full border-b ${
            darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-emerald-600/95"
          } backdrop-blur`}
        >
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.22em] text-slate-100/90">Dashboard</span>
              <span className="text-sm md:text-base font-semibold text-white">Welcome, Admin</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-slate-950/25 px-2.5 py-1.5 text-xs text-slate-50 hover:bg-slate-950/45 transition"
              >
                {darkMode ? <SunMedium className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
              </button>

              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950/30 px-4 py-1.5 text-xs font-medium text-slate-50 border border-white/20 hover:bg-slate-950/45 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 px-4 md:px-8 py-5 md:py-7 space-y-6 md:space-y-7">
          {/* DASHBOARD OVERVIEW */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg md:text-xl font-semibold tracking-tight">Dashboard Overview</h2>

              <button
                onClick={fetchTotals}
                className="text-xs px-3 py-2 rounded-xl border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition"
              >
                Refresh Totals
              </button>
            </div>

            <div className="grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-3">
              {statsTop.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 md:px-5 md:py-4 shadow-sm ${cardBg}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-medium ${subText}`}>{stat.label}</span>
                    <span className="text-xl md:text-2xl font-semibold tracking-tight">{stat.value}</span>
                  </div>
                  <div className="flex items-center justify-center rounded-xl p-3 shadow-inner text-white">
                    <div className={`${stat.accent} rounded-xl p-2.5 flex items-center justify-center`}>
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* LEAVE & ATTENDANCE (still demo until you build backend) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className={`rounded-2xl border shadow-sm ${cardBg}`}
            >
              <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-3.5 border-b border-slate-800/40">
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                  Leave Details
                </h3>
                <span className={`text-[11px] ${subText}`}>This month</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaveDetails.map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3 md:px-5">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2.5 ${item.accent} shadow-inner`}>{item.icon}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className={`text-xs ${subText}`}>Across all departments</span>
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
              className={`rounded-2xl border shadow-sm ${cardBg}`}
            >
              <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-3.5 border-b border-slate-800/40">
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-sky-500" />
                  Attendance Summary
                </h3>
                <span className={`text-[11px] ${subText}`}>Today</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceDetails.map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3 md:px-5">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2.5 ${item.accent} shadow-inner`}>{item.icon}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className={`text-xs ${subText}`}>Auto-synced from timesheets</span>
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
