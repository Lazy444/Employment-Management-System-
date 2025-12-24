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
  hidden: { opacity: 0, y: 30 },
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

const AdminLoginPage = () => {
  const [form, setForm] = useState({
    adminId: "",
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
    console.log("Admin Login:", form);
    // TODO: replace with real admin login API call
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      {/* background glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-purple-500 blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-rose-500 blur-3xl opacity-40" />
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT – description */}
        <motion.div className="space-y-4" variants={cardVariants}>
          <motion.p
            className="inline-flex items-center rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300"
            variants={fieldVariants}
          >
            EMS Admin Console
          </motion.p>

          <motion.h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            variants={fieldVariants}
          >
            Admin access for{" "}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
              full system control.
            </span>
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-slate-300 max-w-md"
            variants={fieldVariants}
          >
            Sign in with your admin credentials to configure roles, review
            logs, manage departments, and monitor activity across the Employee
            Management System.
          </motion.p>

          <motion.div
            className="text-[11px] text-slate-500"
            variants={fieldVariants}
          >
            Only authorised administrators are allowed to log in. All actions
            are audited.
          </motion.div>
        </motion.div>

        {/* RIGHT – form */}
        <motion.div
          className="backdrop-blur-xl bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/60 p-6 md:p-8"
          variants={cardVariants}
        >
          <motion.div
            className="mb-6 text-center md:text-left"
            variants={fieldVariants}
          >
            <h2 className="text-xl md:text-2xl font-semibold">
              Admin Login
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1.5">
              Use your admin ID and password to access the EMS admin dashboard.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={containerVariants}
          >
            {/* Admin ID */}
            <motion.div className="space-y-1.5" variants={fieldVariants}>
              <label
                htmlFor="adminId"
                className="block text-xs font-medium text-slate-200"
              >
                Admin ID
              </label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                value={form.adminId}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3.5 py-2.5 text-sm outline-none ring-0 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/60 transition"
                placeholder="admin-001"
              />
            </motion.div>

            {/* Password */}
            <motion.div className="space-y-1.5" variants={fieldVariants}>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-200"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-slate-900/70 border border-slate-700 px-3.5 py-2.5 text-sm outline-none ring-0 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/60 transition"
                placeholder="••••••••"
              />
            </motion.div>

            {/* Info text */}
            <motion.p
              className="text-[11px] text-slate-500"
              variants={fieldVariants}
            >
              Do not share your admin credentials. Contact system owner if you
              suspect unauthorised access.
            </motion.p>

            {/* Submit */}
            <motion.button
              type="submit"
              className="w-full mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-rose-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-purple-900/60 hover:brightness-110 active:scale-[0.98] transition"
              variants={fieldVariants}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign in as Admin
            </motion.button>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
