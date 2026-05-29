/* eslint-disable no-unused-vars */
// src/pages/admin/AdminAttendanceToday.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  RefreshCw,
  BadgeCheck,
  BadgeX,
  Clock,
  Pencil,
  Save,
  X,
  AlertTriangle,
  Timer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Edit3,
  Filter,
  Download,
  ArrowLeft,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";

/* ------------------------- Helpers ------------------------- */
const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const pad2 = (n) => String(n).padStart(2, "0");

const prettyTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  } catch {
    return "—";
  }
};

const prettyDate = (workDate) => {
  if (!workDate) return "";
  try {
    const [y, m, d] = String(workDate).split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString([], { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  } catch {
    return workDate;
  }
};

const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r} min`;
  if (r === 0) return `${h} hr`;
  return `${h} hr ${r} min`;
};

const toDatetimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const fromDatetimeLocal = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toISOString();
};

const getAttendancePercentage = (present, total) => {
  if (total === 0) return 0;
  return ((present / total) * 100).toFixed(1);
};

/* ------------------------- Component ------------------------- */
export default function AdminAttendanceToday() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const [workDate, setWorkDate] = useState("");
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, inNow: 0 });
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departments, setDepartments] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [inVal, setInVal] = useState("");
  const [outVal, setOutVal] = useState("");

  /* -------------------- Theme Tokens -------------------- */
  const theme = useMemo(() => {
    const isDarkMode = isDark;
    
    return {
      bg: isDarkMode 
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" 
        : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      card: isDarkMode 
        ? "rgba(30, 41, 59, 0.95)" 
        : "rgba(255, 255, 255, 0.95)",
      cardSolid: isDarkMode
        ? "#1e293b"
        : "#ffffff",
      border: isDarkMode 
        ? "rgba(71, 85, 105, 0.5)" 
        : "rgba(203, 213, 225, 0.8)",
      text: isDarkMode ? "#f1f5f9" : "#0f172a",
      textPrimary: isDarkMode ? "#ffffff" : "#1e293b",
      textSecondary: isDarkMode ? "rgba(148, 163, 184, 0.9)" : "rgba(100, 116, 139, 0.9)",
      soft: isDarkMode ? "rgba(51, 65, 85, 0.6)" : "rgba(241, 245, 249, 0.8)",
      green: "#10b981",
      red: "#ef4444",
      amber: "#f59e0b",
      blue: "#3b82f6",
      purple: "#8b5cf6",
      pink: "#ec4899",
      inputBg: isDarkMode ? "rgba(51, 65, 85, 0.8)" : "rgba(255, 255, 255, 0.9)",
      placeholder: isDarkMode ? "#64748b" : "#94a3b8",
    };
  }, [isDark]);

  /* ------------------------- API ------------------------- */
  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/admin/attendance/today`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Failed to load");

      setWorkDate(data?.workDate || "");
      setSummary(data?.summary || { total: 0, present: 0, absent: 0, inNow: 0 });
      const employees = Array.isArray(data?.rows) ? data.rows : [];
      setRows(employees);
      
      // Extract unique departments for filter
      const depts = [...new Set(employees.map(r => 
        r?.employee?.department?.name || 
        r?.employee?.departmentNameResolved || 
        r?.employee?.departmentName || 
        "Unassigned"
      ))];
      setDepartments(depts);
      
      toast.success("Attendance data refreshed");
    } catch (e) {
      setError(e?.message || "Failed to load admin attendance");
      toast.error(e?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  /* --------------------- Filtering --------------------- */
  const filtered = useMemo(() => {
    const term = String(q || "").trim().toLowerCase();

    return (rows || [])
      .filter((r) => {
        if (filter === "present") return r.present;
        if (filter === "absent") return !r.present;
        if (filter === "innow") return r.inNow;
        return true;
      })
      .filter((r) => {
        const empDept = r?.employee?.department?.name || 
                        r?.employee?.departmentNameResolved || 
                        r?.employee?.departmentName || 
                        "Unassigned";
        if (departmentFilter !== "all" && empDept !== departmentFilter) return false;
        return true;
      })
      .filter((r) => {
        if (!term) return true;
        const emp = r?.employee || {};
        const deptName = emp?.department?.name || emp?.departmentNameResolved || emp?.departmentName || "";
        const hay = [emp.name, emp.email, emp.phone, emp.employeeId, deptName, emp.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      });
  }, [rows, q, filter, departmentFilter]);

  const attendanceRate = getAttendancePercentage(summary.present, summary.total);

  /* --------------------- Modal --------------------- */
  const openEdit = useCallback((row) => {
    setSelected(row);
    const att = row?.attendance;
    setInVal(toDatetimeLocal(att?.punchedInAt || ""));
    setOutVal(toDatetimeLocal(att?.punchedOutAt || ""));
    setModalOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
    setInVal("");
    setOutVal("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!selected) return;
    if (acting) return;

    const empId = selected?.employee?._id;
    const attId = selected?.attendance?._id;

    const payload = {
      employeeId: empId,
      punchedInAt: fromDatetimeLocal(inVal),
      punchedOutAt: fromDatetimeLocal(outVal),
    };

    if (!payload.employeeId) {
      toast.error("Employee ID missing");
      return;
    }

    if (!payload.punchedInAt) {
      toast.error("Punch In time is required");
      return;
    }

    setActing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      let res;
      if (attId) {
        res = await fetch(`${API_BASE}/admin/attendance/${attId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            punchedInAt: payload.punchedInAt,
            punchedOutAt: payload.punchedOutAt ? payload.punchedOutAt : "",
          }),
        });
      } else {
        res = await fetch(`${API_BASE}/admin/attendance/today/upsert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Save failed");

      await fetchToday();
      toast.success("Attendance updated successfully");
      closeEdit();
    } catch (e) {
      toast.error(e?.message || "Save failed");
      setError(e?.message || "Save failed");
    } finally {
      setActing(false);
    }
  }, [acting, closeEdit, fetchToday, inVal, outVal, selected]);

  const exportToCSV = () => {
    const headers = ["Employee Name", "Email", "Employee ID", "Department", "Status", "Punch In", "Punch Out", "Worked Hours"];
    const data = filtered.map(r => {
      const emp = r.employee || {};
      const att = r.attendance || null;
      return [
        emp.name || "—",
        emp.email || "—",
        emp.employeeId || "—",
        emp?.department?.name || emp?.departmentNameResolved || emp?.departmentName || "—",
        r.present ? (r.inNow ? "IN" : "OUT") : "ABSENT",
        prettyTime(att?.punchedInAt),
        prettyTime(att?.punchedOutAt),
        att?.punchedOutAt ? minutesToHM(att?.totalMinutes) : "—"
      ];
    });
    
    const csvContent = [headers, ...data].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${workDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtext }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: "20px",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: theme.textSecondary, fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {title}
          </p>
          <p style={{ color: theme.text, fontSize: "32px", fontWeight: 700, marginTop: "8px" }}>
            {value}
          </p>
          {subtext && (
            <p style={{ color: theme.textSecondary, fontSize: "12px", marginTop: "4px" }}>{subtext}</p>
          )}
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
              {trend > 0 ? (
                <TrendingUp size={14} style={{ color: theme.green }} />
              ) : (
                <TrendingDown size={14} style={{ color: theme.red }} />
              )}
              <span style={{ color: trend > 0 ? theme.green : theme.red, fontSize: "12px", fontWeight: 600 }}>
                {Math.abs(trend)}% from yesterday
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            padding: "12px",
            borderRadius: "16px",
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, padding: "24px", position: "relative" }}>
      {/* Animated Background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.green}15 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.blue}15 0%, transparent 70%)` }} />
      </div>

      {/* Header Section with Back Button and Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admindashboard")}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
              }}
            >
              <ArrowLeft size={20} />
            </motion.button>

            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "20px",
                display: "grid",
                placeItems: "center",
                background: `linear-gradient(135deg, ${theme.green}, ${theme.blue})`,
                boxShadow: `0 10px 25px -5px ${theme.green}40`,
              }}
            >
              <Users size={28} style={{ color: "white" }} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, background: `linear-gradient(135deg, ${theme.text}, ${theme.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Attendance Management
              </h1>
              <div style={{ marginTop: "6px", color: theme.textSecondary, fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={14} />
                {workDate ? prettyDate(workDate) : "Today"}
                <span style={{ width: "4px", height: "4px", background: theme.textSecondary, borderRadius: "50%" }} />
                <Activity size={14} />
                Real-time tracking
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                padding: "10px 20px",
                borderRadius: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backdropFilter: "blur(10px)",
              }}
            >
              <Download size={18} />
              Export
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchToday}
              disabled={loading}
              style={{
                border: `1px solid ${theme.border}`,
                background: `linear-gradient(135deg, ${theme.green}, ${theme.blue})`,
                color: "white",
                padding: "10px 20px",
                borderRadius: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <StatCard 
          title="Total Employees" 
          value={summary.total} 
          icon={Users} 
          color={theme.blue}
          subtext="Active workforce"
        />
        <StatCard 
          title="Present Today" 
          value={summary.present} 
          icon={UserCheck} 
          color={theme.green}
          trend={attendanceRate > 75 ? 5 : -3}
          subtext={`${attendanceRate}% attendance rate`}
        />
        <StatCard 
          title="Absent" 
          value={summary.absent} 
          icon={UserX} 
          color={theme.red}
          subtext="Not checked in"
        />
        <StatCard 
          title="Currently In" 
          value={summary.inNow} 
          icon={Clock} 
          color={theme.amber}
          subtext="Working now"
        />
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: "24px",
          padding: "20px",
          marginBottom: "24px",
          backdropFilter: "blur(10px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: theme.textSecondary }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, ID, or department..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "16px",
                border: `1px solid ${theme.border}`,
                background: theme.inputBg,
                color: theme.text,
                outline: "none",
                fontWeight: 500,
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                padding: "8px 20px",
                borderRadius: "12px",
                border: `1px solid ${filter === "all" ? theme.green : theme.border}`,
                background: filter === "all" ? `${theme.green}20` : theme.soft,
                color: filter === "all" ? theme.green : theme.text,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s",
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter("present")}
              style={{
                padding: "8px 20px",
                borderRadius: "12px",
                border: `1px solid ${filter === "present" ? theme.green : theme.border}`,
                background: filter === "present" ? `${theme.green}20` : theme.soft,
                color: filter === "present" ? theme.green : theme.text,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s",
              }}
            >
              <BadgeCheck size={14} style={{ display: "inline", marginRight: "6px" }} />
              Present
            </button>
            <button
              onClick={() => setFilter("absent")}
              style={{
                padding: "8px 20px",
                borderRadius: "12px",
                border: `1px solid ${filter === "absent" ? theme.red : theme.border}`,
                background: filter === "absent" ? `${theme.red}20` : theme.soft,
                color: filter === "absent" ? theme.red : theme.text,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s",
              }}
            >
              <BadgeX size={14} style={{ display: "inline", marginRight: "6px" }} />
              Absent
            </button>
            <button
              onClick={() => setFilter("innow")}
              style={{
                padding: "8px 20px",
                borderRadius: "12px",
                border: `1px solid ${filter === "innow" ? theme.amber : theme.border}`,
                background: filter === "innow" ? `${theme.amber}20` : theme.soft,
                color: filter === "innow" ? theme.amber : theme.text,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s",
              }}
            >
              <Clock size={14} style={{ display: "inline", marginRight: "6px" }} />
              In Now
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${theme.border}` }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: theme.textSecondary, fontSize: "13px", fontWeight: 600 }}>Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${theme.border}`,
                  background: theme.inputBg,
                  color: theme.text,
                  outline: "none",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <div style={{ color: theme.textSecondary, fontSize: "13px", fontWeight: 500 }}>
            Showing {filtered.length} of {rows.length} employees
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              color: theme.green,
              fontSize: "13px",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Filter size={14} />
            {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
            {showAdvancedFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: "24px",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ overflowX: "auto", maxHeight: "600px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, background: theme.cardSolid, zIndex: 10 }}>
              <tr>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${theme.border}` }}>
                  Employee
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${theme.border}` }}>
                  Department
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${theme.border}` }}>
                  Status
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${theme.border}` }}>
                  Punch In
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${theme.border}` }}>
                  Punch Out
                </th>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${theme.border}` }}>
                  Worked
                </th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${theme.border}` }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: "60px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: `2px solid ${theme.green}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
                      <p style={{ color: theme.textSecondary }}>Loading attendance data...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "60px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Search size={48} style={{ color: theme.textSecondary, opacity: 0.5 }} />
                      <p style={{ color: theme.textSecondary, fontSize: "16px", fontWeight: 500 }}>No employees found</p>
                      <p style={{ color: theme.textSecondary, fontSize: "13px" }}>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, index) => {
                  const emp = r.employee || {};
                  const att = r.attendance || null;
                  const deptName = emp?.department?.name || emp?.departmentNameResolved || emp?.departmentName || "—";
                  const statusText = r.present ? (r.inNow ? "IN" : "OUT") : "ABSENT";
                  const statusColor = !r.present ? theme.red : r.inNow ? theme.green : theme.textSecondary;
                  const statusIcon = !r.present ? <XCircle size={14} /> : r.inNow ? <CheckCircle size={14} /> : <Clock size={14} />;

                  return (
                    <motion.tr
                      key={emp._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ background: theme.soft }}
                      style={{ borderBottom: `1px solid ${theme.border}`, transition: "background 0.2s" }}
                    >
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              background: `linear-gradient(135deg, ${theme.green}20, ${theme.blue}20)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            <span style={{ fontSize: "16px", fontWeight: 700, color: theme.text }}>{emp.name?.charAt(0) || "?"}</span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: theme.text }}>{emp.name || "—"}</div>
                            <div style={{ fontSize: "12px", color: theme.textSecondary, marginTop: "2px" }}>{emp.email || "—"}</div>
                            {emp.employeeId && (
                              <div style={{ fontSize: "11px", color: theme.textSecondary, marginTop: "2px" }}>ID: {emp.employeeId}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px", fontSize: "13px", fontWeight: 500, color: theme.text }}>{deptName}</td>

                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            background: `${statusColor}20`,
                            color: statusColor,
                            fontWeight: 600,
                            fontSize: "12px",
                          }}
                        >
                          {statusIcon}
                          {statusText}
                        </span>
                      </td>

                      <td style={{ padding: "16px", fontSize: "13px", fontWeight: 500, color: theme.text }}>{prettyTime(att?.punchedInAt)}</td>
                      <td style={{ padding: "16px", fontSize: "13px", fontWeight: 500, color: theme.text }}>{prettyTime(att?.punchedOutAt)}</td>

                      <td style={{ padding: "16px" }}>
                        {att?.punchedOutAt ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, color: theme.green }}>
                            <Timer size={14} />
                            {minutesToHM(att?.totalMinutes)}
                          </span>
                        ) : "—"}
                      </td>

                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEdit(r)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "12px",
                            border: `1px solid ${theme.border}`,
                            background: theme.soft,
                            color: theme.text,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "12px",
                            transition: "all 0.2s",
                          }}
                        >
                          <Edit3 size={14} />
                          Edit
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {modalOpen && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEdit();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: "min(560px, 90vw)",
                background: theme.cardSolid,
                border: `1px solid ${theme.border}`,
                borderRadius: "28px",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "24px", borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: theme.text }}>Edit Attendance</h2>
                    <p style={{ color: theme.textSecondary, fontSize: "13px", marginTop: "4px" }}>
                      {selected?.employee?.name} • {selected?.employee?.department?.name || "—"}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeEdit}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      border: `1px solid ${theme.border}`,
                      background: theme.soft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={18} style={{ color: theme.text }} />
                  </motion.button>
                </div>
              </div>

              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gap: "20px" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: theme.textSecondary, display: "block", marginBottom: "8px" }}>
                      Punch In Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={inVal}
                      onChange={(e) => setInVal(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "14px",
                        border: `1px solid ${theme.border}`,
                        background: theme.inputBg,
                        color: theme.text,
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: theme.textSecondary, display: "block", marginBottom: "8px" }}>
                      Punch Out Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={outVal}
                      onChange={(e) => setOutVal(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "14px",
                        border: `1px solid ${theme.border}`,
                        background: theme.inputBg,
                        color: theme.text,
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                    <p style={{ color: theme.textSecondary, fontSize: "11px", marginTop: "6px" }}>
                      Leave blank to keep employee as IN
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "20px 24px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeEdit}
                  disabled={acting}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "14px",
                    border: `1px solid ${theme.border}`,
                    background: theme.soft,
                    color: theme.text,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: acting ? 0.6 : 1,
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveEdit}
                  disabled={acting}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "14px",
                    background: `linear-gradient(135deg, ${theme.green}, ${theme.blue})`,
                    color: "white",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: acting ? 0.7 : 1,
                  }}
                >
                  {acting ? (
                    <>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.6s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}