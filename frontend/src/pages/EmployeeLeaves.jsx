import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  
} from "lucide-react";

// ✅ If your server mounts: app.use("/api/employee", employeeRoutes)
const API_BASE = "http://localhost:5000/api";

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
  return `${base} bg-slate-500/10 text-slate-200 border-slate-500/20`;
};

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

export default function EmployeeLeaves() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  // Optional: show real user name if you store it
  const employeeName = localStorage.getItem("employeeName") || "employee";
  const initials = getInitials(employeeName);

  const token = localStorage.getItem("token");

  const fetchLeaves = useCallback(
    async (status = "All") => {
      setLoading(true);

      try {
        const t = localStorage.getItem("token");
        if (!t) {
          navigate("/employee-login");
          return;
        }

        const url =
          status === "All"
            ? `${API_BASE}/employees/leaves`
            : `${API_BASE}/employees/leaves?status=${encodeURIComponent(status)}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/employee-login");
          return;
        }

        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = {};
        }

        setLeaves(Array.isArray(data?.leaves) ? data.leaves : []);
      } catch (e) {
        console.error(e);
        setLeaves([]);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchLeaves(statusFilter);
  }, [fetchLeaves, statusFilter]);

  const rows = useMemo(() => {
    return leaves.map((l, idx) => ({
      sno: idx + 1,
      id: l._id,
      leaveType: l.leaveType,
      from: formatDate(l.fromDate),
      to: formatDate(l.toDate),
      description: l.description || "-",
      applied: formatDate(l.appliedDate || l.createdAt),
      status: l.status,
    }));
  }, [leaves]);

  const cancelLeave = async (id) => {
    try {
      const t = localStorage.getItem("token");
      if (!t) {
        navigate("/employee-login");
        return;
      }

      const res = await fetch(`${API_BASE}/employees/leaves/${id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ cancelReason: "Changed plan" }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        alert(data?.message || "Failed to cancel leave");
        return;
      }

      fetchLeaves(statusFilter);
    } catch {
      alert("Failed to cancel leave");
    }
  };
const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    navigate("/employee-login", { replace: true });
  };
  // quick stats
  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "Pending").length;
    const approved = rows.filter((r) => r.status === "Approved").length;
    const rejected = rows.filter((r) => r.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#070B18] text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-20 right-[-120px] w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="w-[280px] min-h-screen border-r border-white/10 bg-gradient-to-b from-[#0B1024] to-[#070B18]">
          <div className="px-6 pt-6 pb-4">
            <div className="text-emerald-300 font-extrabold tracking-widest text-sm">
              EMPLOYEE MS
            </div>
            <div className="text-slate-400 text-xs mt-1">Employee Portal</div>
          </div>

         <div className="px-4 mt-2 space-y-2">
            <button
              onClick={() => navigate("/employeeprofile")}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-white/0 hover:bg-white/5 border border-white/0 hover:border-white/10 transition"
            >
              <UserCircle2 className="w-4 h-4 text-emerald-200" />
              <span className="text-sm font-semibold text-emerald-100">My Profile</span>
            </button>

            <button
              onClick={() => navigate("/employeeleave")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-emerald-500/15 border border-emerald-500/25"
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

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="h-16 px-8 flex items-center justify-between border-b border-white/10 bg-white/0">
            <div className="flex items-center gap-3">
              <div className="text-slate-300 text-sm tracking-wide">
                Welcome, <span className="text-white font-semibold">{employeeName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* fake theme icon button */}
              <button
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                title="Theme"
              >
                <span className="text-slate-200 text-sm">☼</span>
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/employee-login");
                }}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
              >
                Logout
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 grid place-items-center">
                <span className="font-bold text-emerald-200">{initials}</span>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-slate-400 uppercase">
                  Leave
                </div>
                <h1 className="text-3xl font-extrabold mt-1">Manage Leaves</h1>
              </div>

              <button
                onClick={() => navigate("/add-new-leave")}
                className="px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/20 transition shadow-[0_0_18px_rgba(16,185,129,0.08)]"
              >
                + Add Leave
              </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-2xl font-bold mt-1">{stats.total}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Pending</div>
                <div className="text-2xl font-bold mt-1 text-amber-200">{stats.pending}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Approved</div>
                <div className="text-2xl font-bold mt-1 text-emerald-200">{stats.approved}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Rejected</div>
                <div className="text-2xl font-bold mt-1 text-rose-200">{stats.rejected}</div>
              </div>
            </div>

            {/* Filter + refresh */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-[280px] rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Search By Status"
                    list="statusList"
                  />
                  <datalist id="statusList">
                    <option value="All" />
                    <option value="Pending" />
                    <option value="Approved" />
                    <option value="Rejected" />
                    <option value="Cancelled" />
                  </datalist>
                </div>

                <button
                  onClick={() => fetchLeaves(statusFilter)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
                >
                  Refresh
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Tip: only <span className="text-slate-200 font-semibold">Pending</span> requests can be cancelled.
              </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-left text-xs font-semibold text-slate-300">
                      <th className="px-6 py-4">SNO</th>
                      <th className="px-6 py-4">LEAVE TYPE</th>
                      <th className="px-6 py-4">FROM</th>
                      <th className="px-6 py-4">TO</th>
                      <th className="px-6 py-4">DESCRIPTION</th>
                      <th className="px-6 py-4">APPLIED DATE</th>
                      <th className="px-6 py-4">STATUS</th>
                      <th className="px-6 py-4">ACTION</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-300" colSpan={8}>
                          Loading leaves...
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-slate-300" colSpan={8}>
                          No leaves found.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.id} className="hover:bg-white/5 transition">
                          <td className="px-6 py-4 text-slate-200">{r.sno}</td>
                          <td className="px-6 py-4 text-slate-100 font-medium">{r.leaveType}</td>
                          <td className="px-6 py-4 text-slate-200">{r.from}</td>
                          <td className="px-6 py-4 text-slate-200">{r.to}</td>
                          <td className="px-6 py-4 text-slate-300">{r.description}</td>
                          <td className="px-6 py-4 text-slate-200">{r.applied}</td>
                          <td className="px-6 py-4">
                            <span className={pill(r.status)}>{r.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            {r.status === "Pending" ? (
                              <button
                                onClick={() => cancelLeave(r.id)}
                                className="px-3 py-1.5 rounded-xl text-sm font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15 transition"
                              >
                                Cancel
                              </button>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 text-xs text-slate-400">
                Showing <span className="text-slate-200 font-semibold">{rows.length}</span> leave request(s).
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
