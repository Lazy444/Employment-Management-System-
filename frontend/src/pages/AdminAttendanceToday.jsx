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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  } catch {
    return "—";
  }
};

const prettyDate = (workDate) => {
  if (!workDate) return "";
  try {
    const [y, m, d] = String(workDate).split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return workDate;
  }
};

const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r}m`;
  return `${h}h ${r}m`;
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

/* ------------------------- Component ------------------------- */
export default function AdminAttendanceToday() {
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  const [workDate, setWorkDate] = useState("");
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, inNow: 0 });
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | present | absent | innow

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null); // row
  const [inVal, setInVal] = useState("");
  const [outVal, setOutVal] = useState("");

  /* -------------------- Theme Tokens -------------------- */
  const ui = useMemo(() => {
    const bg = isDark ? "#0B1220" : "#F6F7FB";
    const card = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
    const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const text = isDark ? "#EAF0FF" : "#0B1020";
    const mut = isDark ? "rgba(234,240,255,0.70)" : "rgba(11,16,32,0.65)";
    const soft = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
    const green = "#22c55e";
    const red = "#ef4444";
    const amber = "#f59e0b";
    const blue = "#3b82f6";
    return { bg, card, border, text, mut, soft, green, red, amber, blue };
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
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch (e) {
      setError(e?.message || "Failed to load admin attendance");
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
        if (!term) return true;
        const emp = r?.employee || {};
        const deptName = emp?.department?.name || emp?.departmentNameResolved || emp?.departmentName || "";
        const hay = [emp.name, emp.email, emp.phone, emp.employeeId, deptName, emp.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      });
  }, [rows, q, filter]);

  /* --------------------- Modal --------------------- */
  const openEdit = useCallback((row) => {
    setSelected(row);
    const att = row?.attendance;

    setInVal(toDatetimeLocal(att?.punchedInAt || ""));   // if absent => empty
    setOutVal(toDatetimeLocal(att?.punchedOutAt || "")); // if absent => empty
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
      punchedOutAt: fromDatetimeLocal(outVal), // optional
    };

    if (!payload.employeeId) {
      setError("Employee id missing.");
      return;
    }

    if (!payload.punchedInAt) {
      setError("Punch In time is required.");
      return;
    }

    setActing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      let res;
      if (attId) {
        // update existing record
        res = await fetch(`${API_BASE}/admin/attendance/${attId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            punchedInAt: payload.punchedInAt,
            // allow clearing by sending "" when empty
            punchedOutAt: payload.punchedOutAt ? payload.punchedOutAt : "",
          }),
        });
      } else {
        // upsert today
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
      closeEdit();
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setActing(false);
    }
  }, [acting, closeEdit, fetchToday, inVal, outVal, selected]);

  /* --------------------- Animations --------------------- */
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  /* --------------------- Render --------------------- */
  return (
    <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text, padding: 22 }}>
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: ui.soft,
                border: `1px solid ${ui.border}`,
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 950 }}>Admin Attendance</div>
              <div style={{ marginTop: 4, color: ui.mut, fontSize: 13, fontWeight: 700 }}>
                {workDate ? prettyDate(workDate) : "Today"} • Present/Absent + Manual Update
              </div>
            </div>
          </div>

          <motion.button
            onClick={fetchToday}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              border: `1px solid ${ui.border}`,
              background: ui.card,
              color: ui.text,
              padding: "10px 12px",
              borderRadius: 14,
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Summary + Search */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
          style={{
            background: ui.card,
            border: `1px solid ${ui.border}`,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip ui={ui} label={`Total: ${summary.total}`} icon={<Users size={14} />} />
            <Chip ui={ui} label={`Present: ${summary.present}`} icon={<BadgeCheck size={14} />} color={ui.green} />
            <Chip ui={ui} label={`Absent: ${summary.absent}`} icon={<BadgeX size={14} />} color={ui.red} />
            <Chip ui={ui} label={`IN now: ${summary.inNow}`} icon={<Clock size={14} />} color={ui.amber} />
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <FilterBtn ui={ui} active={filter === "all"} onClick={() => setFilter("all")} text="All" />
            <FilterBtn ui={ui} active={filter === "present"} onClick={() => setFilter("present")} text="Present" />
            <FilterBtn ui={ui} active={filter === "absent"} onClick={() => setFilter("absent")} text="Absent" />
            <FilterBtn ui={ui} active={filter === "innow"} onClick={() => setFilter("innow")} text="IN now" />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.08 }}
          style={{
            background: ui.card,
            border: `1px solid ${ui.border}`,
            borderRadius: 18,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: ui.soft,
                border: `1px solid ${ui.border}`,
              }}
            >
              <Search size={18} />
            </div>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, phone, employeeId, department..."
              style={{
                flex: 1,
                padding: "12px 12px",
                borderRadius: 14,
                border: `1px solid ${ui.border}`,
                background: ui.soft,
                color: ui.text,
                outline: "none",
                fontWeight: 800,
              }}
            />
          </div>

          {!!error && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: 10,
                borderRadius: 14,
                border: `1px solid ${ui.border}`,
                background: ui.soft,
              }}
            >
              <AlertTriangle size={18} style={{ color: ui.amber, marginTop: 1 }} />
              <div style={{ fontWeight: 800, color: ui.mut, fontSize: 13 }}>{error}</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.12 }}
        style={{
          marginTop: 14,
          background: ui.card,
          border: `1px solid ${ui.border}`,
          borderRadius: 18,
          padding: 14,
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <Th ui={ui}>Employee</Th>
                <Th ui={ui}>Department</Th>
                <Th ui={ui}>Status</Th>
                <Th ui={ui}>Punch In</Th>
                <Th ui={ui}>Punch Out</Th>
                <Th ui={ui}>Worked</Th>
                <Th ui={ui}>Action</Th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <Td ui={ui} colSpan={7}>
                    <div style={{ padding: 14, color: ui.mut, fontWeight: 900 }}>Loading...</div>
                  </Td>
                </tr>
              ) : filtered.length ? (
                filtered.map((r) => {
                  const emp = r.employee || {};
                  const att = r.attendance || null;

                  const deptName = emp?.department?.name || emp?.departmentNameResolved || emp?.departmentName || "—";

                  const statusText = r.present ? (r.inNow ? "IN" : "OUT") : "ABSENT";
                  const statusColor = !r.present ? ui.red : r.inNow ? ui.green : ui.mut;

                  return (
                    <motion.tr
                      key={emp._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Td ui={ui}>
                        <div style={{ fontWeight: 950 }}>{emp.name || "—"}</div>
                        <div style={{ fontSize: 12, color: ui.mut, fontWeight: 800 }}>{emp.email || "—"}</div>
                        {emp.employeeId ? (
                          <div style={{ fontSize: 12, color: ui.mut, fontWeight: 800 }}>
                            ID: {emp.employeeId}
                          </div>
                        ) : null}
                      </Td>

                      <Td ui={ui}>{deptName}</Td>

                      <Td ui={ui}>
                        <span style={{ fontWeight: 950, color: statusColor }}>{statusText}</span>
                      </Td>

                      <Td ui={ui}>{prettyTime(att?.punchedInAt)}</Td>
                      <Td ui={ui}>{prettyTime(att?.punchedOutAt)}</Td>

                      <Td ui={ui}>
                        {att?.punchedOutAt ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 900 }}>
                            <Timer size={14} />
                            {minutesToHM(att?.totalMinutes)}
                          </span>
                        ) : "—"}
                      </Td>

                      <Td ui={ui}>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openEdit(r)}
                          style={{
                            padding: "9px 10px",
                            borderRadius: 14,
                            border: `1px solid ${ui.border}`,
                            background: ui.soft,
                            color: ui.text,
                            fontWeight: 950,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Pencil size={16} />
                          Edit
                        </motion.button>
                      </Td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <Td ui={ui} colSpan={7}>
                    <div style={{ padding: 14, color: ui.mut, fontWeight: 900 }}>No employees match your filter.</div>
                  </Td>
                </tr>
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
              background: "rgba(0,0,0,0.55)",
              zIndex: 999,
              display: "grid",
              placeItems: "center",
              padding: 16,
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeEdit();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              style={{
                width: "min(720px, 96vw)",
                background: ui.card,
                border: `1px solid ${ui.border}`,
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>Update Attendance Times</div>
                  <div style={{ marginTop: 4, color: ui.mut, fontWeight: 800, fontSize: 12 }}>
                    {selected?.employee?.name} •{" "}
                    {(selected?.employee?.department?.name ||
                      selected?.employee?.departmentNameResolved ||
                      selected?.employee?.departmentName ||
                      "—")}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={closeEdit}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    border: `1px solid ${ui.border}`,
                    background: ui.soft,
                    color: ui.text,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: ui.mut, fontWeight: 900 }}>Punch In (required)</label>
                  <input type="datetime-local" value={inVal} onChange={(e) => setInVal(e.target.value)} style={inputStyle(ui)} />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: ui.mut, fontWeight: 900 }}>Punch Out (optional)</label>
                  <input type="datetime-local" value={outVal} onChange={(e) => setOutVal(e.target.value)} style={inputStyle(ui)} />
                  <div style={{ marginTop: 6, color: ui.mut, fontWeight: 800, fontSize: 12 }}>
                    Leave blank to keep employee as <b>IN</b>.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                <motion.button whileTap={{ scale: 0.98 }} onClick={closeEdit} style={btn(ui, false)} disabled={acting}>
                  Cancel
                </motion.button>

                <motion.button whileTap={{ scale: 0.98 }} onClick={saveEdit} style={btn(ui, true)} disabled={acting}>
                  <Save size={16} />
                  {acting ? "Saving..." : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------- Small UI Components ------------------------- */
function Chip({ ui, icon, label, color }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${ui.border}`,
        background: ui.soft,
        fontWeight: 950,
        color: color || ui.text,
        fontSize: 12,
      }}
    >
      {icon}
      {label}
    </div>
  );
}

function FilterBtn({ ui, active, onClick, text }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${ui.border}`,
        background: active ? ui.text : ui.soft,
        color: active ? ui.bg : ui.text,
        fontWeight: 950,
        cursor: "pointer",
        fontSize: 12,
      }}
    >
      {text}
    </button>
  );
}

function Th({ ui, children }) {
  return (
    <th
      style={{
        textAlign: "left",
        fontSize: 12,
        fontWeight: 950,
        color: ui.mut,
        padding: "10px 10px",
        borderBottom: `1px solid ${ui.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ ui, children, colSpan }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: "10px 10px",
        borderBottom: `1px solid ${ui.border}`,
        fontWeight: 850,
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

function inputStyle(ui) {
  return {
    width: "100%",
    marginTop: 6,
    padding: "12px 12px",
    borderRadius: 14,
    border: `1px solid ${ui.border}`,
    background: ui.soft,
    color: ui.text,
    outline: "none",
    fontWeight: 850,
  };
}

function btn(ui, primary) {
  return {
    padding: "10px 12px",
    borderRadius: 14,
    border: `1px solid ${ui.border}`,
    background: primary ? ui.blue : ui.soft,
    color: primary ? "#fff" : ui.text,
    fontWeight: 950,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };
}
