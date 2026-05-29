import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  Clock,
  BookMarked,
  Calendar,
  ArrowLeft,
  Loader2,
  PlusCircle,
  Briefcase,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const navItems = [
  {
    label: "My Profile",
    icon: UserCircle2,
    path: "/employeeprofile",
  },
  {
    label: "Leave",
    icon: CalendarDays,
    path: "/employeeleave",
    active: true,
  },
  {
    label: "Salary",
    icon: WalletCards,
    path: "/employeesalary",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/employeesettings",
  },
  {
    label: "Manager Dashboard",
    icon: BookMarked,
    path: "/employeemanager",
  },
  {
    label: "Calendar",
    icon: Calendar,
    path: "/calender",
  },
  {
    label: "Punch Clock",
    icon: Clock,
    path: "/punch-clock",
  },
];

export default function AddNewLeave() {
  const navigate = useNavigate();

  const employeeName = localStorage.getItem("employeeName") || "Employee";
  const initials = getInitials(employeeName);

  const leaveTypes = useMemo(
    () => ["Sick Leave", "Annual Leave", "Casual Leave", "Unpaid Leave", "Other"],
    []
  );

  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const submit = async (e) => {
    e.preventDefault();

    if (!leaveType || !fromDate || !toDate) {
      alert("Please fill all required fields");
      return;
    }

    if (fromDate < todayStr) {
      alert("You cannot apply leave on previous dates");
      return;
    }

    if (toDate < fromDate) {
      alert("To Date cannot be before From Date");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/employee-login");
        return;
      }

      const res = await fetch(`${API_BASE}/employees/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leaveType,
          fromDate,
          toDate,
          description,
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/employee-login");
        return;
      }

      if (!res.ok) {
        alert(data?.message || "Failed to submit leave");
        return;
      }

      alert(data?.message || "Leave request submitted");
      navigate("/employeeleave");
    } catch (err) {
      alert("Failed to submit leave");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    navigate("/employee-login", { replace: true });
  };

  const leaveBalance = {
    annual: { used: 4, limit: 12 },
    sick: { used: 2, limit: 10 },
    casual: { used: 3, limit: 8 },
  };

  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentYear, today.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(6,182,212,0.12),_transparent_26%),radial-gradient(circle_at_bottom_center,_rgba(99,102,241,0.12),_transparent_28%)]" />
        <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-white/[0.03] to-transparent" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="hidden lg:flex w-[290px] xl:w-[310px] flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="px-6 py-7 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black flex items-center justify-center shadow-lg">
                EMS
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-[0.18em] text-emerald-300 uppercase">
                  Employee MS
                </h1>
                <p className="text-xs text-slate-400 mt-1">Smart employee portal</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 flex-1">
            <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-white/10 flex items-center justify-center font-bold text-emerald-200">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{employeeName}</p>
                  <p className="text-xs text-slate-400 truncate">Employee Portal</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`group w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 border ${
                      item.active
                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/15 border-emerald-400/20 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                        item.active
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-white/[0.05] text-slate-300 group-hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-sm ${
                        item.active
                          ? "text-white font-semibold"
                          : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-400/20 px-4 py-3 text-sm font-medium text-rose-200 flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
            <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-200" />
                </button>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                    Add Leave
                  </p>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Submit your leave request
                  </h2>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                  <span className="font-bold text-emerald-200">{initials}</span>
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white truncate max-w-[180px]">
                    {employeeName}
                  </p>
                  <p className="text-xs text-slate-400">Leave Request Panel</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl space-y-6"
            >
              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-indigo-500/10" />
                <div className="relative p-6 md:p-8 xl:p-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                      Leave Application
                    </p>
                    <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white">
                      Request leave professionally
                    </h1>
                    <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                      Fill in your leave details, review your leave balance, and
                      choose dates clearly with a cleaner and more premium layout.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/employeeleave")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-medium text-white hover:bg-white/[0.08] transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Leaves
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LeaveLimitCard
                  title="Annual Leave"
                  used={leaveBalance.annual.used}
                  limit={leaveBalance.annual.limit}
                />
                <LeaveLimitCard
                  title="Sick Leave"
                  used={leaveBalance.sick.used}
                  limit={leaveBalance.sick.limit}
                />
                <LeaveLimitCard
                  title="Casual Leave"
                  used={leaveBalance.casual.used}
                  limit={leaveBalance.casual.limit}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 rounded-[28px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-7">
                  <div className="mb-6">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                      Request Form
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      Leave request details
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Please complete all fields carefully. Previous dates,
                      overlapping dates, and more than one request in the same month
                      are not allowed.
                    </p>
                  </div>

                  <form onSubmit={submit} className="space-y-5">
                    <div>
                      <label className="block text-xs tracking-widest text-slate-400 uppercase mb-2">
                        Leave Type
                      </label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                        required
                      >
                        <option value="" disabled>
                          Select Leave Type
                        </option>
                        {leaveTypes.map((t) => (
                          <option key={t} value={t} className="bg-slate-900">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs tracking-widest text-slate-400 uppercase mb-2">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={fromDate}
                          min={todayStr}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFromDate(val);

                            if (toDate && val && toDate < val) {
                              setToDate(val);
                            }
                          }}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs tracking-widest text-slate-400 uppercase mb-2">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={toDate}
                          min={fromDate || todayStr}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs tracking-widest text-slate-400 uppercase mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write a short reason for your leave request"
                        rows={5}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold hover:opacity-95 transition disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            Submit Leave Request
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/employeeleave")}
                        className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition text-slate-200"
                      >
                        Cancel and Go Back
                      </button>
                    </div>

                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                      Note: You cannot apply leave for past dates, overlap existing
                      leave dates, or create more than one leave request in the same month.
                    </div>
                  </form>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-7">
                    <div className="mb-6">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                        Calendar
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        {currentMonth} {currentYear}
                      </h3>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 mb-3">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="py-2 font-medium">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, index) => {
                        const isToday = day === today.getDate();
                        return (
                          <div
                            key={index}
                            className={`aspect-square rounded-xl flex items-center justify-center text-sm border ${
                              day
                                ? isToday
                                  ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200 font-bold"
                                  : "bg-white/[0.04] border-white/10 text-slate-200"
                                : "bg-transparent border-transparent"
                            }`}
                          >
                            {day || ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-7">
                    <div className="mb-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                        Quick Overview
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Leave request tips
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <MiniInfo label="Selected Employee" value={employeeName} />
                      <MiniInfo label="Department Access" value="Employee Portal" />
                      <MiniInfo label="Manager Dashboard" value="Available in sidebar" />
                      <MiniInfo label="Calendar Access" value="Available in sidebar" />
                    </div>

                    <button
                      onClick={() => navigate("/employeemanager")}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 font-medium text-white hover:bg-white/[0.08] transition"
                    >
                      <Briefcase className="w-4 h-4" />
                      Open Manager Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function LeaveLimitCard({ title, used, limit }) {
  const remaining = Math.max(limit - used, 0);
  const percent = Math.min((used / limit) * 100, 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="text-xs text-slate-400">
          {used}/{limit}
        </span>
      </div>

      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-400">Remaining</span>
        <span className="font-semibold text-emerald-200">{remaining} days</span>
      </div>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-white break-words">{value}</p>
    </div>
  );
}