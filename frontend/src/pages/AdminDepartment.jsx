// src/pages/AdminDepartment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const AdminDepartment = () => {
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const navigate = useNavigate();

  // Backend state
  const [departments, setDepartments] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // UI colors
  const bgMain = darkMode ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-900";
  const cardBg = darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  const token = useMemo(() => localStorage.getItem("token"), []);

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }, [token]);

  // ✅ Load departments from backend
  const fetchDepartments = async () => {
    try {
      setLoadingList(true);
      const { data } = await axiosAuth.get("/api/departments");
      if (!data?.success) throw new Error(data?.error || "Failed to load departments");

      // Normalize to your UI shape
      const normalized = (data.departments || []).map((d, idx) => ({
        _id: d._id,
        id: d.code || `DEP-${String(idx + 1).padStart(3, "0")}`,
        name: d.name || "",
        code: d.code || "",
        head: d.head || "—",
        employees: d.employees ?? 0,
        status: d.isActive ? "Active" : "On Hold",
      }));

      setDepartments(normalized);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || "Error loading departments");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDepartments = departments.filter((dep) => {
    const matchesSearch =
      dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" ? true : dep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (department = null) => {
    if (department) {
      setEditingDept({ ...department });
    } else {
      setEditingDept({
        _id: null,
        id: "",
        name: "",
        code: "",
        head: "",
        employees: 0,
        status: "Active",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingDept(null);
    setShowModal(false);
  };

  // ✅ Create Department in backend (POST /api/departments)
  const handleSave = async () => {
    if (!editingDept?.name?.trim()) {
      alert("Department name is required");
      return;
    }

    try {
      setSaving(true);

      // This screen uses backend create only
      // If you also want edit, I’ll give PUT endpoint too
      if (!editingDept._id) {
        const payload = {
          name: editingDept.name.trim(),
          code: (editingDept.code || "").trim(),
          // OPTIONAL: If your backend doesn’t support these, remove them
          description: "",
        };

        const { data } = await axiosAuth.post("/api/departments", payload);

        if (!data?.success) throw new Error(data?.error || "Failed to create department");

        const d = data.department;

        const newDept = {
          _id: d._id,
          id: d.code || `DEP-${String(departments.length + 1).padStart(3, "0")}`,
          name: d.name || payload.name,
          code: d.code || payload.code || "",
          head: "—",
          employees: 0,
          status: d.isActive ? "Active" : "Active",
        };

        setDepartments((prev) => [newDept, ...prev]);
      } else {
        // Local update only (backend edit not implemented yet)
        setDepartments((prev) => prev.map((x) => (x._id === editingDept._id ? editingDept : x)));
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || "Error saving department");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete (UI delete). If you want real backend delete, see below.
  const handleDelete = async (dept) => {
    const ok = window.confirm(`Delete department "${dept.name}"?`);
    if (!ok) return;

    try {
      // If you add backend delete endpoint, enable this:
      // await axiosAuth.delete(`/api/departments/${dept._id}`);

      // For now: remove from UI
      setDepartments((prev) => prev.filter((d) => d._id !== dept._id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || "Error deleting department");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-h-screen w-full px-4 md:px-8 py-6 md:py-8 ${bgMain}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={() => navigate("/admindashboard")} />
            <Building2 className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-semibold">Manage Departments</h1>
          </div>
          <p className={`text-xs ${subText}`}>
            Create, update and maintain all departments (backend connected).
          </p>
        </div>

        <button
          onClick={() => openModal(null)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className={`border rounded-2xl shadow-sm p-4 mb-6 ${cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white"
              }`}
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className={`px-3 py-2 rounded-lg border ${
                darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white"
              }`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}>
        <div className="border-b px-5 py-3 text-xs uppercase tracking-wide flex items-center justify-between">
          <span>{filteredDepartments.length} Departments</span>
          <button
            onClick={fetchDepartments}
            className="text-xs px-3 py-1 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition"
          >
            Refresh
          </button>
        </div>

        {loadingList ? (
          <div className="px-5 py-10 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span className={`text-sm ${subText}`}>Loading departments…</span>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className={`text-sm ${subText}`}>No departments found.</p>
          </div>
        ) : (
          filteredDepartments.map((dep, index) => (
            <motion.div
              key={dep._id || dep.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="px-5 py-4 flex flex-col md:flex-row items-center justify-between border-b"
            >
              <div>
                <h3 className="font-semibold text-sm">{dep.name}</h3>
                <p className={`text-xs mt-0.5 ${subText}`}>
                  Code: {dep.code || "—"} • Head: {dep.head || "—"} • Status: {dep.status}
                </p>
              </div>

              <div className="text-xs md:text-sm mt-2 md:mt-0">
                Employees:{" "}
                <span className="font-semibold text-emerald-400">{dep.employees}</span>
              </div>

              <div className="flex items-center gap-3 mt-2 md:mt-0">
                <button
                  onClick={() => openModal(dep)}
                  className="p-2 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition"
                  title="Edit (local only unless you add PUT endpoint)"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(dep)}
                  className="p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && editingDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-xl shadow-lg w-full max-w-md ${
              darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingDept?._id ? "Edit Department" : "Add Department"}
              </h3>
              <button onClick={closeModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? "border-slate-700 bg-slate-950 text-white" : "border-slate-200 bg-white"
                }`}
                placeholder="Department Name"
                value={editingDept.name}
                onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
              />

              <input
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? "border-slate-700 bg-slate-950 text-white" : "border-slate-200 bg-white"
                }`}
                placeholder="Code (optional e.g. HR, IT)"
                value={editingDept.code}
                onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value })}
              />

              <select
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode ? "border-slate-700 bg-slate-950 text-white" : "border-slate-200 bg-white"
                }`}
                value={editingDept.status}
                onChange={(e) => setEditingDept({ ...editingDept, status: e.target.value })}
              >
                <option>Active</option>
                <option>On Hold</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDepartment;
