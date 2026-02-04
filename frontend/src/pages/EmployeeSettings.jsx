import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle2,
  CalendarDays,
  WalletCards,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Shield,
  LockKeyhole,
  Palette,
  Monitor,
  SunMedium,
  MoonStar,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api"; // optional (only if you later connect backend)

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

export default function EmployeeSettings() {
  const navigate = useNavigate();

  const employeeName = localStorage.getItem("employeeName") || "employee";
  const initials = getInitials(employeeName);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  // Theme (local)
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("emp_theme") || "dark"
  );

  // Preferences (local)
  const [emailNotif, setEmailNotif] = useState(
    () => (localStorage.getItem("emp_emailNotif") ?? "true") === "true"
  );
  const [pushNotif, setPushNotif] = useState(
    () => (localStorage.getItem("emp_pushNotif") ?? "false") === "true"
  );
  const [weeklySummary, setWeeklySummary] = useState(
    () => (localStorage.getItem("emp_weeklySummary") ?? "true") === "true"
  );

  // Privacy (local)
  const [twoFA, setTwoFA] = useState(
    () => (localStorage.getItem("emp_twoFA") ?? "false") === "true"
  );
  const [showEmail, setShowEmail] = useState(
    () => (localStorage.getItem("emp_showEmail") ?? "true") === "true"
  );
  const [showPhone, setShowPhone] = useState(
    () => (localStorage.getItem("emp_showPhone") ?? "true") === "true"
  );

  // Password change (front-end only demo)
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    navigate("/employee-login", { replace: true });
  };

  // Apply theme class to body (simple)
  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    window.clearTimeout(window.__empToastTimer);
    window.__empToastTimer = window.setTimeout(() => setToast({ type: "", msg: "" }), 2500);
  }, []);

  const saveSettings = async () => {
    setSaving(true);

    try {
      // ✅ Save locally (works immediately)
      localStorage.setItem("emp_theme", themeMode);
      localStorage.setItem("emp_emailNotif", String(emailNotif));
      localStorage.setItem("emp_pushNotif", String(pushNotif));
      localStorage.setItem("emp_weeklySummary", String(weeklySummary));
      localStorage.setItem("emp_twoFA", String(twoFA));
      localStorage.setItem("emp_showEmail", String(showEmail));
      localStorage.setItem("emp_showPhone", String(showPhone));

      // ✅ Optional backend hook (only if you create endpoint later)
      // const token = localStorage.getItem("token");
      // if (token) {
      //   await fetch(`${API_BASE}/employee/settings`, {
      //     method: "PATCH",
      //     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //     body: JSON.stringify({
      //       themeMode,
      //       emailNotif,
      //       pushNotif,
      //       weeklySummary,
      //       twoFA,
      //       showEmail,
      //       showPhone,
      //     }),
      //   });
      // }

      showToast("success", "Settings saved successfully");
    } catch (e) {
      showToast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    // Frontend validation
    if (!currentPass || !newPass || !confirmPass) {
      showToast("error", "Fill all password fields");
      return;
    }
    if (newPass.length < 6) {
      showToast("error", "New password must be at least 6 characters");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("error", "New password and confirm password do not match");
      return;
    }

    // ✅ For now just demo success (connect backend later)
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    showToast("success", "Password updated (demo)");
  };

  const card = "rounded-2xl border border-white/10 bg-white/5";
  const label = "text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400";
  const input =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-100 placeholder:text-slate-500";

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
              onClick={() => navigate("/employeesetting")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-emerald-500/15 border border-emerald-500/25"
            >
              <SettingsIcon className="w-4 h-4 text-slate-200" />
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
                onClick={() => setThemeMode((p) => (p === "dark" ? "light" : "dark"))}
              >
                {themeMode === "dark" ? (
                  <SunMedium className="w-4 h-4 text-slate-200" />
                ) : (
                  <MoonStar className="w-4 h-4 text-slate-200" />
                )}
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
              >
                Logout
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 grid place-items-center">
                <span className="font-bold text-emerald-200">{initials}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-slate-400 uppercase">
                  Setting
                </div>
                <h1 className="text-3xl font-extrabold mt-1">Settings</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Customize your preferences, notifications and privacy.
                </p>
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 hover:bg-emerald-500/20 transition shadow-[0_0_18px_rgba(16,185,129,0.08)] disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Toast */}
            {toast.msg ? (
              <div
                className={`mb-6 ${card} px-4 py-3 flex items-center gap-2 ${
                  toast.type === "success"
                    ? "border-emerald-500/25 bg-emerald-500/10"
                    : "border-rose-500/25 bg-rose-500/10"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-200" />
                )}
                <span className="text-sm text-slate-100">{toast.msg}</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COL */}
              <div className="space-y-6">
                {/* Appearance */}
                <div className={`${card} p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-4 h-4 text-emerald-200" />
                    <h2 className="font-semibold">Appearance</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={label}>Theme</div>
                        <div className="text-sm text-slate-200 mt-1">
                          Choose light or dark mode
                        </div>
                      </div>
                      <button
                        onClick={() => setThemeMode((p) => (p === "dark" ? "light" : "dark"))}
                        className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm flex items-center gap-2"
                      >
                        {themeMode === "dark" ? (
                          <>
                            <MoonStar className="w-4 h-4" /> Dark
                          </>
                        ) : (
                          <>
                            <SunMedium className="w-4 h-4" /> Light
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className={label}>Display</div>
                        <div className="text-sm text-slate-200 mt-1">
                          Default layout mode
                        </div>
                      </div>
                      <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm flex items-center gap-2 text-slate-200">
                        <Monitor className="w-4 h-4" /> Standard
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className={`${card} p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-4 h-4 text-cyan-200" />
                    <h2 className="font-semibold">Notifications</h2>
                  </div>

                  <ToggleRow
                    title="Email Notifications"
                    desc="Receive important updates via email"
                    checked={emailNotif}
                    onChange={setEmailNotif}
                  />

                  <ToggleRow
                    title="Push Notifications"
                    desc="Show alerts on your device (demo)"
                    checked={pushNotif}
                    onChange={setPushNotif}
                  />

                  <ToggleRow
                    title="Weekly Summary"
                    desc="Get weekly leave & salary summary"
                    checked={weeklySummary}
                    onChange={setWeeklySummary}
                  />
                </div>
              </div>

              {/* MIDDLE COL */}
              <div className="space-y-6">
                {/* Privacy */}
                <div className={`${card} p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-indigo-200" />
                    <h2 className="font-semibold">Privacy</h2>
                  </div>

                  <ToggleRow
                    title="Two-factor Authentication"
                    desc="Extra security for login (demo)"
                    checked={twoFA}
                    onChange={setTwoFA}
                  />

                  <ToggleRow
                    title="Show Email on Profile"
                    desc="Display email information on your profile card"
                    checked={showEmail}
                    onChange={setShowEmail}
                  />

                  <ToggleRow
                    title="Show Phone on Profile"
                    desc="Display phone number on your profile card"
                    checked={showPhone}
                    onChange={setShowPhone}
                  />
                </div>

                {/* Danger Zone */}
                <div className={`${card} p-5 border-rose-500/20`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-rose-200" />
                    <h2 className="font-semibold text-rose-200">Danger Zone</h2>
                  </div>
                  <p className="text-sm text-slate-300">
                    Logging out will remove your session token from this device.
                  </p>

                  <button
                    onClick={logout}
                    className="mt-4 w-full px-4 py-3 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15 transition text-sm font-semibold text-rose-200 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Now
                  </button>
                </div>
              </div>

              {/* RIGHT COL */}
              <div className="space-y-6">
                {/* Password */}
                <div className={`${card} p-5`}>
                  <div className="flex items-center gap-2 mb-4">
                    <LockKeyhole className="w-4 h-4 text-emerald-200" />
                    <h2 className="font-semibold">Change Password</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className={label}>Current Password</div>
                      <input
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className={input}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <div className={label}>New Password</div>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className={input}
                        placeholder="At least 6 characters"
                      />
                    </div>

                    <div>
                      <div className={label}>Confirm New Password</div>
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className={input}
                        placeholder="Repeat new password"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={changePassword}
                      className="w-full mt-2 px-4 py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/15 transition text-sm font-semibold text-emerald-200"
                    >
                      Update Password (Demo)
                    </button>

                    <div className="text-xs text-slate-500">
                      Note: This is frontend only. Connect backend endpoint to really change password.
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className={`${card} p-5`}>
                  <h2 className="font-semibold mb-2">Account</h2>
                  <div className="text-sm text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">User</span>
                      <span className="text-slate-100 font-semibold">{employeeName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Theme</span>
                      <span className="text-slate-100 font-semibold">{themeMode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">2FA</span>
                      <span className="text-slate-100 font-semibold">
                        {twoFA ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast("success", "All good ✅")}
                    className="mt-4 w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
                  >
                    Run Quick Check
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom spacing */}
            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-white/10 last:border-b-0">
      <div>
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        <div className="text-xs text-slate-400 mt-1">{desc}</div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full border transition relative ${
          checked
            ? "bg-emerald-500/25 border-emerald-500/30"
            : "bg-white/5 border-white/10"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition ${
            checked
              ? "left-[26px] bg-emerald-200"
              : "left-[4px] bg-slate-300"
          }`}
        />
      </button>
    </div>
  );
}
