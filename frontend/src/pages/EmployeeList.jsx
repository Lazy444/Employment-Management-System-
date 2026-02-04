// src/pages/EmployeeList.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  BadgeCheck,
  Mail,
  Phone,
  Building2,
  UserCircle2,
  ArrowLeft,
  Plus,
  X,
  Save,
  Loader2,
  KeyRound,
  Pencil,
  Trash2,
  Eye,
  ShieldCheck,
  Image as ImageIcon,
  BadgeInfo,
  User,
  Calendar,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

/**
 * EmployeeList (ADMIN)
 * - CRUD employees
 * - fields: image, employeeId, maritalStatus, dob, gender
 * - uses fetch()
 */

/* =========================================================
   ✅ EmployeeFormBody OUTSIDE EmployeeList
   (Fixes input losing focus / remount issue)
========================================================= */
const EmployeeFormBody = React.memo(function EmployeeFormBody({
  mode = "create",
  darkMode,
  subText,
  inputBase,
  inputTheme,
  loadingDepartments,
  departments,
  form,
  setForm,
  resolveImageUrl,
  handleImagePick,
  clearPickedImage,
}) {
  const isEdit = mode === "edit";

  return (
    <div className="space-y-4">
      {/* Profile Image */}
      <div
        className={`rounded-2xl border p-4 ${
          darkMode ? "border-slate-700 bg-slate-950/40" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <div>
              <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                Profile Photo
              </p>
              <p className={`text-[11px] ${subText}`}>Optional (JPG/PNG/WEBP)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(form.imagePreview || form.imageFile) && (
              <button
                type="button"
                onClick={clearPickedImage}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
                  darkMode
                    ? "bg-slate-900 border border-slate-700 hover:bg-slate-800"
                    : "bg-white border border-slate-200 hover:bg-slate-100"
                }`}
                title="Remove selected image"
              >
                <X className="w-4 h-4 text-rose-400" />
                Remove
              </button>
            )}

            <label
              className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
                darkMode
                  ? "bg-slate-900 border border-slate-700 hover:bg-slate-800"
                  : "bg-white border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              Choose Image
              <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            </label>
          </div>
        </div>

        <div className="mt-3">
          {form.imagePreview ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src={resolveImageUrl(form.imagePreview)}
                alt="Preview"
                className="h-44 w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/45 px-3 py-2 text-[11px] text-white">
                {isEdit ? "Current / New Preview" : "Preview"}
              </div>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 rounded-2xl border px-3 py-4 text-xs ${
                darkMode
                  ? "border-slate-700 bg-slate-900/40 text-slate-400"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              No image selected
            </div>
          )}
        </div>
      </div>

      {/* Basic identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={`text-xs ${subText}`}>Full Name</label>
          <input
            className={`${inputBase} ${inputTheme}`}
            placeholder="e.g., Sohan Koirala"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className={`text-xs ${subText}`}>Email</label>
          <input
            className={`${inputBase} ${inputTheme}`}
            placeholder="e.g., admin@ems.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={`text-xs ${subText}`}>{isEdit ? "New Password (optional)" : "Password"}</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className={`w-full pl-9 pr-3 py-2 border rounded-xl outline-none transition ${inputTheme}`}
              placeholder={isEdit ? "Leave blank to keep current" : "Min 6 characters"}
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
        </div>

        {/* ✅ PHONE FIXED (no focus loss, also cleans input) */}
        <div className="space-y-1">
          <label className={`text-xs ${subText}`}>Phone (optional)</label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={`${inputBase} ${inputTheme}`}
            placeholder="e.g., +977 98xxxxxxx"
            value={form.phone}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^\d+]/g, "");
              setForm((p) => ({ ...p, phone: cleaned }));
            }}
          />
        </div>
      </div>

      <div className={`${darkMode ? "border-slate-800" : "border-slate-200"} border-t pt-4`} />

      {/* Personal details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={`text-xs ${subText} flex items-center gap-1`}>
            <BadgeInfo className="w-4 h-4 text-emerald-500" /> Employee ID
          </label>
          <input
            className={`${inputBase} ${inputTheme}`}
            placeholder="e.g., EMP-001"
            value={form.employeeId}
            onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className={`text-xs ${subText} flex items-center gap-1`}>
            <Calendar className="w-4 h-4 text-emerald-500" /> Date of Birth
          </label>
          <input
            type="date"
            className={`${inputBase} ${inputTheme}`}
            value={form.dob}
            onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className={`text-xs ${subText} flex items-center gap-1`}>
            <User className="w-4 h-4 text-emerald-500" /> Gender
          </label>
          <select
            className={`${inputBase} ${inputTheme}`}
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className={`text-xs ${subText} flex items-center gap-1`}>
            <BadgeInfo className="w-4 h-4 text-emerald-500" /> Marital Status
          </label>
          <select
            className={`${inputBase} ${inputTheme}`}
            value={form.maritalStatus}
            onChange={(e) => setForm((p) => ({ ...p, maritalStatus: e.target.value }))}
          >
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widowed</option>
          </select>
        </div>
      </div>

      <div className={`${darkMode ? "border-slate-800" : "border-slate-200"} border-t pt-4`} />

      {/* Work details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={`text-xs ${subText}`}>Department</label>
          <select
            className={`${inputBase} ${inputTheme}`}
            value={form.departmentId}
            onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
          >
            <option value="">{loadingDepartments ? "Loading..." : "Select department"}</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={`text-xs ${subText}`}>Role</label>
          <select
            className={`${inputBase} ${inputTheme}`}
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="employee">employee</option>
            <option value="hr">hr</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className={`text-xs ${subText}`}>Status</label>
          <select
            className={`${inputBase} ${inputTheme}`}
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          >
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
});

const EmployeeList = () => {
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const navigate = useNavigate();

  // THEME CLASSES
  const bgMain = darkMode ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-900";
  const cardBg = darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  /**
   * If backend returns "/uploads/xxx.png",
   * we must render "http://localhost:5000/uploads/xxx.png"
   */
  const resolveImageUrl = useCallback((maybeUrl) => {
    if (!maybeUrl) return "";
    const url = String(maybeUrl);

    if (url.startsWith("blob:")) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return `${API_BASE}/${url}`;
  }, []);

  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    const t = localStorage.getItem("token");
    const headers = new Headers(options.headers || {});
    if (t) headers.set("Authorization", `Bearer ${t}`);

    const isFormData = options.body instanceof FormData;

    if (!isFormData) {
      if (!headers.has("Content-Type") && options.method && options.method !== "GET") {
        headers.set("Content-Type", "application/json");
      }
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    let data = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg = data?.error || data?.message || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }, []);

  // DATA LISTS
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI STATES
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [updatingEmployee, setUpdatingEmployee] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // FILTERS
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // MODALS
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // SELECTED EMPLOYEE
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // FORMS
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    departmentId: "",
    status: "Active",
    role: "employee",

    employeeId: "",
    maritalStatus: "Single",
    dob: "",
    gender: "Male",

    imageFile: null,
    imagePreview: "",
  });

  // UI HELPERS
  const statusChipClasses = (status) => {
    if (status === "Active") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/40";
    if (status === "On Leave") return "bg-sky-500/10 text-sky-500 border-sky-500/40";
    return "bg-rose-500/10 text-rose-500 border-rose-500/40";
  };

  const inputBase = `w-full px-3 py-2 border rounded-xl outline-none transition`;
  const inputTheme = darkMode
    ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-emerald-500/60"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-600/60";

  const btnPrimary =
    "w-full mt-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition";
  const btnGhost =
    "text-xs px-3 py-2 rounded-xl border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition";

  const prettyDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "—";
    }
  };

  const toDateInput = (value) => {
    if (!value) return "";
    try {
      return String(value).slice(0, 10);
    } catch {
      return "";
    }
  };

  const resetForm = () => {
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch {}
    }

    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      departmentId: "",
      status: "Active",
      role: "employee",

      employeeId: "",
      maritalStatus: "Single",
      dob: "",
      gender: "Male",

      imageFile: null,
      imagePreview: "",
    });
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Please upload JPG, PNG, or WEBP image.");
      return;
    }

    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch {}
    }

    const previewUrl = URL.createObjectURL(file);
    setForm((p) => ({
      ...p,
      imageFile: file,
      imagePreview: previewUrl,
    }));
  };

  const clearPickedImage = () => {
    if (form.imagePreview && form.imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(form.imagePreview);
      } catch {}
    }

    setForm((p) => ({
      ...p,
      imageFile: null,
      imagePreview: "",
    }));
  };

  // DATA FETCH
  const fetchDepartments = useCallback(async () => {
    try {
      setLoadingDepartments(true);
      const data = await fetchWithAuth("/api/departments", { method: "GET" });
      if (!data?.success) throw new Error(data?.error || "Failed to load departments");
      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Error loading departments");
    } finally {
      setLoadingDepartments(false);
    }
  }, [fetchWithAuth]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      setErrorMsg("");

      const data = await fetchWithAuth("/api/admin/employees", { method: "GET" });
      if (!data?.success) throw new Error(data?.error || "Failed to load employees");

      const normalized = (data.employees || []).map((u, idx) => {
        const rawImage = u.imageUrl || u.profileImage || u.image || "";
        return {
          _id: u._id,
          id: u.empCode || u.employeeId || `EMP-${String(idx + 1).padStart(3, "0")}`,
          empCode: u.empCode || "",
          employeeId: u.employeeId || u.empCode || "",
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "—",
          department: u.departmentName || (u.department?.name ?? "—"),
          departmentId: u.department?._id || u.departmentId || "",
          role: u.role || "employee",
          status: u.status || "Active",

          maritalStatus: u.maritalStatus || "—",
          dob: u.dob || "",
          gender: u.gender || "—",

          imageUrl: resolveImageUrl(rawImage),

          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      });

      setEmployees(normalized);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Error loading employees");
    } finally {
      setLoadingEmployees(false);
    }
  }, [fetchWithAuth, resolveImageUrl]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const s = searchTerm.toLowerCase();

      const matchesSearch =
        emp.name.toLowerCase().includes(s) ||
        emp.email.toLowerCase().includes(s) ||
        String(emp.id).toLowerCase().includes(s) ||
        String(emp.employeeId).toLowerCase().includes(s);

      const matchesStatus = statusFilter === "All" ? true : emp.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  // MODAL HELPERS
  const openCreate = () => {
    resetForm();
    setSelectedEmployee(null);
    setErrorMsg("");
    setShowCreate(true);
  };

  const closeCreate = () => {
    setShowCreate(false);
    setErrorMsg("");
    resetForm();
  };

  const openView = (emp) => {
    setSelectedEmployee(emp);
    setErrorMsg("");
    setShowView(true);
  };

  const closeView = () => {
    setShowView(false);
    setSelectedEmployee(null);
  };

  const openEdit = (emp) => {
    setSelectedEmployee(emp);
    setErrorMsg("");

    setForm({
      name: emp.name || "",
      email: emp.email || "",
      password: "",
      phone: emp.phone === "—" ? "" : emp.phone || "",
      departmentId: emp.departmentId || "",
      status: emp.status || "Active",
      role: emp.role || "employee",

      employeeId: emp.employeeId || emp.id || "",
      maritalStatus: emp.maritalStatus && emp.maritalStatus !== "—" ? emp.maritalStatus : "Single",
      dob: toDateInput(emp.dob),
      gender: emp.gender && emp.gender !== "—" ? emp.gender : "Male",

      imageFile: null,
      imagePreview: emp.imageUrl || "",
    });

    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setSelectedEmployee(null);
    resetForm();
    setErrorMsg("");
  };

  const openDelete = (emp) => {
    setSelectedEmployee(emp);
    setErrorMsg("");
    setShowDelete(true);
  };

  const closeDelete = () => {
    setShowDelete(false);
    setSelectedEmployee(null);
    setErrorMsg("");
  };

  // CREATE
  const createEmployee = async () => {
    if (!form.name.trim()) return setErrorMsg("Name is required.");
    if (!form.email.trim()) return setErrorMsg("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setErrorMsg("Enter a valid email.");
    if (!form.password || form.password.length < 6) return setErrorMsg("Password must be at least 6 chars.");
    if (!form.departmentId) return setErrorMsg("Please select a department.");

    try {
      setSavingEmployee(true);
      setErrorMsg("");

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("password", form.password);
      fd.append("departmentId", form.departmentId);
      fd.append("phone", form.phone?.trim() || "");
      fd.append("status", form.status || "Active");
      fd.append("role", form.role || "employee");

      fd.append("employeeId", form.employeeId?.trim() || "");
      fd.append("maritalStatus", form.maritalStatus || "Single");
      fd.append("dob", form.dob || "");
      fd.append("gender", form.gender || "Male");

      if (form.imageFile) fd.append("image", form.imageFile);

      const data = await fetchWithAuth("/api/admin/employees", {
        method: "POST",
        body: fd,
      });

      if (!data?.success) throw new Error(data?.error || "Failed to create employee");

      closeCreate();
      await fetchEmployees();
      alert("✅ Employee created successfully!");
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Error creating employee");
    } finally {
      setSavingEmployee(false);
    }
  };

  // UPDATE
  const updateEmployee = async () => {
    if (!selectedEmployee?._id) return setErrorMsg("Employee not selected.");

    if (!form.name.trim()) return setErrorMsg("Name is required.");
    if (!form.email.trim()) return setErrorMsg("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setErrorMsg("Enter a valid email.");
    if (!form.departmentId) return setErrorMsg("Please select a department.");
    if (form.password && form.password.length < 6) return setErrorMsg("Password must be at least 6 chars.");

    try {
      setUpdatingEmployee(true);
      setErrorMsg("");

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone?.trim() || "");
      fd.append("departmentId", form.departmentId);
      fd.append("status", form.status || "Active");
      fd.append("role", form.role || "employee");

      fd.append("employeeId", form.employeeId?.trim() || "");
      fd.append("maritalStatus", form.maritalStatus || "Single");
      fd.append("dob", form.dob || "");
      fd.append("gender", form.gender || "Male");

      if (form.password) fd.append("password", form.password);
      if (form.imageFile) fd.append("image", form.imageFile);

      const data = await fetchWithAuth(`/api/admin/employees/${selectedEmployee._id}`, {
        method: "PUT",
        body: fd,
      });

      if (!data?.success) throw new Error(data?.error || "Failed to update employee");

      closeEdit();
      await fetchEmployees();
      alert("✅ Employee updated successfully!");
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Error updating employee");
    } finally {
      setUpdatingEmployee(false);
    }
  };

  // DELETE
  const deleteEmployee = async () => {
    if (!selectedEmployee?._id) return setErrorMsg("Employee not selected.");

    try {
      setDeletingEmployee(true);
      setErrorMsg("");

      const data = await fetchWithAuth(`/api/admin/employees/${selectedEmployee._id}`, {
        method: "DELETE",
      });

      if (!data?.success) throw new Error(data?.error || "Failed to delete employee");

      closeDelete();
      await fetchEmployees();
      alert("🗑️ Employee deleted successfully!");
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Error deleting employee");
    } finally {
      setDeletingEmployee(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-h-screen w-full px-4 md:px-8 py-6 md:py-8 ${bgMain}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={() => navigate("/admindashboard")} />
            <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">Employee Profiles</h1>
          </div>
          <p className={`text-xs md:text-sm ${subText}`}>View and manage all employee profiles in the system.</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchEmployees} className={btnGhost}>
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {errorMsg}
        </div>
      ) : null}

      {/* Filters */}
      <div
        className={`mb-5 md:mb-6 rounded-2xl border shadow-sm px-4 py-3.5 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${cardBg}`}
      >
        <div className="flex-1 flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full md:w-96 ${
              darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
            }`}
          >
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or ID"
              className={`flex-1 text-xs md:text-sm bg-transparent outline-none ${
                darkMode ? "text-slate-100" : "text-slate-800"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className={subText}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 text-xs md:text-sm outline-none ${
              darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <option>All</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Employee list */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}>
        <div className="px-4 py-3 md:px-5 md:py-3.5 border-b border-slate-800/20 flex items-center justify-between">
          <span className="text-xs md:text-sm font-medium uppercase tracking-[0.18em]">Employee List</span>
          <span className={`text-[11px] md:text-xs ${subText}`}>
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 && "s"}
          </span>
        </div>

        {loadingEmployees ? (
          <div className="px-5 py-10 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span className={`text-sm ${subText}`}>Loading employees…</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEmployees.map((emp, index) => (
              <motion.div
                key={emp._id || emp.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * index }}
                className="px-4 py-3.5 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                {/* Left */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center overflow-hidden">
                    {emp.imageUrl ? (
                      <img src={emp.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{emp.name}</span>
                      {emp.role === "admin" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                          <BadgeCheck className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                      {emp.role === "hr" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/40 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                          <ShieldCheck className="w-3 h-3" />
                          HR
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11px]">
                      <span className={subText}>ID: {emp.employeeId || emp.id}</span>
                      <span className={`flex items-center gap-1 ${subText}`}>
                        <Building2 className="w-3 h-3" />
                        {emp.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle */}
                <div className="flex-1 flex flex-wrap gap-3 text-[11px] md:text-xs">
                  <span className={`inline-flex items-center gap-1.5 ${subText}`}>
                    <Mail className="w-3.5 h-3.5" />
                    {emp.email}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 ${subText}`}>
                    <Phone className="w-3.5 h-3.5" />
                    {emp.phone}
                  </span>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between md:justify-end gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${statusChipClasses(
                      emp.status
                    )}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        emp.status === "Active"
                          ? "bg-emerald-500"
                          : emp.status === "On Leave"
                          ? "bg-sky-500"
                          : "bg-rose-500"
                      }`}
                    />
                    {emp.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openView(emp)}
                      className={`p-2 rounded-xl border ${
                        darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                      } transition`}
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => openEdit(emp)}
                      className={`p-2 rounded-xl border ${
                        darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                      } transition`}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => openDelete(emp)}
                      className={`p-2 rounded-xl border ${
                        darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                      } transition`}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredEmployees.length === 0 && (
              <div className="px-5 py-10 text-center text-xs md:text-sm text-slate-400">No employees match your filters.</div>
            )}
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* CREATE EMPLOYEE MODAL     */}
      {/* ========================= */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className={`w-full max-w-2xl rounded-2xl p-6 shadow-xl ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Employee</h3>
                <button onClick={closeCreate}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <EmployeeFormBody
                mode="create"
                darkMode={darkMode}
                subText={subText}
                inputBase={inputBase}
                inputTheme={inputTheme}
                loadingDepartments={loadingDepartments}
                departments={departments}
                form={form}
                setForm={setForm}
                resolveImageUrl={resolveImageUrl}
                handleImagePick={handleImagePick}
                clearPickedImage={clearPickedImage}
              />

              <button onClick={createEmployee} disabled={savingEmployee} className={btnPrimary}>
                {savingEmployee ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingEmployee ? "Creating..." : "Create Employee"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================= */}
      {/* ✅ EDIT EMPLOYEE MODAL UI */}
      {/* ========================= */}
      <AnimatePresence>
        {showEdit && selectedEmployee && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={closeEdit}
            />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className={`w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden ${
                  darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className={`px-6 py-5 border-b ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                        {selectedEmployee.imageUrl ? (
                          <img src={selectedEmployee.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle2 className="w-7 h-7 text-emerald-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-semibold leading-tight truncate">Edit Employee</h3>

                        <p className={`text-xs mt-1 ${subText} truncate`}>
                          Editing: <span className="font-semibold">{selectedEmployee.name}</span> • Last updated{" "}
                          <span className="font-semibold">{prettyDate(selectedEmployee.updatedAt)}</span>
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${statusChipClasses(
                              selectedEmployee.status
                            )}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                selectedEmployee.status === "Active"
                                  ? "bg-emerald-500"
                                  : selectedEmployee.status === "On Leave"
                                  ? "bg-sky-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {selectedEmployee.status}
                          </span>

                          {selectedEmployee.role === "admin" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-[11px] font-medium text-emerald-400">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              Admin
                            </span>
                          )}

                          {selectedEmployee.role === "hr" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/40 px-3 py-1 text-[11px] font-medium text-sky-300">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              HR
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={closeEdit}
                      className={`p-2 rounded-xl border transition ${
                        darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                      }`}
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body (scrollable) */}
                <div className="max-h-[72vh] overflow-auto px-6 py-5">
                  <EmployeeFormBody
                    mode="edit"
                    darkMode={darkMode}
                    subText={subText}
                    inputBase={inputBase}
                    inputTheme={inputTheme}
                    loadingDepartments={loadingDepartments}
                    departments={departments}
                    form={form}
                    setForm={setForm}
                    resolveImageUrl={resolveImageUrl}
                    handleImagePick={handleImagePick}
                    clearPickedImage={clearPickedImage}
                  />
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex items-center justify-end gap-2 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                  <button
                    onClick={closeEdit}
                    className={`px-4 py-2 rounded-xl border transition ${
                      darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={updateEmployee}
                    disabled={updatingEmployee}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {updatingEmployee ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {updatingEmployee ? "Updating..." : "Update Employee"}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================= */}
      {/* VIEW EMPLOYEE MODAL       */}
      {/* ========================= */}
      <AnimatePresence>
        {showView && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-6 shadow-xl ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Employee Details</h3>
                <button onClick={closeView}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                  {selectedEmployee.imageUrl ? (
                    <img src={selectedEmployee.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle2 className="w-7 h-7 text-emerald-500" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-base font-semibold truncate">{selectedEmployee.name}</p>
                  <p className={`text-xs ${subText} truncate`}>{selectedEmployee.email}</p>
                  <div className={`mt-1 text-[11px] ${subText}`}>
                    ID: <span className="font-semibold">{selectedEmployee.employeeId || selectedEmployee.id}</span>
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? "border-slate-800" : "border-slate-200"} border-t my-4`} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-800 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`text-xs ${subText}`}>Department</p>
                  <p className="font-semibold">{selectedEmployee.department}</p>
                </div>

                <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-800 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`text-xs ${subText}`}>Role</p>
                  <p className="font-semibold">{selectedEmployee.role}</p>
                </div>

                <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-800 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`text-xs ${subText}`}>Phone</p>
                  <p className="font-semibold">{selectedEmployee.phone}</p>
                </div>

                <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-800 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`text-xs ${subText}`}>Status</p>
                  <p className="font-semibold">{selectedEmployee.status}</p>
                </div>

                <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-800 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`text-xs ${subText}`}>DOB</p>
                  <p className="font-semibold">{selectedEmployee.dob ? toDateInput(selectedEmployee.dob) : "—"}</p>
                </div>

                <div className={`rounded-xl border p-3 ${darkMode ? "border-slate-800 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`text-xs ${subText}`}>Gender / Marital</p>
                  <p className="font-semibold">
                    {selectedEmployee.gender || "—"} / {selectedEmployee.maritalStatus || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    closeView();
                    openEdit(selectedEmployee);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={closeView}
                  className={`flex-1 py-2.5 rounded-xl border ${
                    darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================= */}
      {/* DELETE EMPLOYEE MODAL     */}
      {/* ========================= */}
      <AnimatePresence>
        {showDelete && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Delete Employee</h3>
                <button onClick={closeDelete}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className={`text-sm ${subText}`}>
                Are you sure you want to delete <span className="font-semibold">{selectedEmployee.name}</span>? This action cannot be undone.
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={closeDelete}
                  className={`flex-1 py-2 rounded-xl border ${
                    darkMode ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteEmployee}
                  disabled={deletingEmployee}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {deletingEmployee ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deletingEmployee ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmployeeList;
