import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  Building2,
  BadgeCheck,
  Cake,
  Phone,
  Mail,
  SunMedium,
  MoonStar,
  Loader2,
  Clock,
  BookMarked,
  Calendar,
  ArrowLeft,
  Briefcase,
  VenusAndMars,
  HeartHandshake,
  ShieldCheck,
  MessageCircle,
  Award,
  TrendingUp,
  Star,
  ChevronRight,
  Sparkles,
  Fingerprint,
  Globe,
  Zap,
  Bell,
  Menu,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const HOST_BASE = "http://localhost:5000";
const API_BASE = "http://localhost:5000/api";

const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const resolveImageUrl = (maybeUrl) => {
  if (!maybeUrl) return "";
  const url = String(maybeUrl);
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${HOST_BASE}${url}`;
  return `${HOST_BASE}/${url}`;
};

const toDateInput = (value) => {
  if (!value) return "—";
  try {
    return String(value).slice(0, 10);
  } catch {
    return "—";
  }
};

const normalizeEmployee = (raw) => {
  const u = raw || {};
  const rawImage = u.imageUrl || u.profileImage || u.image || "";
  const departmentName =
    u.departmentName || (u.department?.name ?? u.department ?? "—");

  const stats = u.stats || {};

  return {
    name: u.name || "—",
    email: u.email || "—",
    phone: u.phone || "—",
    employeeId: u.employeeId || u.empCode || u.id || "—",
    maritalStatus: u.maritalStatus || "—",
    dob: u.dob || "",
    gender: u.gender || "—",
    status: u.status || "Active",
    role: u.role || "employee",
    departmentName,
    departmentObj: u.department || null,
    imageUrl: resolveImageUrl(rawImage),
    joinDate: u.joinDate || u.createdAt || "2024-01-01",
    location: u.location || "Remote",
    employeeType: u.employeeType || "Full-time",

    yearsAtCompany: Number(stats.yearsAtCompany ?? u.yearsAtCompany ?? 0),
    projectsCompleted: Number(
      stats.projectsCompleted ?? u.projectsCompleted ?? 0
    ),
    certifications: Number(stats.certifications ?? u.certifications ?? 0),
    leaveBalance: Number(stats.leaveBalance ?? u.leaveBalance ?? 0),

    stats: {
      yearsAtCompany: Number(stats.yearsAtCompany ?? u.yearsAtCompany ?? 0),
      projectsCompleted: Number(
        stats.projectsCompleted ?? u.projectsCompleted ?? 0
      ),
      certifications: Number(stats.certifications ?? u.certifications ?? 0),
      leaveBalance: Number(stats.leaveBalance ?? u.leaveBalance ?? 0),
    },
  };
};

const navItems = [
  { label: "My Profile", icon: UserCircle2, path: "/employeeprofile", active: true },
  { label: "Leave", icon: CalendarDays, path: "/employeeleave" },
  { label: "Salary", icon: WalletCards, path: "/employeesalary" },
  { label: "Calendar", icon: Calendar, path: "/calender" },
  { label: "Punch Clock", icon: Clock, path: "/punch-clock" },
  { label: "Message", icon: MessageCircle, path: "/message" },
  { label: "Manager Dashboard", icon: BookMarked, path: "/employeemanager" },
  { label: "Settings", icon: Settings, path: "/employeesettings" },
];

export default function EmployeeProfile() {
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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [employee, setEmployee] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const employeeName = useMemo(() => {
    return employee?.name || localStorage.getItem("employeeName") || "Employee";
  }, [employee?.name]);

  const initials = useMemo(() => getInitials(employeeName), [employeeName]);

  const fetchMyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/employee-login", { replace: true });
        return;
      }

      const res = await fetch(`${API_BASE}/employees/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("employeeName");
        navigate("/employee-login", { replace: true });
        return;
      }

      const data = await safeJson(res);

      if (!res.ok) {
        setErrorMsg(data?.message || data?.error || "Failed to load profile");
        setEmployee(null);
        return;
      }

      const raw = data?.employee || data?.user || data;
      const normalized = normalizeEmployee(raw);

      setEmployee(normalized);

      if (normalized?.name && normalized.name !== "—") {
        localStorage.setItem("employeeName", normalized.name);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error loading profile");
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    navigate("/employee-login", { replace: true });
  };

  const firstName =
    employee?.name && employee.name !== "—"
      ? employee.name.split(" ")[0]
      : "Employee";

  const stats = [
    {
      label: "Years at Company",
      value: employee?.yearsAtCompany ?? 0,
      icon: Award,
    },
    {
      label: "Projects Completed",
      value: employee?.projectsCompleted ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Certifications",
      value: employee?.certifications ?? 0,
      icon: Star,
    },
    {
      label: "Leave Balance",
      value: employee?.leaveBalance ?? 0,
      icon: CalendarDays,
    },
  ];

  const achievements = [
    "⭐ Top Performer - Q4 2024",
    "🏆 Innovation Award",
    "📈 Best Team Player",
    "🎯 100% Attendance",
  ];

  return (
    <div className={`min-h-screen overflow-hidden ${bgMain} ${commonTransition}`}>
      <div className="relative flex min-h-screen">
        <aside
          className={`hidden lg:flex w-[280px] xl:w-[300px] flex-col fixed inset-y-0 left-0 z-30 border-r backdrop-blur-xl ${navBg} ${commonTransition}`}
        >
          <div className={`px-6 py-6 border-b ${softBorder}`}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black flex items-center justify-center shadow-lg">
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
                  <p className="text-sm font-semibold truncate">
                    {employee?.name || "Employee"}
                  </p>
                  <p className={`text-xs truncate ${subText}`}>
                    {employee?.email || "employee@email.com"}
                  </p>
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
                        ? "bg-emerald-500 text-white shadow-md"
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
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <p className={`text-[10px] uppercase tracking-[0.2em] ${subText}`}>
                      Employee Dashboard
                    </p>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    Welcome back, {firstName} 👋
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative h-10 w-10 rounded-xl border flex items-center justify-center ${softBorder} ${softBg} ${hoverBg} ${commonTransition}`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full" />
                </button>

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

                <div className={`hidden md:flex items-center gap-3 rounded-xl border px-3 py-1.5 ${softBorder} ${softBg}`}>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-500/20 flex items-center justify-center">
                    <span className="font-bold text-emerald-500 text-sm">
                      {initials}
                    </span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {employee?.name || "Employee"}
                    </p>
                    <p className={`text-xs capitalize ${subText}`}>
                      {employee?.status || "Active"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <AnimatePresence mode="wait">
              {errorMsg ? (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-7xl mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {errorMsg}
                </motion.div>
              ) : null}

              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`max-w-7xl rounded-3xl border px-6 py-20 flex flex-col items-center justify-center gap-4 ${cardBg}`}
                >
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <span className={`text-sm ${subText}`}>
                    Loading your profile...
                  </span>
                </motion.div>
              ) : !employee ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`max-w-7xl rounded-3xl border px-6 py-20 text-center ${cardBg}`}
                >
                  <p className={`text-sm ${subText}`}>Profile not available.</p>
                  <button
                    onClick={fetchMyProfile}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-medium hover:opacity-90 transition text-sm"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-7xl space-y-6"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`rounded-2xl border p-4 ${cardBg}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-2xl font-bold">
                              {stat.value}
                            </span>
                          </div>
                          <p className={`text-xs ${subText}`}>{stat.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-3xl border shadow-sm overflow-hidden ${cardBg}`}
                  >
                    <div className="relative p-6 md:p-8">
                      <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-1">
                          <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-3xl overflow-hidden border-2 border-emerald-500/20 bg-emerald-500/10 shadow-xl">
                            {employee.imageUrl ? (
                              <img
                                src={employee.imageUrl}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-emerald-500">
                                {employee?.name?.charAt(0) || "E"}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                {employee.name}
                              </h1>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <InfoPill icon={<Mail />} value={employee.email} darkMode={darkMode} />
                              <InfoPill icon={<Phone />} value={employee.phone} darkMode={darkMode} />
                              <InfoPill icon={<Building2 />} value={employee.departmentName} darkMode={darkMode} />
                              <InfoPill icon={<Fingerprint />} value={`ID: ${employee.employeeId}`} darkMode={darkMode} />
                            </div>
                          </div>
                        </div>

                        <div className="w-full lg:w-auto flex gap-3">
                          <button
                            onClick={() => navigate("/employeesettings")}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold hover:opacity-90 transition text-sm"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => navigate("/employeeleave")}
                            className={`px-5 py-2.5 rounded-xl border font-medium text-sm ${softBorder} ${softBg} ${hoverBg}`}
                          >
                            Request Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`lg:col-span-2 rounded-3xl border p-6 ${cardBg}`}
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCircle2 className="w-5 h-5 text-emerald-500" />
                          <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                            Personal Information
                          </p>
                        </div>
                        <h3 className="text-xl font-semibold">
                          Employee Details
                        </h3>
                        <p className={`mt-1 text-sm ${subText}`}>
                          Complete profile information
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailCard icon={<UserCircle2 />} label="Full Name" value={employee?.name} darkMode={darkMode} subText={subText} />
                        <DetailCard icon={<Fingerprint />} label="Employee ID" value={employee?.employeeId} darkMode={darkMode} subText={subText} />
                        <DetailCard icon={<Cake />} label="Date of Birth" value={employee?.dob ? toDateInput(employee.dob) : "—"} darkMode={darkMode} subText={subText} />
                        <DetailCard icon={<VenusAndMars />} label="Gender" value={employee?.gender} darkMode={darkMode} subText={subText} />
                        <DetailCard icon={<Building2 />} label="Department" value={employee?.departmentName} darkMode={darkMode} subText={subText} />
                        <DetailCard icon={<HeartHandshake />} label="Marital Status" value={employee?.maritalStatus} darkMode={darkMode} subText={subText} />
                        <DetailCard icon={<Globe />} label="Location" value={employee?.location} darkMode={darkMode} subText={subText} />
                        <DetailCard icon={<Briefcase />} label="Employee Type" value={employee?.employeeType} darkMode={darkMode} subText={subText} />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-6"
                    >
                      <div className={`rounded-3xl border p-6 ${cardBg}`}>
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-emerald-500" />
                            <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                              Quick Info
                            </p>
                          </div>
                          <h3 className="text-lg font-semibold">
                            Account Overview
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <QuickInfoCard label="Email" value={employee?.email} icon={Mail} darkMode={darkMode} subText={subText} />
                          <QuickInfoCard label="Phone" value={employee?.phone} icon={Phone} darkMode={darkMode} subText={subText} />
                          <QuickInfoCard label="Department" value={employee?.departmentName} icon={Building2} darkMode={darkMode} subText={subText} />
                          <QuickInfoCard label="Role" value={employee?.role} icon={ShieldCheck} darkMode={darkMode} subText={subText} />
                          <QuickInfoCard label="Join Date" value={toDateInput(employee?.joinDate)} icon={Calendar} darkMode={darkMode} subText={subText} />
                        </div>
                      </div>

                      <div className={`rounded-3xl border p-6 ${cardBg}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="w-5 h-5 text-amber-500" />
                          <p className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${subText}`}>
                            Achievements
                          </p>
                        </div>
                        <div className="space-y-2">
                          {achievements.map((achievement, idx) => (
                            <div key={idx} className={`flex items-center gap-2 text-sm py-1 ${subText}`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                          item.active ? "bg-emerald-500 text-white" : hoverBg
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

function InfoPill({ icon, value, darkMode }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
        darkMode
          ? "border-slate-800 bg-slate-950/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      {React.cloneElement(icon, { className: "w-4 h-4 text-emerald-500" })}
      <span className="text-sm truncate">{value}</span>
    </div>
  );
}

function DetailCard({ icon, label, value, darkMode, subText }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 ${
        darkMode
          ? "border-slate-800 bg-slate-950/60 hover:bg-slate-900"
          : "border-slate-200 bg-slate-50 hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          {React.cloneElement(icon, { className: "w-4 h-4" })}
        </div>
        <p className={`text-[10px] uppercase tracking-[0.15em] font-semibold ${subText}`}>
          {label}
        </p>
      </div>
      <p className="text-sm font-semibold break-words">{value}</p>
    </div>
  );
}

function QuickInfoCard({ label, value, icon: Icon, darkMode, subText }) {
  return (
    <div
      className={`flex items-center justify-between py-2 border-b last:border-0 ${
        darkMode ? "border-slate-800" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${subText}`} />
        <span className={`text-xs ${subText}`}>{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}