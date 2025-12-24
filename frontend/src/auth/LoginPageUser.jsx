/* eslint-disable */
import React, { useState } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, when: "beforeChildren" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 15 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const LoginPageUser= () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("EMS Login:", form);
    // TODO: call your EMS login API here
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      {/* animated background glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-indigo-500 blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-emerald-500 blur-3xl opacity-40" />
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT: EMS text */}
        <motion.div className="space-y-4" variants={cardVariants}>
          <motion.p
            className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300"
            variants={fieldVariants}
          >
            EMS · Employee Management System
          </motion.p>

          <motion.h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            variants={fieldVariants}
          >
            Welcome back,
            <span className="block bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              manage your workforce smarter.
            </span>
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-slate-300 max-w-md"
            variants={fieldVariants}
          >
            Log in to access your EMS dashboard, approve leave, track attendance,
            and keep your team running smoothly in one place.
          </motion.p>

          <motion.div
            className="flex gap-2 text-xs md:text-sm text-slate-400"
            variants={fieldVariants}
          >
            <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400" />
            <p>Secure access · Role-based control · Real-time updates</p>
          </motion.div>
        </motion.div>

        {/* RIGHT: Login card */}
        <motion.div
          className="backdrop-blur-xl bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/60 p-6 md:p-8"
          variants={cardVariants}
        >
          <motion.div
            className="mb-6 text-center md:text-left"
            variants={fieldVariants}
          >
            <h2 className="text-xl md:text-2xl font-semibold">
              EMS Login
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1.5">
              Enter your credentials to continue to the dashboard.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={containerVariants}
          >
            {/* Email */}
            <motion.div className="space-y-1.5" variants={fieldVariants}>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-200"
              >
                Work Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3.5 py-2.5 text-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/60 transition"
                  placeholder="you@company.com" 
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div className="space-y-1.5" variants={fieldVariants}>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-200"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3.5 py-2.5 text-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/60 transition"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            {/* Remember + forgot */}
            <motion.div
              className="flex items-center justify-between text-xs text-slate-400"
              variants={fieldVariants}
            >
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900/70 text-indigo-500 focus:ring-0"
                />
                <span>Remember this device</span>
              </label>

              <button
                type="button"
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              className="w-full mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-900/50 hover:brightness-110 active:scale-[0.98] transition"
              variants={fieldVariants}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign in to EMS
            </motion.button>

            {/* Footer text */}
            <motion.p
              className="text-[11px] text-center text-slate-500 pt-1"
              variants={fieldVariants}
            >
              Having trouble logging in? Contact your system administrator.
            </motion.p>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPageUser;