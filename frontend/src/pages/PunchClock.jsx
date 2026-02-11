/* eslint-disable no-unused-vars */
// src/pages/PunchClock.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  LogIn,
  LogOut,
  RefreshCw,
  CalendarDays,
  Timer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

/* ---------------- Helpers ---------------- */
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
    const [y, m, d] = String(workDate).split("-").map((x) => Number(x));
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

/* ---------------- Main Component ---------------- */
export default function PunchClock() {
  const { isDark } = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, type: "ok", message: "" });

  const [workDate, setWorkDate] = useState("");
  const [records, setRecords] = useState([]);

  // Detect open session (punched in but not punched out)
  const openSession = useMemo(() => {
    return (records || []).find((r) => !r?.punchedOutAt) || null;
  }, [records]);

  const isIn = !!openSession;

  // ✅ Completed today (punched in AND punched out)
  const completedToday = useMemo(() => {
    return (records || []).some((r) => !!r?.punchedInAt && !!r?.punchedOutAt);
  }, [records]);

  // Total minutes today (sum completed sessions)
  const totalMinutesToday = useMemo(() => {
    return (records || []).reduce((sum, r) => sum + Number(r?.totalMinutes || 0), 0);
  }, [records]);

  // Styling tokens
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

  // Toast helpers
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
  }, []);

  // API Call: fetch today
  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/attendance/me/today`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Failed to load attendance");

      setWorkDate(data?.workDate || "");
      setRecords(Array.isArray(data?.records) ? data.records : []);
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  // ✅ Disable Punch In rules (Calendar Day System)
  const punchInDisabledReason = useMemo(() => {
    if (isIn) return "You are already punched in.";
    if (completedToday) return "You already completed punch in/out today.";
    return "";
  }, [isIn, completedToday]);

  const canPunchIn = !punchInDisabledReason && !loading && !acting;

  // Punch In
  const doPunchIn = useCallback(async () => {
    if (!canPunchIn) {
      if (punchInDisabledReason) showToast("bad", punchInDisabledReason);
      return;
    }

    setActing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/attendance/punch-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Punch in failed");

      showToast("ok", "Punched In ✅");
      await fetchToday();
    } catch (e) {
      showToast("bad", e?.message || "Punch in failed");
      setError(e?.message || "Punch in failed");
    } finally {
      setActing(false);
    }
  }, [canPunchIn, fetchToday, punchInDisabledReason, showToast]);

  // Punch Out
  const doPunchOut = useCallback(async () => {
    if (acting || loading || !isIn) return;

    setActing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/attendance/punch-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || "Punch out failed");

      showToast("ok", "Punched Out ✅");
      await fetchToday();
    } catch (e) {
      showToast("bad", e?.message || "Punch out failed");
      setError(e?.message || "Punch out failed");
    } finally {
      setActing(false);
    }
  }, [acting, fetchToday, isIn, loading, showToast]);

  // UI animation presets
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const buttonPulse = {
    initial: { scale: 1 },
    tap: { scale: 0.98 },
  };

  return (
    <div style={{ minHeight: "100vh", background: ui.bg, color: ui.text, padding: "22px" }}>
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            style={{
              position: "fixed",
              top: 18,
              right: 18,
              zIndex: 999,
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${ui.border}`,
              background: ui.card,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: isDark ? "0 14px 40px rgba(0,0,0,0.35)" : "0 14px 40px rgba(0,0,0,0.12)",
              backdropFilter: "blur(10px)",
            }}
          >
            {toast.type === "ok" ? (
              <CheckCircle2 size={18} style={{ color: ui.green }} />
            ) : (
              <XCircle size={18} style={{ color: ui.red }} />
            )}
            <div style={{ fontSize: 14, fontWeight: 700 }}>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
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
              <Clock size={20} />
            </div>

            <div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.2 }}>Punch Clock</div>
              <div style={{ marginTop: 4, color: ui.mut, fontSize: 13, fontWeight: 600 }}>
                One punch per calendar day (next punch allowed after midnight)
              </div>
            </div>
          </div>

          <motion.button
            onClick={fetchToday}
            whileTap={{ scale: 0.98 }}
            style={{
              border: `1px solid ${ui.border}`,
              background: ui.card,
              color: ui.text,
              padding: "10px 12px",
              borderRadius: 14,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Top Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginTop: 18 }}>
        {/* Status Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
          style={{
            background: ui.card,
            border: `1px solid ${ui.border}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: isDark ? "0 12px 34px rgba(0,0,0,0.35)" : "0 12px 34px rgba(0,0,0,0.10)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  background: ui.soft,
                  border: `1px solid ${ui.border}`,
                }}
              >
                <CalendarDays size={18} />
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>Today</div>
                <div style={{ fontSize: 12, color: ui.mut, fontWeight: 700 }}>
                  {workDate ? prettyDate(workDate) : "—"}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "8px 10px",
                borderRadius: 999,
                border: `1px solid ${ui.border}`,
                background: ui.soft,
                fontWeight: 900,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  background: isIn ? ui.green : ui.amber,
                  display: "inline-block",
                }}
              />
              Status: {isIn ? "IN" : completedToday ? "DONE" : "OUT"}
            </div>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <StatBox
              ui={ui}
              isDark={isDark}
              icon={<LogIn size={16} />}
              label="Punch In"
              value={records?.[0]?.punchedInAt ? prettyTime(records?.[0]?.punchedInAt) : "—"}
            />

            <StatBox
              ui={ui}
              isDark={isDark}
              icon={<LogOut size={16} />}
              label="Punch Out"
              value={records?.[0]?.punchedOutAt ? prettyTime(records?.[0]?.punchedOutAt) : "—"}
            />

            <StatBox ui={ui} isDark={isDark} icon={<Timer size={16} />} label="Worked" value={minutesToHM(totalMinutesToday)} />
          </div>

          {/* Actions */}
          <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <motion.button
              onClick={doPunchIn}
              whileTap="tap"
              variants={buttonPulse}
              disabled={!canPunchIn}
              style={{
                flex: "1 1 220px",
                padding: "12px 14px",
                borderRadius: 16,
                border: `1px solid ${ui.border}`,
                background: canPunchIn ? ui.blue : ui.soft,
                color: canPunchIn ? "#fff" : ui.mut,
                fontWeight: 900,
                cursor: canPunchIn ? "pointer" : "not-allowed",
                opacity: acting || loading ? 0.75 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
              title={punchInDisabledReason || "Punch In"}
            >
              <LogIn size={18} />
              Punch In
            </motion.button>

            <motion.button
              onClick={doPunchOut}
              whileTap="tap"
              variants={buttonPulse}
              disabled={acting || loading || !isIn}
              style={{
                flex: "1 1 220px",
                padding: "12px 14px",
                borderRadius: 16,
                border: `1px solid ${ui.border}`,
                background: isIn ? ui.red : ui.soft,
                color: isIn ? "#fff" : ui.mut,
                fontWeight: 900,
                cursor: isIn ? "pointer" : "not-allowed",
                opacity: acting || loading ? 0.75 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <LogOut size={18} />
              Punch Out
            </motion.button>
          </div>

          {/* Info banner when punch-in disabled */}
          <AnimatePresence>
            {!canPunchIn && !!punchInDisabledReason && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: `1px solid ${ui.border}`,
                  background: ui.soft,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle size={18} style={{ color: ui.amber, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>Punch In is locked</div>
                  <div style={{ color: ui.mut, fontWeight: 700, fontSize: 12, marginTop: 2 }}>
                    {punchInDisabledReason}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {!!error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: `1px solid ${ui.border}`,
                  background: ui.soft,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle size={18} style={{ color: ui.amber, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 13 }}>Something went wrong</div>
                  <div style={{ color: ui.mut, fontWeight: 700, fontSize: 12, marginTop: 2 }}>{error}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Info Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          style={{
            background: ui.card,
            border: `1px solid ${ui.border}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: isDark ? "0 12px 34px rgba(0,0,0,0.35)" : "0 12px 34px rgba(0,0,0,0.10)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900 }}>Rules</div>
          <div style={{ marginTop: 8, color: ui.mut, fontSize: 12, fontWeight: 700, lineHeight: 1.5 }}>
            • Only one Punch In per day<br />
            • Punch Out ends the day<br />
            • You can punch again after midnight
          </div>

          <div
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 16,
              border: `1px solid ${ui.border}`,
              background: ui.soft,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 12, color: ui.mut }}>Punch In Availability</div>
            <div style={{ marginTop: 6, fontWeight: 950, fontSize: 13 }}>
              {canPunchIn ? "Available ✅" : "Not available ❌"}
            </div>
            {!canPunchIn && punchInDisabledReason ? (
              <div style={{ marginTop: 6, color: ui.mut, fontWeight: 700, fontSize: 12 }}>{punchInDisabledReason}</div>
            ) : null}
          </div>
        </motion.div>
      </div>

      {/* History Table */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.15 }}
        style={{
          marginTop: 16,
          background: ui.card,
          border: `1px solid ${ui.border}`,
          borderRadius: 18,
          padding: 16,
          boxShadow: isDark ? "0 12px 34px rgba(0,0,0,0.35)" : "0 12px 34px rgba(0,0,0,0.10)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 950 }}>Today’s Punch History</div>
            <div style={{ marginTop: 4, color: ui.mut, fontWeight: 700, fontSize: 12 }}>
              You should see max 1 record per day.
            </div>
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: 14,
              border: `1px solid ${ui.border}`,
              background: ui.soft,
              fontWeight: 900,
              fontSize: 12,
              color: ui.mut,
            }}
          >
            Count: {Array.isArray(records) ? records.length : 0}
          </div>
        </div>

        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <Th ui={ui}>#</Th>
                <Th ui={ui}>Punch In</Th>
                <Th ui={ui}>Punch Out</Th>
                <Th ui={ui}>Worked</Th>
                <Th ui={ui}>Status</Th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <Td ui={ui} colSpan={5}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 14, color: ui.mut, fontWeight: 800 }}>
                      Loading...
                    </motion.div>
                  </Td>
                </tr>
              ) : records?.length ? (
                records.map((r, idx) => {
                  const status = r?.punchedOutAt ? "OUT" : "IN";
                  const statusColor = status === "IN" ? ui.green : ui.mut;

                  return (
                    <motion.tr
                      key={r?._id || `${idx}-${r?.punchedInAt}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Td ui={ui}>{idx + 1}</Td>
                      <Td ui={ui}>{prettyTime(r?.punchedInAt)}</Td>
                      <Td ui={ui}>{r?.punchedOutAt ? prettyTime(r?.punchedOutAt) : "—"}</Td>
                      <Td ui={ui}>{r?.punchedOutAt ? minutesToHM(r?.totalMinutes) : "—"}</Td>
                      <Td ui={ui}>
                        <span style={{ fontWeight: 950, color: statusColor }}>{status}</span>
                      </Td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <Td ui={ui} colSpan={5}>
                    <div style={{ padding: 14, color: ui.mut, fontWeight: 800 }}>No punches yet today.</div>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */
function StatBox({ ui, isDark, icon, label, value }) {
  return (
    <div style={{ border: `1px solid ${ui.border}`, background: ui.soft, borderRadius: 16, padding: 12, minHeight: 62 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              border: `1px solid ${ui.border}`,
              background: isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.85)",
            }}
          >
            {icon}
          </div>
          <div style={{ fontSize: 12, fontWeight: 900, color: ui.mut }}>{label}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 950 }}>{value}</div>
      </div>
    </div>
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
        fontWeight: 800,
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}
