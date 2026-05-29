import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Filter,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  ArrowLeft,
  Loader2,
  Users,
  Hash,
  UserCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Grid3x3,
  List,
  Banknote,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

const AdminDepartment = () => {
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [modalErrors, setModalErrors] = useState({});

  const bgMain = darkMode
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-br from-slate-100 via-white to-slate-50";

  const cardBg = darkMode
    ? "bg-slate-900/80 backdrop-blur-sm border-slate-800"
    : "bg-white/80 backdrop-blur-sm border-slate-200";

  const subText = darkMode ? "text-slate-400" : "text-slate-600";
  const textColor = darkMode ? "text-white" : "text-slate-900";
  const borderColor = darkMode ? "border-slate-800" : "border-slate-200";
  const placeholderColor = darkMode
    ? "placeholder:text-slate-500"
    : "placeholder:text-slate-400";
  const inputBg = darkMode ? "bg-slate-900/50" : "bg-white";

  const token = useMemo(() => localStorage.getItem("token"), []);

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }, [token]);

  const fetchDepartments = async () => {
    try {
      setLoadingList(true);

      const { data } = await axiosAuth.get("/api/departments");
      if (!data?.success) {
        throw new Error(data?.error || "Failed to load departments");
      }

      const normalized = (data.departments || []).map((d, idx) => ({
        _id: d._id,
        id: d.code || `DEP-${String(idx + 1).padStart(3, "0")}`,
        name: d.name || "",
        code: d.code || "",
        head: d.head || "—",
        employees: d.employees ?? 0,
        hourlyRate: Number(d.hourlyRate ?? 0),
        status: d.isActive ? "Active" : "On Hold",
        description: d.description || "",
        createdAt: d.createdAt || new Date().toISOString(),
      }));

      setDepartments(normalized);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.error || err.message || "Error loading departments"
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((dep) => {
    const matchesSearch =
      dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dep.head?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus =
      statusFilter === "All" ? true : dep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openModal = (department = null) => {
    setModalErrors({});

    if (department) {
      setEditingDept({
        ...department,
        hourlyRate: String(department.hourlyRate ?? 0),
      });
    } else {
      setEditingDept({
        _id: null,
        id: "",
        name: "",
        code: "",
        head: "",
        employees: 0,
        hourlyRate: "",
        status: "Active",
        description: "",
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setEditingDept(null);
    setModalErrors({});
    setShowModal(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!editingDept?.name?.trim()) {
      errors.name = "Department name is required";
    }

    if (editingDept?.code && editingDept.code.length > 10) {
      errors.code = "Code must be 10 characters or less";
    }

    if (
      editingDept?.hourlyRate === "" ||
      editingDept?.hourlyRate === null ||
      editingDept?.hourlyRate === undefined ||
      isNaN(Number(editingDept.hourlyRate)) ||
      Number(editingDept.hourlyRate) < 0
    ) {
      errors.hourlyRate =
        "Hourly rate must be a valid number greater than or equal to 0";
    }

    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        name: editingDept.name.trim(),
        code: (editingDept.code || "").trim().toUpperCase(),
        description: editingDept.description || "",
        hourlyRate: Number(editingDept.hourlyRate || 0),
        isActive: editingDept.status === "Active",
      };

      if (!editingDept._id) {
        const { data } = await axiosAuth.post("/api/departments", payload);

        if (!data?.success) {
          throw new Error(data?.error || "Failed to create department");
        }

        toast.success("Department created successfully");
      } else {
        const { data } = await axiosAuth.put(
          `/api/departments/${editingDept._id}`,
          payload
        );

        if (!data?.success) {
          throw new Error(data?.error || "Failed to update department");
        }

        toast.success("Department updated successfully");
      }

      await fetchDepartments();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.error || err.message || "Error saving department"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${dept.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(dept._id);

      // Replace with real delete API when available
      await new Promise((resolve) => setTimeout(resolve, 500));

      setDepartments((prev) => prev.filter((d) => d._id !== dept._id));
      toast.success(`"${dept.name}" has been deleted`);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.error || err.message || "Error deleting department"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`rounded-xl border ${cardBg} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs uppercase tracking-wide ${subText}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  );

  const DepartmentCard = ({ dep, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`rounded-xl border ${cardBg} overflow-hidden transition-all duration-300 hover:shadow-xl`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${textColor}`}>{dep.name}</h3>
            {dep.code && (
              <p className={`text-xs font-mono mt-1 ${subText}`}>
                <Hash className="w-3 h-3 inline mr-1" />
                {dep.code}
              </p>
            )}
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              dep.status
            )}`}
          >
            {dep.status === "Active" ? (
              <CheckCircle className="w-3 h-3 inline mr-1" />
            ) : (
              <Clock className="w-3 h-3 inline mr-1" />
            )}
            {dep.status}
          </span>
        </div>

        <div className={`flex flex-col gap-3 mt-3 pt-3 border-t ${borderColor}`}>
          <div className="flex items-center gap-2">
            <UserCircle className={`w-4 h-4 ${subText}`} />
            <span className={`text-sm ${subText}`}>Head: {dep.head}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${subText}`} />
            <span className="text-sm font-semibold text-emerald-500">
              {dep.employees} employees
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Banknote className={`w-4 h-4 ${subText}`} />
            <span className="text-sm font-semibold text-blue-500">
              Hourly Rate: Rs. {Number(dep.hourlyRate || 0).toLocaleString()}/hr
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-2 mt-4 pt-3 border-t ${borderColor}`}>
          <button
            onClick={() => openModal(dep)}
            className="flex-1 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={() => handleDelete(dep)}
            disabled={deletingId === dep._id}
            className="flex-1 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deletingId === dep._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );

  const DepartmentListItem = ({ dep, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`px-5 py-4 flex flex-col md:flex-row md:items-center justify-between border-b ${borderColor} hover:bg-opacity-50 transition-colors ${
        darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className={`font-semibold text-base ${textColor}`}>{dep.name}</h3>

          {dep.code && (
            <span
              className={`text-xs font-mono px-2 py-1 rounded ${
                darkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {dep.code}
            </span>
          )}

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              dep.status
            )}`}
          >
            {dep.status}
          </span>
        </div>

        <div className={`flex items-center gap-4 mt-2 text-xs ${subText} flex-wrap`}>
          <span className="flex items-center gap-1">
            <UserCircle className="w-3 h-3" />
            {dep.head}
          </span>

          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {dep.employees} employees
          </span>

          <span className="flex items-center gap-1">
            <Banknote className="w-3 h-3" />
            Rs. {Number(dep.hourlyRate || 0).toLocaleString()}/hr
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 md:mt-0">
        <button
          onClick={() => openModal(dep)}
          className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleDelete(dep)}
          disabled={deletingId === dep._id}
          className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
          title="Delete"
        >
          {deletingId === dep._id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.div>
  );

  const stats = {
    total: departments.length,
    active: departments.filter((d) => d.status === "Active").length,
    onHold: departments.filter((d) => d.status === "On Hold").length,
    totalEmployees: departments.reduce((sum, d) => sum + d.employees, 0),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen w-full px-4 md:px-8 py-6 md:py-8 ${bgMain}`}
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admindashboard")}
              className={`p-2 rounded-lg transition-all hover:scale-105 ${
                darkMode
                  ? "hover:bg-slate-800 text-slate-300"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <Building2 className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className={`text-2xl font-bold ${textColor}`}>
                Manage Departments
              </h1>
              <p className={`text-sm ${subText} mt-1`}>
                Create, organize and manage all departments in your organization
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal(null)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard
            icon={Building2}
            label="Total Departments"
            value={stats.total}
            color="emerald"
          />
          <StatCard
            icon={CheckCircle}
            label="Active"
            value={stats.active}
            color="green"
          />
          <StatCard
            icon={AlertCircle}
            label="On Hold"
            value={stats.onHold}
            color="amber"
          />
          <StatCard
            icon={Users}
            label="Total Employees"
            value={stats.totalEmployees}
            color="blue"
          />
        </div>
      </div>

      <div className={`rounded-xl border ${cardBg} p-5 mb-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${subText}`}
            />
            <input
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
              placeholder="Search by name, code, or head..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${subText}`}
              />
              <select
                className={`pl-10 pr-8 py-2.5 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>On Hold</option>
              </select>
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-lg border ${borderColor}`}>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-emerald-500/20 text-emerald-500"
                    : subText
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-emerald-500/20 text-emerald-500"
                    : subText
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={fetchDepartments}
              disabled={loadingList}
              className={`p-2.5 rounded-lg border ${borderColor} ${textColor} hover:bg-opacity-50 transition-all disabled:opacity-50`}
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingList ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border ${cardBg} overflow-hidden`}>
        <div
          className={`px-5 py-3 border-b ${borderColor} flex items-center justify-between`}
        >
          <span className={`text-sm font-medium ${subText}`}>
            Showing {filteredDepartments.length} of {departments.length} departments
          </span>
        </div>

        {loadingList ? (
          <div className="px-5 py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className={`text-sm ${subText}`}>Loading departments...</span>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <Building2
              className={`w-16 h-16 mx-auto mb-4 ${subText} opacity-50`}
            />
            <p className={`text-base font-medium ${textColor}`}>
              No departments found
            </p>
            <p className={`text-sm ${subText} mt-1`}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepartments.map((dep, index) => (
              <DepartmentCard key={dep._id} dep={dep} index={index} />
            ))}
          </div>
        ) : (
          <div className={`divide-y ${borderColor}`}>
            {filteredDepartments.map((dep, index) => (
              <DepartmentListItem key={dep._id} dep={dep} index={index} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && editingDept && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-6 rounded-2xl shadow-2xl w-full max-w-md ${
                darkMode ? "bg-slate-900" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-xl font-bold ${textColor}`}>
                  {editingDept?._id ? "Edit Department" : "Create Department"}
                </h3>
                <button
                  onClick={closeModal}
                  className={`p-1 rounded-lg transition-all ${
                    darkMode
                      ? "hover:bg-slate-800 text-slate-400"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                    Department Name *
                  </label>
                  <input
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      modalErrors.name ? "border-rose-500" : borderColor
                    } ${
                      darkMode
                        ? "bg-slate-800 text-white placeholder:text-slate-500"
                        : "bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                    placeholder="e.g., Human Resources"
                    value={editingDept.name}
                    onChange={(e) =>
                      setEditingDept({ ...editingDept, name: e.target.value })
                    }
                  />
                  {modalErrors.name && (
                    <p className="text-rose-500 text-xs mt-1">
                      {modalErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                    Department Code
                  </label>
                  <input
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      modalErrors.code ? "border-rose-500" : borderColor
                    } ${
                      darkMode
                        ? "bg-slate-800 text-white placeholder:text-slate-500"
                        : "bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                    placeholder="e.g., HR, IT, FIN"
                    value={editingDept.code}
                    onChange={(e) =>
                      setEditingDept({
                        ...editingDept,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  {modalErrors.code && (
                    <p className="text-rose-500 text-xs mt-1">
                      {modalErrors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                    Hourly Rate *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                      modalErrors.hourlyRate ? "border-rose-500" : borderColor
                    } ${
                      darkMode
                        ? "bg-slate-800 text-white placeholder:text-slate-500"
                        : "bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                    placeholder="e.g., 500 (per hour)"
                    value={editingDept.hourlyRate}
                    onChange={(e) =>
                      setEditingDept({
                        ...editingDept,
                        hourlyRate: e.target.value,
                      })
                    }
                  />
                  {modalErrors.hourlyRate && (
                    <p className="text-rose-500 text-xs mt-1">
                      {modalErrors.hourlyRate}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                    Status
                  </label>
                  <select
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${borderColor} ${
                      darkMode
                        ? "bg-slate-800 text-white"
                        : "bg-white text-slate-900"
                    }`}
                    value={editingDept.status}
                    onChange={(e) =>
                      setEditingDept({ ...editingDept, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>
                    Description (Optional)
                  </label>
                  <textarea
                    rows="3"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${borderColor} ${
                      darkMode
                        ? "bg-slate-800 text-white placeholder:text-slate-500"
                        : "bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                    placeholder="Brief description of the department..."
                    value={editingDept.description || ""}
                    onChange={(e) =>
                      setEditingDept({
                        ...editingDept,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className={`flex-1 px-4 py-2.5 rounded-lg border ${borderColor} ${textColor} hover:bg-opacity-50 transition-all`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving..." : "Save Department"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDepartment;