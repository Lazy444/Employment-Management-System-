import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const HOST_BASE = "http://localhost:5000"; // ✅ for images/static
const API_BASE = "http://localhost:5000/api"; // ✅ for API calls

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

/** ✅ Same logic as EmployeeList */
const resolveImageUrl = (maybeUrl) => {
  if (!maybeUrl) return "";
  const url = String(maybeUrl);
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${HOST_BASE}${url}`;
  return `${HOST_BASE}/${url}`;
};

/** ✅ Match EmployeeList date display */
const toDateInput = (value) => {
  if (!value) return "—";
  try {
    return String(value).slice(0, 10);
  } catch {
    return "—";
  }
};

/** ✅ Normalize response to match EmployeeList fields */
const normalizeEmployee = (raw) => {
  const u = raw || {};

  const rawImage = u.imageUrl || u.profileImage || u.image || "";
  const departmentName = u.departmentName || (u.department?.name ?? u.department ?? "—");

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
  };
};

export default function EmployeeProfile() {
  const navigate = useNavigate();

  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? true;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [employee, setEmployee] = useState(null);

  const employeeName = useMemo(() => {
    return localStorage.getItem("employeeName") || employee?.name || "Employee";
  }, [employee?.name]);

  const initials = useMemo(() => getInitials(employeeName), [employeeName]);

  const fetchMyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("No login token found. Please login again.");
        navigate("/employee-login", { replace: true });
        return;
      }

      // ✅ Correct endpoint: /api/employees/me
      const res = await fetch(`${API_BASE}/employees/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
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

  const firstName = employee?.name && employee.name !== "—" ? employee.name.split(" ")[0] : "Employee";

  return (
    <div className="min-h-screen bg-[#070B18] text-slate-100">
      {/* background glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-20 right-[-120px] w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative flex"
      >
        {/* SIDEBAR */}
        <aside className="w-[280px] min-h-screen border-r border-white/10 bg-gradient-to-b from-[#0B1024] to-[#070B18]">
          <div className="px-6 pt-6 pb-4">
            <div className="text-emerald-300 font-extrabold tracking-widest text-sm">EMPLOYEE MS</div>
            <div className="text-slate-400 text-xs mt-1">Employee Portal</div>
          </div>

          <div className="px-4 mt-2 space-y-2">
            <button
              onClick={() => navigate("/employeeprofile")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-emerald-500/15 border border-emerald-500/25"
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-white/0 hover:bg-white/5 border border-white/0 hover:border-white/10 transition"
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

        {/* MAIN */}
        <div className="flex-1 flex flex-col">
          {/* TOPBAR */}
          <div className="h-16 px-8 flex items-center justify-between border-b border-white/10">
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.25em] text-slate-400 uppercase">My Profile</span>
              <span className="text-sm md:text-base font-semibold">
                Welcome, <span className="text-white">{firstName}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                title="Theme"
              >
                {darkMode ? (
                  <SunMedium className="w-4 h-4 text-slate-200" />
                ) : (
                  <MoonStar className="w-4 h-4 text-slate-200" />
                )}
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 grid place-items-center">
                <span className="font-bold text-emerald-200">{initials}</span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 px-8 py-8">
            {errorMsg ? (
              <div className="max-w-5xl mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {errorMsg}
              </div>
            ) : null}

            {loading ? (
              <div className="max-w-5xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
                <span className="text-sm text-slate-300">Loading your profile…</span>
              </div>
            ) : !employee ? (
              <div className="max-w-5xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center">
                <p className="text-sm text-slate-300">Profile not available.</p>
                <button
                  onClick={fetchMyProfile}
                  className="mt-3 text-xs px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/15 transition"
                >
                  Retry
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                className="max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Employee Details</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Profile fields are aligned with the Admin Employee List.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-200">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {employee?.status || "Active"}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  {/* Left Card (REAL IMAGE SUPPORT) */}
                  <div className="w-full md:w-2/5">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 aspect-[4/3] shadow-md">
                      {employee.imageUrl ? (
                        <img
                          src={employee.imageUrl}
                          alt="Profile"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : null}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {!employee.imageUrl ? (
                          <div className="h-20 w-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-semibold">
                            {employee?.name?.charAt(0) || "E"}
                          </div>
                        ) : null}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-sm font-semibold text-white truncate">{employee.name}</p>
                        <p className="text-[11px] text-slate-200/90 truncate">{employee.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-emerald-200" />
                        <span>{employee.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-emerald-200" />
                        <span>{employee.email || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 text-sm">
                    <Field label="Name" value={employee?.name || "—"} />
                    <Field label="Employee ID" value={employee?.employeeId || "—"} />
                    <Field
                      icon={<Cake className="w-4 h-4 text-emerald-200" />}
                      label="Date of Birth"
                      value={employee?.dob ? toDateInput(employee.dob) : "—"}
                    />
                    <Field label="Gender" value={employee?.gender || "—"} />
                    <Field
                      icon={<Building2 className="w-4 h-4 text-emerald-200" />}
                      label="Department"
                      value={employee?.departmentName || employee?.department?.name || employee?.department || "—"}
                    />
                    <Field label="Marital Status" value={employee?.maritalStatus || "—"} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Field({ label, value, icon }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400 flex items-center gap-2">
        {icon ? icon : null}
        {label}
      </p>
      <p className="font-medium text-slate-100">{value}</p>
    </div>
  );
}
