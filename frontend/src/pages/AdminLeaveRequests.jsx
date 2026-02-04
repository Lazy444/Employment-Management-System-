// src/pages/AdminLeaveRequests.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  ArrowLeft,
  CalendarDays,
  Search,
  Filter,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquareText,
  UserCircle2,
  Building2,
  Mail,
  ShieldCheck,
  X,
  Clock,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

/**
 * AdminLeaveRequests
 * ✅ Admin sees all leave requests
 * ✅ Filter by status + search by employee name/email/type
 * ✅ View details modal
 * ✅ Approve / Reject with optional note
 *
 * Backend endpoints assumed:
 *  GET    /api/admin/leaves?status=Pending|Approved|Rejected|Cancelled|All
 *  PATCH  /api/admin/leaves/:id/approve   { note? }
 *  PATCH  /api/admin/leaves/:id/reject    { note?, rejectReason? }
 */

const pill = (status) => {
  const base =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border";
  if (status === "Approved")
    return `${base} bg-emerald-500/10 text-emerald-300 border-emerald-500/30`;
  if (status === "Rejected")
    return `${base} bg-rose-500/10 text-rose-300 border-rose-500/30`;
  if (status === "Pending")
    return `${base} bg-amber-500/10 text-amber-300 border-amber-500/30`;
  if (status === "Cancelled")
    return `${base} bg-slate-500/10 text-slate-300 border-slate-500/30`;
  return `${base} bg-slate-500/10 text-slate-300 border-slate-500/30`;
};

const prettyDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
};

const prettyDateTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
};

const daysBetweenInclusive = (from, to) => {
  try {
    const a = new Date(from);
    const b = new Date(to);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
    return diff + 1;
  } catch {
    return "—";
  }
};

const AdminLeaveRequests = () => {
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const navigate = useNavigate();

  const bgMain = darkMode
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";
  const cardBg = darkMode
    ? "bg-slate-900/80 border-slate-800"
    : "bg-white border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  // ✅ fetch wrapper (no axios)
  const apiFetch = useCallback(
    async (path, options = {}) => {
      const url = `${API_BASE}${path}`;

      const headers = {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      };

      const hasBody =
        options.body !== undefined && options.body !== null && options.body !== "";
      if (hasBody && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(url, { ...options, headers });

      let data = null;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        data = text ? { message: text } : null;
      }

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          `Request failed with status code ${res.status}`;
        throw new Error(msg);
      }

      return data;
    },
    [token]
  );

  // DATA
  const [leaves, setLeaves] = useState([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");

  // Modals
  const [showView, setShowView] = useState(false);
  const [selected, setSelected] = useState(null);

  // Action inputs
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const qs =
        statusFilter && statusFilter !== "All"
          ? `?status=${encodeURIComponent(statusFilter)}`
          : "";

      const data = await apiFetch(`/api/admin/leaves${qs}`, { method: "GET" });

      // accept: {success:true, leaves:[]} OR {leaves:[]}
      const raw = data?.leaves || [];

      const normalized = raw.map((l) => ({
        _id: l._id,
        leaveType: l.leaveType || "—",
        fromDate: l.fromDate,
        toDate: l.toDate,
        description: l.description || "",
        status: l.status || "Pending",
        appliedDate: l.appliedDate || l.createdAt,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,

        employee: l.employee || null,
        employeeName: l.employee?.name || l.employeeName || "—",
        employeeEmail: l.employee?.email || l.employeeEmail || "—",
        employeePhone: l.employee?.phone || l.employeePhone || "—",
        departmentName:
          l.employee?.department?.name ||
          l.departmentName ||
          l.employee?.departmentName ||
          "—",
      }));

      setLeaves(normalized);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error loading leave requests");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const filteredLeaves = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return leaves;

    return leaves.filter((l) => {
      const hay = [
        l.employeeName,
        l.employeeEmail,
        l.leaveType,
        l.status,
        l.departmentName,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [leaves, searchTerm]);

  const openView = (leave) => {
    setSelected(leave);
    setNote("");
    setRejectReason("");
    setShowView(true);
  };

  const closeView = () => {
    setShowView(false);
    setSelected(null);
    setNote("");
    setRejectReason("");
  };

  const approveLeave = async () => {
    if (!selected?._id) return;

    try {
      setActing(true);
      setErrorMsg("");

      const payload = note.trim() ? { note: note.trim() } : {};

      const data = await apiFetch(`/api/admin/leaves/${selected._id}/approve`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (data?.success === false) {
        throw new Error(data?.error || "Failed to approve");
      }

      closeView();
      await fetchLeaves();
      alert("✅ Leave approved!");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error approving leave");
    } finally {
      setActing(false);
    }
  };

  const rejectLeave = async () => {
    if (!selected?._id) return;

    try {
      setActing(true);
      setErrorMsg("");

      const payload = {};
      if (note.trim()) payload.note = note.trim();
      if (rejectReason.trim()) payload.rejectReason = rejectReason.trim();

      const data = await apiFetch(`/api/admin/leaves/${selected._id}/reject`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (data?.success === false) {
        throw new Error(data?.error || "Failed to reject");
      }

      closeView();
      await fetchLeaves();
      alert("❌ Leave rejected!");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error rejecting leave");
    } finally {
      setActing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-h-screen w-full px-4 md:px-8 py-6 md:py-8 ${bgMain}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ArrowLeft
              className="w-5 h-5 cursor-pointer"
              onClick={() => navigate("/admindashboard")}
            />
            <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              Leave Requests
            </h1>
          </div>
          <p className={`text-xs md:text-sm ${subText}`}>
            Review employee leave applications and take action.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeaves}
            className="text-xs px-3 py-2 rounded-xl border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error bar */}
      {errorMsg ? (
        <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {errorMsg}
        </div>
      ) : null}

      {/* Filters */}
      <div
        className={`mb-5 md:mb-6 rounded-2xl border shadow-sm px-4 py-3.5 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${cardBg}`}
      >
        {/* Search */}
        <div className="flex-1 flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full md:w-96 ${
              darkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee, email, department, type…"
              className={`flex-1 text-xs md:text-sm bg-transparent outline-none ${
                darkMode ? "text-slate-100" : "text-slate-800"
              }`}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className={subText}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 text-xs md:text-sm outline-none ${
              darkMode
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}>
        <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-slate-800/20 flex items-center justify-between">
          <span className="text-xs md:text-sm font-medium uppercase tracking-[0.18em]">
            Requests
          </span>
          <span className={`text-[11px] md:text-xs ${subText}`}>
            {filteredLeaves.length} request{filteredLeaves.length !== 1 && "s"}
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-10 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span className={`text-sm ${subText}`}>Loading leaves…</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLeaves.map((l, idx) => (
              <motion.div
                key={l._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * idx }}
                className="px-4 py-3.5 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                {/* Left */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                    <UserCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {l.employeeName}
                      </span>
                      <span className={pill(l.status)}>{l.status}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11px]">
                      <span className={`flex items-center gap-1 ${subText}`}>
                        <Mail className="w-3 h-3" />
                        {l.employeeEmail}
                      </span>
                      <span className={`flex items-center gap-1 ${subText}`}>
                        <Building2 className="w-3 h-3" />
                        {l.departmentName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle */}
                <div className="flex-1 flex flex-wrap gap-3 text-[11px] md:text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 ${subText}`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    {prettyDate(l.fromDate)} → {prettyDate(l.toDate)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 ${subText}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {daysBetweenInclusive(l.fromDate, l.toDate)} day(s)
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 ${subText}`}
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    {l.leaveType}
                  </span>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between md:justify-end gap-3">
                  <button
                    onClick={() => openView(l)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      darkMode
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-200 hover:bg-slate-50"
                    } transition text-xs`}
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-slate-400" />
                    View
                  </button>

                  {l.status === "Pending" && (
                    <button
                      onClick={() => openView(l)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition text-xs"
                      title="Approve / Reject"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Action
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {filteredLeaves.length === 0 && (
              <div className="px-5 py-10 text-center text-xs md:text-sm text-slate-400">
                No leave requests found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* VIEW + ACTION MODAL */}
      <AnimatePresence>
        {showView && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-6 shadow-xl ${
                darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Leave Details</h3>
                  <p className={`text-xs ${subText}`}>
                    Applied:{" "}
                    {prettyDateTime(selected.appliedDate || selected.createdAt)}
                  </p>
                </div>
                <button onClick={closeView}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl border p-4 mb-4 flex items-start gap-3 border-slate-800/30 bg-slate-950/20">
                <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                  <UserCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-semibold">
                        {selected.employeeName}
                      </div>
                      <div className={`text-xs ${subText}`}>
                        {selected.employeeEmail}
                      </div>
                    </div>
                    <span className={pill(selected.status)}>{selected.status}</span>
                  </div>

                  <div className={`mt-3 grid grid-cols-2 gap-3 text-xs ${subText}`}>
                    <div>
                      <div className="uppercase tracking-wider text-[10px] opacity-70">
                        Leave Type
                      </div>
                      <div className={`text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {selected.leaveType}
                      </div>
                    </div>

                    <div>
                      <div className="uppercase tracking-wider text-[10px] opacity-70">
                        Duration
                      </div>
                      <div className={`text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {daysBetweenInclusive(selected.fromDate, selected.toDate)} day(s)
                      </div>
                    </div>

                    <div>
                      <div className="uppercase tracking-wider text-[10px] opacity-70">
                        From
                      </div>
                      <div className={`text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {prettyDate(selected.fromDate)}
                      </div>
                    </div>

                    <div>
                      <div className="uppercase tracking-wider text-[10px] opacity-70">
                        To
                      </div>
                      <div className={`text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {prettyDate(selected.toDate)}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="uppercase tracking-wider text-[10px] opacity-70">
                        Description
                      </div>
                      <div className={`text-sm ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {selected.description || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action inputs */}
              <div className="space-y-3">
                <div>
                  <label className={`text-xs ${subText}`}>Admin note (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className={`w-full mt-1 px-3 py-2 border rounded-xl outline-none ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                    placeholder="Add a note for the employee (optional)"
                  />
                </div>

                <div>
                  <label className={`text-xs ${subText}`}>
                    Reject reason (only if rejecting)
                  </label>
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-xl outline-none ${
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                    placeholder="Reason for rejection"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={closeView}
                  className={`flex-1 px-3 py-2 rounded-xl border ${
                    darkMode
                      ? "border-slate-700 hover:bg-slate-800 text-slate-200"
                      : "border-slate-200 hover:bg-slate-50 text-slate-800"
                  } transition`}
                >
                  Close
                </button>

                {selected.status === "Pending" ? (
                  <>
                    <button
                      onClick={rejectLeave}
                      disabled={acting}
                      className="flex-1 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {acting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>

                    <button
                      onClick={approveLeave}
                      disabled={acting}
                      className="flex-1 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {acting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                  </>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4" />
                Tip: You can filter status to review approved/rejected history.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminLeaveRequests;
