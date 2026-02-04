import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings,
  LogOut,
  
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

export default function AddNewLeave() {
  const navigate = useNavigate();

  const employeeName = localStorage.getItem("employeeName") || "employee";
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

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/employee-login");
        return;
      }

      // ✅ FIX: employee (not employees)
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

      // ✅ Safe parsing
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
            <div className="text-slate-300 text-sm tracking-wide">
              Welcome, <span className="text-white font-semibold">{employeeName}</span>
            </div>

            <div className="flex items-center gap-3">
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-slate-400 uppercase">
                  Leave
                </div>
                <h1 className="text-3xl font-extrabold mt-1">Request for Leave</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Submit your leave request. Overlapping dates are not allowed.
                </p>
              </div>

              <button
                onClick={() => navigate("/employeeleave")}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
              >
                Back to Leaves
              </button>
            </div>

            {/* Form Card */}
            <div className="max-w-4xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
                <form onSubmit={submit} className="space-y-5">
                  {/* Leave Type */}
                  <div>
                    <label className="block text-xs tracking-widest text-slate-400 uppercase mb-2">
                      Leave Type
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                      required
                    >
                      <option value="" disabled>
                        Select Leave Type
                      </option>
                      {leaveTypes.map((t) => (
                        <option key={t} value={t} className="bg-[#0B1024]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-widest text-slate-400 uppercase mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs tracking-widest text-slate-400 uppercase mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Reason"
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/20 transition shadow-[0_0_18px_rgba(16,185,129,0.08)] disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Submit Leave Request"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/employeeleave")}
                      className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-200"
                    >
                      Back to Leaves
                    </button>
                  </div>

                  {/* Small hint */}
                  <div className="text-xs text-slate-500">
                    Note: You cannot apply leave twice on the same day or overlap existing leave dates.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
