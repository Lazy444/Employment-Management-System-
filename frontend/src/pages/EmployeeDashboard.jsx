// src/pages/employee/EmployeeProfile.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";


const EmployeeProfile = () => {
  const navigate = useNavigate();

  // Safely use ThemeContext
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  // demo data – replace with real API / auth data later
  const employee = {
    name: "Asif Khan",
    employeeId: "asif113",
    dob: "29 June 2022",
    gender: "Male",
    department: "Database",
    maritalStatus: "Single",
    phone: "+61 400 000 000",
    email: "asif.khan@example.com",
    status: "Active",
  };

  const bgMain = darkMode ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-900";
  const cardBg = darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-h-screen flex ${bgMain}`}
    >
      {/* SIDEBAR */}
      <aside
        className={`hidden md:flex w-60 flex-col border-r ${
          darkMode
            ? "border-slate-800 bg-slate-950"
            : "border-slate-200 bg-slate-900 text-slate-50"
        }`}
      >
        <div className="px-5 py-4 border-b border-slate-800">
          <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Employee MS
          </span>
          <p className="mt-1 text-xs text-slate-300">Employee Portal</p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          {[
            { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: "My Profile", icon: <UserCircle2 className="w-4 h-4" />, active: true },
            { label: "Leave", icon: <CalendarDays className="w-4 h-4" /> },
            { label: "Salary", icon: <WalletCards className="w-4 h-4" /> },
            { label: "Setting", icon: <Settings className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                item.active
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-200 hover:bg-slate-800/70"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
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
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR (teal vibe + theme toggle) */}
        <div
          className={`w-full border-b ${
            darkMode
              ? "border-slate-800 bg-slate-900/90"
              : "border-slate-200 bg-emerald-600/95"
          } backdrop-blur`}
        >
          <div className="flex items-center justify-between px-4 py-3 md:px-8 gap-3">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.22em] text-slate-100/90">
                My Profile
              </span>
              <span className="text-sm md:text-base font-semibold text-white">
                Welcome, {employee.name.split(" ")[0]}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* theme toggle */}
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-slate-950/25 px-2.5 py-1.5 text-xs text-slate-50 hover:bg-slate-950/45 transition"
              >
                {darkMode ? (
                  <SunMedium className="w-4 h-4" />
                ) : (
                  <MoonStar className="w-4 h-4" />
                )}
              </button>

              {/* logout */}
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
        <div className="flex-1 px-4 md:px-8 py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`max-w-4xl mx-auto rounded-3xl border shadow-sm ${cardBg} px-5 py-6 md:px-8 md:py-7`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-semibold tracking-tight">
                  Employee Details
                </h2>
                <p className={`text-xs md:text-sm ${subText}`}>
                  Basic information linked to your employee account.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-500">
                <BadgeCheck className="w-3.5 h-3.5" />
                {employee.status}
              </span>
            </div>

            {/* Body: avatar + details */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              {/* Avatar / left block */}
              <div className="w-full md:w-2/5">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 aspect-[4/3] flex items-center justify-center shadow-md">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_0,white,transparent_55%),radial-gradient(circle_at_80%_120%,white,transparent_55%)]" />
                  <div className="relative flex flex-col items-center justify-center text-white">
                    <div className="h-20 w-20 rounded-full bg-slate-950/15 border border-white/40 flex items-center justify-center text-3xl font-semibold mb-3">
                      {employee.name.charAt(0)}
                    </div>
                    <p className="text-sm font-medium">{employee.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/90 mt-1">
                      Employee Profile
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span className={subText}>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    <span className={subText}>{employee.email}</span>
                  </div>
                </div>
              </div>

              {/* Right column: field list */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 text-sm">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400">
                    Name
                  </p>
                  <p className="font-medium">{employee.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400">
                    Employee ID
                  </p>
                  <p className="font-medium">{employee.employeeId}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Cake className="w-3.5 h-3.5 text-emerald-500" />
                    Date of Birth
                  </p>
                  <p className="font-medium">{employee.dob}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400">
                    Gender
                  </p>
                  <p className="font-medium">{employee.gender}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    Department
                  </p>
                  <p className="font-medium">{employee.department}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400">
                    Marital Status
                  </p>
                  <p className="font-medium">{employee.maritalStatus}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeProfile;