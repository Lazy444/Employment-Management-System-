import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const salaryStats = [
  {
    label: "Total Payroll",
    value: "₹ 8,40,000",
    icon: <Wallet className="w-6 h-6 text-white" />,
    bg: "from-indigo-500 to-purple-600",
  },
  {
    label: "Average Salary",
    value: "₹ 35,000",
    icon: <IndianRupee className="w-6 h-6 text-white" />,
    bg: "from-emerald-500 to-teal-600",
  },
  {
    label: "Employees Paid",
    value: "48",
    icon: <Users className="w-6 h-6 text-white" />,
    bg: "from-amber-500 to-orange-600",
  },
  {
    label: "Monthly Growth",
    value: "+6.4%",
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    bg: "from-pink-500 to-rose-600",
  },
];

const AdminSalary = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

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
        <h1 className="text-2xl font-bold tracking-tight">
          Salary Management
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {salaryStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className={`rounded-2xl p-5 bg-gradient-to-br ${stat.bg} shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Salary Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-6 shadow-xl ${
          darkMode ? "bg-zinc-900" : "bg-white"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Employee Salary List</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-zinc-700/30">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Salary</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {["Aarav", "Suman", "Nisha", "Rohit"].map((name, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-700/10 hover:bg-zinc-800/5 transition"
                >
                  <td className="py-3 font-medium">{name}</td>
                  <td className="py-3">IT</td>
                  <td className="py-3">₹ 40,000</td>
                  <td className="py-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                      Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSalary;