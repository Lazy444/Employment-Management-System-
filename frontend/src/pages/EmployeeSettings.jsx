import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  SunMedium,
  MoonStar,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookMarked,
  Calendar,
  ArrowLeft,
  Briefcase,
  Sparkles,
  MessageCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Mail,
  Smartphone,
  ChevronRight,
  CreditCard,
  Award,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

const getInitials = (name = "") => {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  const first = parts[0]?.[0] || "E";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const navItems = [
  { label: "My Profile", icon: UserCircle2, path: "/employeeprofile" },
  { label: "Leave", icon: CalendarDays, path: "/employeeleave" },
  { label: "Salary", icon: WalletCards, path: "/employeesalary" },
  { label: "Settings", icon: SettingsIcon, path: "/employeesettings", active: true },
  { label: "Manager Dashboard", icon: BookMarked, path: "/employeemanager" },
  { label: "Calendar", icon: Calendar, path: "/calender" },
  { label: "Punch Clock", icon: Clock, path: "/punch-clock" },
  { label: "Message", icon: MessageCircle, path: "/message" },
];

export default function EmployeeSettings() {
  const navigate = useNavigate();

  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  const bgMain = darkMode
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";

  const cardBg = darkMode
    ? "bg-slate-900/85 border-slate-800"
    : "bg-white/95 border-slate-200";

  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  const navBg = darkMode
    ? "bg-slate-950 border-slate-800 text-slate-50"
    : "bg-white border-slate-200 text-slate-900";

  const headerBg = darkMode
    ? "bg-slate-900/80 border-slate-800"
    : "bg-white/80 border-slate-200";

  const hoverBg = darkMode ? "hover:bg-slate-800/70" : "hover:bg-slate-100";
  const commonTransition = "transition-all duration-300 ease-in-out";

  const employeeName = localStorage.getItem("employeeName") || "Employee";
  const employeeEmail =
    localStorage.getItem("employeeEmail") || "employee@company.com";
  const initials = getInitials(employeeName);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [salaryAlert, setSalaryAlert] = useState(true);
  const [leaveApprovalAlert, setLeaveApprovalAlert] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    window.clearTimeout(window.__empToastTimer);
    window.__empToastTimer = window.setTimeout(() => {
      setToast({ type: "", msg: "" });
    }, 2500);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeName");
    localStorage.removeItem("employeeEmail");
    navigate("/employee-login", { replace: true });
  };

  const loadSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);

      const res = await fetch(`${API_BASE}/employee/settings`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load settings");
      }

      const s = data.settings || {};

      setEmailNotif(s.emailNotif ?? true);
      setPushNotif(s.pushNotif ?? false);
      setWeeklySummary(s.weeklySummary ?? true);
      setSalaryAlert(s.salaryAlert ?? true);
      setLeaveApprovalAlert(s.leaveApprovalAlert ?? true);
      setTwoFA(s.twoFA ?? false);
      setShowEmail(s.showEmail ?? true);
      setShowPhone(s.showPhone ?? true);
    } catch (err) {
      showToast("error", err.message || "Failed to load settings");
    } finally {
      setLoadingSettings(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/employee/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          themeMode: darkMode ? "dark" : "light",
          emailNotif,
          pushNotif,
          weeklySummary,
          salaryAlert,
          leaveApprovalAlert,
          twoFA,
          showEmail,
          showPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save settings");
      }

      showToast("success", "Settings saved successfully");
    } catch (err) {
      showToast("error", err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
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

    setChangingPassword(true);

    try {
      const res = await fetch(`${API_BASE}/employee/settings/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
          confirmPassword: confirmPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update password");
      }

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      showToast("success", "Password updated successfully");
    } catch (err) {
      showToast("error", err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200 ${
    darkMode
      ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
  }`;

  return (
    <div className={`min-h-screen overflow-hidden ${bgMain} ${commonTransition}`}>
      <div className="relative flex min-h-screen">
        <aside
          className={`hidden lg:flex w-[290px] xl:w-[310px] flex-col border-r backdrop-blur-xl ${navBg} ${commonTransition}`}
        >
          <div
            className={`px-6 py-7 border-b ${
              darkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black flex items-center justify-center">
                EMS
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-[0.18em] text-emerald-500 uppercase">
                  Employee MS
                </h1>
                <p className={`text-xs mt-1 ${subText}`}>Smart employee portal</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 flex-1">
            <div className={`mb-5 rounded-3xl border p-4 ${cardBg}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-500">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{employeeName}</p>
                  <p className={`text-xs truncate ${subText}`}>{employeeEmail}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => navigate(item.path)}
                    className={`group w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left border ${commonTransition} ${
                      item.active
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                        : `${darkMode ? "text-slate-200" : "text-slate-700"} border-transparent ${hoverBg}`
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                        item.active
                          ? "bg-white/20 text-white"
                          : darkMode
                          ? "bg-slate-900 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </motion.button>
                );
              })}
            </nav>
          </div>

          <div
            className={`p-4 border-t ${
              darkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <button
              onClick={logout}
              className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${commonTransition} ${
                darkMode
                  ? "border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                  : "border-rose-300 text-rose-600 hover:bg-rose-50"
              }`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <div
            className={`sticky top-0 z-20 border-b backdrop-blur-xl ${headerBg} ${commonTransition}`}
          >
            <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${
                    darkMode
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  } ${commonTransition}`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div>
                  <p className={`text-[11px] uppercase tracking-[0.28em] ${subText}`}>
                    Employee Settings
                  </p>
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Preferences and account controls
                  </h2>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                } ${commonTransition}`}
              >
                {darkMode ? (
                  <SunMedium className="w-4 h-4" />
                ) : (
                  <MoonStar className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="max-w-7xl space-y-6">
              <div className={`rounded-[30px] border p-6 md:p-8 xl:p-10 ${cardBg}`}>
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <p className={`text-[11px] uppercase tracking-[0.28em] ${subText}`}>
                        Personal Preferences
                      </p>
                    </div>
                    <h1 className="mt-2 text-2xl md:text-3xl font-bold">
                      Manage your account settings
                    </h1>
                    <p className={`mt-2 text-sm max-w-2xl ${subText}`}>
                      Settings are saved to backend. Theme uses your global ThemeContext.
                    </p>
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={saving || loadingSettings}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-70"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {toast.msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`rounded-2xl border px-4 py-3 flex items-center gap-2 ${
                      toast.type === "success"
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                        : "border-rose-500/25 bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {toast.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{toast.msg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingSettings ? (
                <div className={`rounded-[28px] border p-8 flex items-center gap-3 ${cardBg}`}>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className={`text-sm ${subText}`}>Loading settings...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-6">
                    <SectionCard
                      icon={<Palette className="w-4 h-4 text-emerald-500" />}
                      title="Appearance"
                      subtitle="Global theme from ThemeContext"
                      cardBg={cardBg}
                      subText={subText}
                    >
                      <InfoRow
                        label="Theme"
                        desc="Choose light or dark mode"
                        darkMode={darkMode}
                        action={
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (darkMode) toggleTheme();
                              }}
                              className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-2 ${commonTransition} ${
                                !darkMode
                                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-600"
                                  : "border-slate-700 bg-slate-900 text-slate-300"
                              }`}
                            >
                              <SunMedium className="w-4 h-4" /> Light
                            </button>
                            <button
                              onClick={() => {
                                if (!darkMode) toggleTheme();
                              }}
                              className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-2 ${commonTransition} ${
                                darkMode
                                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                  : "border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              <MoonStar className="w-4 h-4" /> Dark
                            </button>
                          </div>
                        }
                      />
                    </SectionCard>

                    <SectionCard
                      icon={<Bell className="w-4 h-4 text-cyan-500" />}
                      title="Notifications"
                      subtitle="Control how updates reach you"
                      cardBg={cardBg}
                      subText={subText}
                    >
                      <ToggleRow title="Email Notifications" desc="Receive important updates via email" icon={<Mail className="w-3.5 h-3.5" />} checked={emailNotif} onChange={setEmailNotif} darkMode={darkMode} subText={subText} />
                      <ToggleRow title="Push Notifications" desc="Show alerts on your device" icon={<Bell className="w-3.5 h-3.5" />} checked={pushNotif} onChange={setPushNotif} darkMode={darkMode} subText={subText} />
                      <ToggleRow title="Weekly Summary" desc="Get weekly leave and salary summary" icon={<Calendar className="w-3.5 h-3.5" />} checked={weeklySummary} onChange={setWeeklySummary} darkMode={darkMode} subText={subText} />
                      <ToggleRow title="Salary Credited Alert" desc="Notify when salary is credited" icon={<CreditCard className="w-3.5 h-3.5" />} checked={salaryAlert} onChange={setSalaryAlert} darkMode={darkMode} subText={subText} />
                      <ToggleRow title="Leave Approval Updates" desc="Get notified when leave is approved/rejected" icon={<Award className="w-3.5 h-3.5" />} checked={leaveApprovalAlert} onChange={setLeaveApprovalAlert} darkMode={darkMode} subText={subText} />
                    </SectionCard>
                  </div>

                  <div className="space-y-6">
                    <SectionCard
                      icon={<Shield className="w-4 h-4 text-indigo-500" />}
                      title="Privacy"
                      subtitle="Manage account privacy controls"
                      cardBg={cardBg}
                      subText={subText}
                    >
                      <ToggleRow title="Two-factor Authentication" desc="Extra security for login" icon={<Fingerprint className="w-3.5 h-3.5" />} checked={twoFA} onChange={setTwoFA} darkMode={darkMode} subText={subText} />
                      <ToggleRow title="Show Email on Profile" desc="Display email in your profile card" icon={<Mail className="w-3.5 h-3.5" />} checked={showEmail} onChange={setShowEmail} darkMode={darkMode} subText={subText} />
                      <ToggleRow title="Show Phone on Profile" desc="Display phone number in your profile card" icon={<Smartphone className="w-3.5 h-3.5" />} checked={showPhone} onChange={setShowPhone} darkMode={darkMode} subText={subText} />
                    </SectionCard>

                    <div className="rounded-[28px] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-rose-600/5 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <h3 className="font-semibold text-rose-500">Danger Zone</h3>
                      </div>
                      <p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        Logging out will remove your current session from this device.
                      </p>
                      <button
                        onClick={logout}
                        className="mt-4 w-full px-4 py-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 text-sm font-semibold text-rose-500 flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout Now
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <SectionCard
                      icon={<LockKeyhole className="w-4 h-4 text-emerald-500" />}
                      title="Change Password"
                      subtitle="Update your password securely"
                      cardBg={cardBg}
                      subText={subText}
                    >
                      <PasswordInput label="Current Password" value={currentPass} setValue={setCurrentPass} show={showCurrentPass} setShow={setShowCurrentPass} inputClass={inputClass} />
                      <PasswordInput label="New Password" value={newPass} setValue={setNewPass} show={showNewPass} setShow={setShowNewPass} inputClass={inputClass} />
                      <PasswordInput label="Confirm New Password" value={confirmPass} setValue={setConfirmPass} show={showConfirmPass} setShow={setShowConfirmPass} inputClass={inputClass} />

                      <button
                        type="button"
                        onClick={changePassword}
                        disabled={changingPassword}
                        className="w-full mt-4 px-4 py-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-sm font-semibold text-emerald-500 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                        {changingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </SectionCard>

                    <div className={`rounded-[28px] border p-6 ${cardBg}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-cyan-500" />
                        <h3 className="font-semibold">Account Summary</h3>
                      </div>
                      <div className="space-y-3">
                        <MiniInfo label="User" value={employeeName} subText={subText} darkMode={darkMode} />
                        <MiniInfo label="Email" value={employeeEmail} subText={subText} darkMode={darkMode} />
                        <MiniInfo label="Theme" value={darkMode ? "Dark Mode" : "Light Mode"} subText={subText} darkMode={darkMode} />
                        <MiniInfo label="2FA" value={twoFA ? "Enabled" : "Disabled"} subText={subText} darkMode={darkMode} />
                      </div>
                      <button
                        onClick={() => showToast("success", "All settings look good")}
                        className={`mt-5 w-full px-4 py-3 rounded-2xl border text-sm flex items-center justify-center gap-2 ${
                          darkMode
                            ? "border-slate-700 bg-slate-900 hover:bg-slate-800"
                            : "border-slate-300 bg-white hover:bg-slate-100"
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        Run Quick Check
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, setValue, show, setShow, inputClass }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-400 mb-2">
        {label}
      </div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, children, cardBg, subText }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border p-6 md:p-7 ${cardBg}`}
    >
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/10">{icon}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className={`mt-2 text-sm ${subText}`}>{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function InfoRow({ label, desc, action, darkMode }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
        darkMode ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-slate-500 mt-1">{desc}</div>
      </div>
      {action}
    </div>
  );
}

function ToggleRow({ title, desc, icon, checked, onChange, darkMode, subText }) {
  return (
    <div
      className={`flex items-start justify-between gap-3 py-4 border-b last:border-b-0 ${
        darkMode ? "border-slate-800" : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1 rounded-lg bg-emerald-500/10 text-emerald-500">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className={`text-xs mt-1 ${subText}`}>{desc}</div>
        </div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full border transition-all duration-300 relative shrink-0 ${
          checked
            ? "bg-emerald-500/30 border-emerald-500/30"
            : darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-200 border-slate-300"
        }`}
      >
        <motion.span
          animate={{ x: checked ? 22 : 4 }}
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${
            checked ? "bg-emerald-400" : "bg-slate-400"
          }`}
        />
      </motion.button>
    </div>
  );
}

function MiniInfo({ label, value, subText, darkMode }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        darkMode ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className={`text-xs ${subText}`}>{label}</p>
      <p className="mt-1 text-sm font-medium break-words">{value}</p>
    </div>
  );
}