import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUserAuth();

  const THEME = useMemo(
    () => ({
      primary: "#0d9488",
      primaryDark: "#0f766e",
      ring: "focus:ring-teal-400",
    }),
    []
  );

  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui states
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("ems_email");
    if (saved) setEmail(saved);
  }, []);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) return setError(msg);

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${API_BASE}/api/auth/login`,
        { email: email.trim(), password },
        { timeout: 10000 }
      );

      if (!data?.success) {
        setError(data?.error || "Invalid credentials.");
        return;
      }

      // remember email
      if (remember) localStorage.setItem("ems_email", email.trim());
      else localStorage.removeItem("ems_email");

      // ✅ save auth for protected routes
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ set context
      login(data.user);

      // ✅ role based redirect
      const role = String(data?.user?.role || "").toLowerCase().trim();

      if (role === "admin") {
        navigate("/admindashboard", { replace: true });
      } else if (role === "employee") {
        navigate("/employeeprofile", { replace: true });
      } else {
        setError("Role not recognized. Please contact admin.");
      }
    } catch (err) {
      if (err?.code === "ECONNABORTED") {
        setError("Server timeout. Please try again.");
      } else if (err?.message?.includes("Network Error")) {
        setError("Cannot connect to server. Please start your backend.");
      } else if (err?.response) {
        setError(err.response.data?.error || `Request failed (${err.response.status})`);
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-700 via-teal-600 to-gray-100" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-[-140px] left-[15%] h-96 w-96 rounded-full bg-black/10 blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* left info panel */}
          <div className="hidden lg:flex rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 h-28 w-28 rounded-3xl border border-white/30" />
              <div className="absolute top-40 right-14 h-20 w-20 rounded-2xl border border-white/25" />
              <div className="absolute bottom-16 left-20 h-24 w-24 rounded-full border border-white/20" />
            </div>

            <div className="relative z-10 flex flex-col justify-between w-full">
              <div>
                <div className="inline-flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                    <span className="text-white font-black text-lg">EMS</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-white leading-tight">
                      Employee Management System
                    </h1>
                    <p className="text-white/80 text-sm mt-1">
                      Login to manage attendance, salary, departments & more.
                    </p>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <FeatureRow text="Secure role-based access (Admin / Employee)" />
                  <FeatureRow text="Fast dashboard view + quick actions" />
                  <FeatureRow text="Modern UI with clear, readable forms" />
                </div>
              </div>

              <div className="mt-10 text-white/80 text-sm">
                <p className="font-semibold text-white">Tip:</p>
                <p className="mt-1">
                  Use your organisation email and password. If you forgot access, contact the system admin.
                </p>
              </div>
            </div>
          </div>

          {/* right login card */}
          <div className="rounded-3xl border border-white/10 bg-white/95 shadow-2xl overflow-hidden">
            <div className="p-7 sm:p-10">
              <div className="lg:hidden mb-6 text-center">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Employee Management System
                </h2>
                <p className="text-gray-600 text-sm mt-1">Sign in to continue</p>
              </div>

              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Login</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Welcome back — please enter your details.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-teal-50 border border-teal-100">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                  <span className="text-xs font-semibold text-teal-800">Online Portal</span>
                </div>
              </div>

              {error ? (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800">Email</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MailIcon />
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="employee@ems.com"
                      className={`w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-gray-900 outline-none transition focus:ring-4 ${THEME.ring} focus:border-teal-300`}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800">Password</label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <LockIcon />
                    </span>

                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 pr-24 text-gray-900 outline-none transition focus:ring-4 ${THEME.ring} focus:border-teal-300`}
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* Remember + forgot */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                    onClick={() => setError("Forgot password is not wired yet.")}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl py-3 font-extrabold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.primaryDark})`,
                  }}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-500">
                    By signing in, you agree to your organisation’s policies.
                  </p>
                </div>
              </form>
            </div>

            <div className="px-7 sm:px-10 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} EMS • Secure Employee Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

/* -------------------- Small Components / Icons -------------------- */

function FeatureRow({ text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 h-5 w-5 rounded-full bg-white/20 border border-white/25 flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      <p className="text-white/90 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7.5C4 6.12 5.12 5 6.5 5h11C18.88 5 20 6.12 20 7.5v9c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 19 4 17.88 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.9"
      />
      <path
        d="M6.5 7.5 12 11.5l5.5-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 11V8.7C7 6.1 9.1 4 11.7 4h.6C14.9 4 17 6.1 17 8.7V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.5 11h9c1.1 0 2 .9 2 2v5.5c0 1.1-.9 2-2 2h-9c-1.1 0-2-.9-2-2V13c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 15.2v2.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
