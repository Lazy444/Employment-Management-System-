import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Bell,
  Shield,
  Moon,
  Sun,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <ArrowLeft
          className="cursor-pointer hover:opacity-70"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 shadow-xl ${
            darkMode ? "bg-zinc-900" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings />
              <h2 className="font-semibold">Appearance</h2>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400"
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 shadow-xl ${
            darkMode ? "bg-zinc-900" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell />
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="w-5 h-5 accent-indigo-500"
            />
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 shadow-xl ${
            darkMode ? "bg-zinc-900" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield />
            <h2 className="font-semibold">Security</h2>
          </div>
          <p className="text-sm opacity-70">
            Manage password policy, admin access, and system rules.
          </p>
        </motion.div>

        {/* Backup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-6 shadow-xl ${
            darkMode ? "bg-zinc-900" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Auto Backup</h2>
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={() => setAutoBackup(!autoBackup)}
              className="w-5 h-5 accent-emerald-500"
            />
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 flex justify-end"
        >
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 transition">
            <Save size={18} />
            Save Changes
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminSettings;