// src/pages/AdminDepartment.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Search,
  Filter,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

// Mock data for now – replace with API later
const INITIAL_DEPARTMENTS = [
  {
    id: "DEP001",
    name: "Human Resources",
    code: "HR",
    head: "Sadik Musalmane Jhatu Akbar",
    employees: 8,
    status: "Active",
  },
  {
    id: "DEP002",
    name: "Information Technology",
    code: "IT",
    head: "Sohan Koirala",
    employees: 12,
    status: "Active",
  },
  {
    id: "DEP003",
    name: "Operations",
    code: "OPS",
    head: "Adarsh Sapkota",
    employees: 10,
    status: "Active",
  },
  {
    id: "DEP004",
    name: "Finance",
    code: "FIN",
    head: "Anjali Basnet",
    employees: 6,
    status: "On Hold",
  },
];

const AdminDepartment = () => {
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;

  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const bgMain = darkMode
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";
  const cardBg = darkMode
    ? "bg-slate-900/80 border-slate-800"
    : "bg-white border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  const filteredDepartments = departments.filter((dep) => {
    const matchesSearch =
      dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ? true : dep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openModal = (department = null) => {
    setEditingDept(department);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingDept(null);
    setShowModal(false);
  };

  const handleSave = () => {
    if (editingDept.id) {
      // Updating existing
      setDepartments((prev) =>
        prev.map((d) => (d.id === editingDept.id ? editingDept : d))
      );
    } else {
      // Creating new
      setDepartments((prev) => [
        ...prev,
        { ...editingDept, id: `DEP00${prev.length + 1}` },
      ]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };
const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-h-screen w-full px-4 md:px-8 py-6 md:py-8 ${bgMain}`}
    >
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeft
  className="w-5 h-5 cursor-pointer"
  onClick={() => navigate("/admindashboard")}
/>

            <Building2 className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-semibold">Manage Departments</h1>
          </div>
          <p className={`text-xs ${subText}`}>
            Create, update and maintain all departments.
          </p>
        </div>

        <button
          onClick={() => openModal({ name: "", head: "", code: "", employees: 0, status: "Active" })}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* SEARCH + FILTER BAR */}
      <div
        className={`border rounded-2xl shadow-sm p-4 mb-6 ${cardBg}`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white"
              }`}
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white"
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

      {/* DEPARTMENT LIST */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}>
        <div className="border-b px-5 py-3 text-xs uppercase tracking-wide">
          {filteredDepartments.length} Departments
        </div>

        {filteredDepartments.map((dep, index) => (
          <motion.div
            key={dep.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="px-5 py-4 flex flex-col md:flex-row items-center justify-between border-b"
          >
            {/* Left side */}
            <div>
              <h3 className="font-semibold text-sm">{dep.name}</h3>
              <p className={`text-xs mt-0.5 ${subText}`}>
                Code: {dep.code} • Head: {dep.head}
              </p>
            </div>

            {/* Middle */}
            <div className="text-xs md:text-sm mt-2 md:mt-0">
              Employees:{" "}
              <span className="font-semibold text-emerald-400">{dep.employees}</span>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <button
                onClick={() => openModal(dep)}
                className="p-2 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(dep.id)}
                className="p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL (ADD / EDIT DEPARTMENT) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-xl shadow-lg w-full max-w-md ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingDept?.id ? "Edit Department" : "Add Department"}
              </h3>
              <button onClick={closeModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Inputs */}
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Department Name"
                value={editingDept.name}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, name: e.target.value })
                }
              />

              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Code (e.g. HR, IT)"
                value={editingDept.code}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, code: e.target.value })
                }
              />

              <input
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Department Head"
                value={editingDept.head}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, head: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Number of employees"
                value={editingDept.employees}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, employees: e.target.value })
                }
              />

              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={editingDept.status}
                onChange={(e) =>
                  setEditingDept({ ...editingDept, status: e.target.value })
                }
              >
                <option>Active</option>
                <option>On Hold</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDepartment;