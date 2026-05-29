import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Shield,
  Users,
  Clock,
  Award,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUserAuth();

  const THEME = useMemo(
    () => ({
      primary: "#0d9488",
      primaryDark: "#0f766e",
      primaryLight: "#14b8a6",
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
  const [focusedField, setFocusedField] = useState(null);

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

      if (remember) localStorage.setItem("ems_email", email.trim());
      else localStorage.removeItem("ems_email");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      login(data.user);

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

  const features = [
    { icon: Shield, text: "Secure role-based access (Admin / Employee)", color: "#10b981" },
    { icon: Users, text: "Fast dashboard view + quick actions", color: "#3b82f6" },
    { icon: Clock, text: "Real-time attendance tracking", color: "#f59e0b" },
    { icon: Award, text: "Modern UI with clear, readable forms", color: "#8b5cf6" },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0, 1, 2] }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 animate-float" style={{ animationDuration: "8s" }}>
        <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10" />
      </div>
      <div className="absolute bottom-20 right-10 animate-float" style={{ animationDuration: "10s", animationDelay: "2s" }}>
        <div className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm border border-white/10" />
      </div>
      <div className="absolute top-1/2 left-1/4 animate-float" style={{ animationDuration: "12s", animationDelay: "4s" }}>
        <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/10" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
        >
          {/* Left Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden lg:flex rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 h-28 w-28 rounded-3xl border border-white/30" />
              <div className="absolute top-40 right-14 h-20 w-20 rounded-2xl border border-white/25" />
              <div className="absolute bottom-16 left-20 h-24 w-24 rounded-full border border-white/20" />
            </div>

            <div className="relative z-10 flex flex-col justify-between w-full">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-3"
                >
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white leading-tight">
                      EMS Portal
                    </h1>
                    <p className="text-white/80 text-sm mt-1">
                      Employee Management System
                    </p>
                  </div>
                </motion.div>

                <div className="mt-12 space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="mt-1 p-1.5 rounded-lg bg-white/10 border border-white/20 group-hover:bg-white/20 transition-all">
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed group-hover:text-white transition-colors">
                        {feature.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              
            </div>
          </motion.div>

          {/* Right Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-3xl border border-white/20 bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden"
          >
            <div className="p-8 sm:p-10">
              <div className="lg:hidden mb-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-4"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Employee Management System
                </h2>
                <p className="text-gray-600 text-sm mt-1">Sign in to continue</p>
              </div>

              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
                  >
                    Welcome Back
                  </motion.h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Please enter your credentials
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100"
                >
                  <div className="relative">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
                  </div>
                  <span className="text-xs font-semibold text-teal-800">Live Portal</span>
                </motion.div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-5 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 bg-red-500 rounded-full" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "email" ? "text-teal-500" : "text-gray-400"}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="employee@company.com"
                      className={`w-full rounded-2xl border-2 bg-white pl-12 pr-4 py-3.5 text-gray-900 outline-none transition-all duration-200
                        ${focusedField === "email" 
                          ? "border-teal-400 shadow-lg shadow-teal-500/20" 
                          : "border-gray-200 hover:border-gray-300"
                        } focus:ring-4 ${THEME.ring} focus:border-teal-300`}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === "password" ? "text-teal-500" : "text-gray-400"}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className={`w-full rounded-2xl border-2 bg-white pl-12 pr-24 py-3.5 text-gray-900 outline-none transition-all duration-200
                        ${focusedField === "password" 
                          ? "border-teal-400 shadow-lg shadow-teal-500/20" 
                          : "border-gray-200 hover:border-gray-300"
                        } focus:ring-4 ${THEME.ring} focus:border-teal-300`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 select-none cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </div>
                    <span className="group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline transition-all flex items-center gap-1"
                    onClick={() => setError("Please contact your system administrator to reset your password.")}
                  >
                    Forgot password?
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Login Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full rounded-2xl py-3.5 font-extrabold text-white shadow-lg transition-all duration-200 relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Login to Dashboard
                    </div>
                  )}
                </motion.button>

                <div className="pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    By signing in, you agree to your organisation's policies and terms of service.
                  </p>
                </div>
              </form>
            </div>

            <div className="px-8 sm:px-10 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  © {new Date().getFullYear()} EMS • Secure Employee Portal
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-500">System Online</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;