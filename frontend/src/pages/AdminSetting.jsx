import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Bell,
  ShieldCheck,
  Moon,
  Sun,
  Save,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <ArrowLeft
          className="cursor-pointer hover:opacity-70 transition"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 shadow-xl border ${
            darkMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings />
              <div>
                <h2 className="font-semibold">Appearance</h2>
                <p className="text-sm opacity-70">
                  Switch between light and dark mode
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 hover:scale-105 transition"
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
          className={`rounded-2xl p-6 shadow-xl border ${
            darkMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell />
              <div>
                <h2 className="font-semibold">Notifications</h2>
                <p className="text-sm opacity-70">
                  Turn system notifications on or off
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 peer-checked:bg-indigo-500 transition-all"></div>
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white peer-checked:translate-x-5 transition-all"></div>
            </label>
          </div>
        </motion.div>

        {/* Terms and Conditions Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 shadow-xl border md:col-span-2 ${
            darkMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white border-zinc-200"
          }`}
        >
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck />
              <div>
                <h2 className="font-semibold">Terms & Conditions</h2>
                <p className="text-sm opacity-70">
                  Review policies, rules, and usage terms
                </p>
              </div>
            </div>

            <motion.div
              animate={{ rotate: showTerms ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="opacity-70" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showTerms && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className={`rounded-xl p-4 text-sm leading-7 ${
                    darkMode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <p>
                    1. Admins must use the system responsibly and maintain the
                    privacy of employee data.
                  </p>
                  <p>
                    2. Unauthorized access, modification, or misuse of records
                    is strictly prohibited.
                  </p>
                  <p>
                    3. Notifications and appearance settings affect only the
                    current admin experience.
                  </p>
                  <p>
                    4. All system changes should be reviewed before saving to
                    avoid unintended updates.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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