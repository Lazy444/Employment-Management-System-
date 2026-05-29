import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  AlertCircle,
  CalendarDays,
  Flag,
  Trash2,
  CheckCircle2,
  Clock3,
  CircleDashed,
  RefreshCw,
  Sparkles,
  FileText,
  User,
  Calendar,
  Tag,
  MoreVertical,
  Edit2,
  Eye,
  Bell,
  SunMedium,
  MoonStar,
  Menu,
  X,
  Award,
  TrendingUp,
  Star,
  Zap,
  Target,
  Layers,
  CheckSquare,
  ListTodo,
  BarChart3
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getTasks, updateTask, deleteTask } from "../services/taskService.js";

const statuses = ["todo", "in-progress", "done"];

const statusMeta = {
  todo: {
    label: "To Do",
    icon: CircleDashed,
    headerClass: "text-cyan-300",
    countClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    bgGradient: "from-cyan-500/5 to-transparent",
    progressColor: "cyan"
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock3,
    headerClass: "text-amber-300",
    countClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    bgGradient: "from-amber-500/5 to-transparent",
    progressColor: "amber"
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    headerClass: "text-emerald-300",
    countClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    bgGradient: "from-emerald-500/5 to-transparent",
    progressColor: "emerald"
  },
};

const priorityMeta = {
  low: { 
    bg: "bg-sky-500/15", 
    text: "text-sky-300", 
    border: "border-sky-500/30",
    icon: "🔵"
  },
  medium: { 
    bg: "bg-amber-500/15", 
    text: "text-amber-300", 
    border: "border-amber-500/30",
    icon: "🟡"
  },
  high: { 
    bg: "bg-rose-500/15", 
    text: "text-rose-300", 
    border: "border-rose-500/30",
    icon: "🔴"
  },
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return "—";
  }
};

const formatRelativeDate = (value) => {
  if (!value) return "—";
  try {
    const date = new Date(value);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(value);
  } catch {
    return "—";
  }
};

const normalizeTasks = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.tasks)) return payload.tasks;
  return [];
};

export default function EmployeeTaskManager() {
  const navigate = useNavigate();
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? true;
  const toggleTheme = theme?.toggleTheme ?? (() => {});

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchTasks = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setErrorMsg("");
      const res = await getTasks();
      const normalized = normalizeTasks(res?.data);
      setTasks(normalized);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load assigned tasks."
      );
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateTask(id, { status });
      fetchTasks(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update task status.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        fetchTasks(true);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to delete task.");
      }
    }
  };

  const counts = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((counts.done / totalTasks) * 100) : 0;
  const productivityScore = completionRate;

  const employeeName = localStorage.getItem("employeeName") || "Employee";
  const firstName = employeeName.split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(6,182,212,0.08),_transparent_40%),radial-gradient(circle_at_bottom_center,_rgba(99,102,241,0.08),_transparent_40%)]" />
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/[0.03] via-cyan-500/[0.02] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-indigo-500/[0.03] to-transparent" />
      </div>

      <div className="relative">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition"
              >
                <Menu className="w-5 h-5 text-slate-200" />
              </button>

              <button
                onClick={() => navigate(-1)}
                className="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition group"
              >
                <ArrowLeft className="w-5 h-5 text-slate-200 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    Task Management
                  </p>
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-white">
                  Welcome back, {firstName} 👋
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTasks(true)}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition flex items-center justify-center"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 text-slate-200 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] transition flex items-center justify-center"
              >
                {darkMode ? (
                  <SunMedium className="w-4 h-4 text-slate-200" />
                ) : (
                  <MoonStar className="w-4 h-4 text-slate-200" />
                )}
              </button>

              <div className="hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg blur-sm opacity-40" />
                  <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/20 flex items-center justify-center">
                    <span className="font-bold text-emerald-200 text-sm">
                      {employeeName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white truncate max-w-[150px]">
                    {employeeName}
                  </p>
                  <p className="text-xs text-slate-400">Task Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-2xl shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-indigo-500/10" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
              
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                        My Task Manager
                      </p>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Tasks assigned by admin
                    </h1>
                    <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                      Track your assigned tasks, update status, and stay productive.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-center">
                      <p className="text-xs text-slate-400">Total Tasks</p>
                      <p className="text-2xl font-bold text-white">{totalTasks}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-center">
                      <p className="text-xs text-slate-400">Completion</p>
                      <p className="text-2xl font-bold text-emerald-400">{completionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statuses.map((status, idx) => {
                const meta = statusMeta[status];
                const Icon = meta.icon;
                const count = counts[status];

                return (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur p-5 overflow-hidden hover:border-white/20 transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${meta.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${meta.headerClass}`}>
                          {meta.label}
                        </p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-3xl font-bold text-white">{count}</span>
                          <span className="text-xs text-slate-400">
                            task{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className={`h-12 w-12 rounded-xl ${meta.countClass} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${meta.headerClass}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-full rounded-full bg-gradient-to-r from-${meta.progressColor}-400 to-${meta.progressColor}-500`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Productivity Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur p-5"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Productivity Score</p>
                    <p className="text-xs text-slate-400">Based on task completion</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{productivityScore}%</p>
                    <p className="text-xs text-slate-400">Completion Rate</p>
                  </div>
                  <div className="w-32 h-32 relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - productivityScore / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{productivityScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur px-4 py-3 text-sm text-rose-200 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Task Boards */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur px-6 py-20 flex flex-col items-center justify-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse" />
                  <Loader2 className="relative w-8 h-8 animate-spin text-emerald-300" />
                </div>
                <span className="text-sm text-slate-300">
                  Loading assigned tasks...
                </span>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {statuses.map((status, idx) => {
                  const meta = statusMeta[status];
                  const Icon = meta.icon;
                  const columnTasks = tasks.filter((t) => t.status === status);

                  return (
                    <motion.div
                      key={status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur overflow-hidden"
                    >
                      <div className={`px-5 py-4 border-b border-white/10 bg-gradient-to-r ${meta.bgGradient}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${meta.headerClass}`} />
                            <h3 className={`font-semibold ${meta.headerClass}`}>
                              {meta.label}
                            </h3>
                          </div>
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.countClass}`}
                          >
                            {columnTasks.length}
                          </motion.span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {columnTasks.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="min-h-[340px] rounded-2xl border border-dashed border-white/10 bg-black/10 flex flex-col items-center justify-center text-center px-6 py-12"
                          >
                            <ClipboardList className="w-12 h-12 text-slate-500 mb-3" />
                            <p className="text-sm text-slate-400">
                              No tasks in {meta.label.toLowerCase()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Tasks will appear here when assigned
                            </p>
                          </motion.div>
                        ) : (
                          columnTasks.map((task, taskIdx) => (
                            <motion.div
                              key={task._id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: taskIdx * 0.05 }}
                              whileHover={{ y: -2 }}
                              className="group rounded-2xl border border-white/10 bg-[#0B1024]/80 p-4 shadow-lg shadow-black/20 hover:border-white/20 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white leading-snug">
                                    {task.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityMeta[task.priority || "medium"].bg} ${priorityMeta[task.priority || "medium"].text} ${priorityMeta[task.priority || "medium"].border}`}
                                    >
                                      <Flag className="w-3 h-3" />
                                      {task.priority || "medium"}
                                    </span>
                                    {task.dueDate && (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        Due: {formatDate(task.dueDate)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {task.description && (
                                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="w-3 h-3 text-cyan-300" />
                                    <span className="text-[10px] uppercase tracking-wide text-slate-400">
                                      Description
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                                    {task.description}
                                  </p>
                                </div>
                              )}

                              {/* Meta Info */}
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  Created: {formatRelativeDate(task.createdAt)}
                                </span>
                                {task.assignedBy?.name && (
                                  <span className="inline-flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    By: {task.assignedBy.name}
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                                <select
                                  className="text-xs bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 outline-none text-slate-100 hover:bg-white/15 transition cursor-pointer"
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                >
                                  <option value="todo" className="text-black">📋 To Do</option>
                                  <option value="in-progress" className="text-black">⚡ In Progress</option>
                                  <option value="done" className="text-black">✅ Done</option>
                                </select>

                                <button
                                  onClick={() => handleDelete(task._id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {!loading && tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-xs text-slate-500 py-4"
              >
                <p>🎯 Stay productive! Update task status as you progress.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-slate-950/95 backdrop-blur-2xl border-r border-white/10"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 font-black flex items-center justify-center">
                      EMS
                    </div>
                    <div>
                      <h1 className="text-sm font-bold tracking-[0.18em] text-emerald-300">
                        EMPLOYEE MS
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">Task Manager</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.05] flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/25 border border-white/10 flex items-center justify-center">
                      <span className="font-bold text-emerald-200 text-lg">
                        {employeeName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {employeeName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">Employee Portal</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigate("/employeeprofile");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.06] transition text-sm text-slate-300"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/employeeleave");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.06] transition text-sm text-slate-300"
                  >
                    Leave
                  </button>
                  <button
                    onClick={() => {
                      navigate("/employeesalary");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.06] transition text-sm text-slate-300"
                  >
                    Salary
                  </button>
                  <button
                    onClick={() => {
                      navigate("/employeesettings");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.06] transition text-sm text-slate-300"
                  >
                    Settings
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("employeeName");
                    navigate("/employee-login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-400/20 px-4 py-3 text-sm font-medium text-rose-200 transition"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}