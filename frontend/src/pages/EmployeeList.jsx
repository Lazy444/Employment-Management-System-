// src/pages/EmployeeList.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  BadgeCheck,
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
  ClipboardPlus,
  FileText,
  Flag,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Grid3x3,
  List,
  Heart,
  Award,
  RefreshCw,
  Banknote,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

const emptyForm = {
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
  hourlyRate: "",
  monthlySalary: "",
  imageFile: null,
  imagePreview: "",
};

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
  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-5 ${darkMode ? "border-slate-700 bg-slate-950/40" : "border-slate-200 bg-slate-50/50"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Profile Photo</p>
              <p className={`text-xs ${subText}`}>JPG, PNG, or WEBP (Max 5MB)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(form.imagePreview || form.imageFile) && (
              <button type="button" onClick={clearPickedImage} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${darkMode ? "bg-slate-900 border border-slate-700 text-white" : "bg-white border border-slate-200 text-slate-700"}`}>
                <X className="w-4 h-4 text-rose-400" />
                Remove
              </button>
            )}

            <label className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${darkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-500 text-white"}`}>
              <Plus className="w-4 h-4" />
              Upload Image
              <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            </label>
          </div>
        </div>

        {form.imagePreview && (
          <div className="mt-4 relative overflow-hidden rounded-2xl">
            <img src={resolveImageUrl(form.imagePreview)} alt="Preview" className="h-48 w-full object-cover" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name *" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />
        <Field label="Email Address *" type="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{mode === "edit" ? "New Password" : "Password *"}</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className={`w-full pl-10 pr-3 py-2.5 border rounded-xl outline-none ${inputTheme}`} type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder={mode === "edit" ? "Leave blank to keep current" : "Minimum 6 characters"} />
          </div>
        </div>

        <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />
      </div>

      <Divider darkMode={darkMode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Employee ID" value={form.employeeId} onChange={(v) => setForm((p) => ({ ...p, employeeId: v }))} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />
        <Field label="Date of Birth" type="date" value={form.dob} onChange={(v) => setForm((p) => ({ ...p, dob: v }))} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />

        <SelectField label="Gender" value={form.gender} onChange={(v) => setForm((p) => ({ ...p, gender: v }))} options={["Male", "Female", "Other"]} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />
        <SelectField label="Marital Status" value={form.maritalStatus} onChange={(v) => setForm((p) => ({ ...p, maritalStatus: v }))} options={["Single", "Married", "Divorced", "Widowed"]} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />
      </div>

      <Divider darkMode={darkMode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>Department *</label>
          <select className={`${inputBase} ${inputTheme}`} value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}>
            <option value="">{loadingDepartments ? "Loading departments..." : "Select department"}</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <SelectField label="Role" value={form.role} onChange={(v) => setForm((p) => ({ ...p, role: v }))} options={["employee", "hr", "admin"]} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />

        <SelectField label="Employment Status" value={form.status} onChange={(v) => setForm((p) => ({ ...p, status: v }))} options={["Active", "On Leave", "Inactive"]} inputBase={inputBase} inputTheme={inputTheme} darkMode={darkMode} />
      </div>

      <Divider darkMode={darkMode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Field
  label="Hourly Rate *"
  type="number"
  value={form.hourlyRate}
  onChange={(v) => {
    const hourly = Number(v || 0);
    const monthly = hourly * 8 * 26;

    setForm((p) => ({
      ...p,
      hourlyRate: v,
      monthlySalary: monthly ? String(monthly) : "",
    }));
  }}
  inputBase={inputBase}
  inputTheme={inputTheme}
  darkMode={darkMode}
  icon
/>

     <Field
  label="Monthly Salary"
  type="number"
  value={form.monthlySalary}
  onChange={(v) =>
    setForm((p) => ({
      ...p,
      monthlySalary: v,
    }))
  }
  inputBase={inputBase}
  inputTheme={inputTheme}
  darkMode={darkMode}
  icon
/>
      </div>
    </div>
  );
});

function Field({ label, value, onChange, inputBase, inputTheme, darkMode, type = "text", icon = false }) {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"} flex items-center gap-2`}>
        {icon && <Banknote className="w-4 h-4 text-emerald-500" />}
        {label}
      </label>
      <input type={type} min={type === "number" ? "0" : undefined} className={`${inputBase} ${inputTheme}`} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, inputBase, inputTheme, darkMode }) {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{label}</label>
      <select className={`${inputBase} ${inputTheme}`} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Divider({ darkMode }) {
  return <div className={`${darkMode ? "border-slate-800" : "border-slate-200"} border-t pt-4`} />;
}

const EmployeeList = () => {
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;
  const navigate = useNavigate();

  const bgMain = darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-100 via-white to-slate-50";
  const cardBg = darkMode ? "bg-slate-900/80 backdrop-blur-sm border-slate-800" : "bg-white/80 backdrop-blur-sm border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";
  const textColor = darkMode ? "text-white" : "text-slate-900";
  const borderColor = darkMode ? "border-slate-800" : "border-slate-200";

  const inputBase = "w-full px-4 py-2.5 border rounded-xl outline-none transition";
  const inputTheme = darkMode
    ? "border-slate-700 bg-slate-950 !text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
    : "border-slate-200 bg-white !text-slate-900 placeholder:text-slate-400 focus:border-emerald-600/60 focus:ring-2 focus:ring-emerald-500/20";

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [taskEmployee, setTaskEmployee] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium" });

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [updatingEmployee, setUpdatingEmployee] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const resolveImageUrl = useCallback((maybeUrl) => {
    if (!maybeUrl) return "";
    const url = String(maybeUrl);
    if (url.startsWith("blob:")) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return `${API_BASE}/${url}`;
  }, []);

  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!(options.body instanceof FormData) && options.method && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
    return data;
  }, []);

  const resetForm = () => setForm(emptyForm);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoadingDepartments(true);
      const data = await fetchWithAuth("/api/departments", { method: "GET" });
      setDepartments(data.departments || []);
    } catch (err) {
      toast.error(err.message || "Error loading departments");
    } finally {
      setLoadingDepartments(false);
    }
  }, [fetchWithAuth]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const data = await fetchWithAuth("/api/admin/employees", { method: "GET" });

      const normalized = (data.employees || []).map((u, idx) => ({
        _id: u._id,
        id: u.empCode || u.employeeId || `EMP-${String(idx + 1).padStart(3, "0")}`,
        empCode: u.empCode || "",
        employeeId: u.employeeId || u.empCode || "",
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "—",
        department: u.departmentName || u.department?.name || "—",
        departmentId: u.department?._id || u.departmentId || "",
        role: u.role || "employee",
        status: u.status || "Active",
        maritalStatus: u.maritalStatus || "—",
        dob: u.dob || "",
        gender: u.gender || "—",
        hourlyRate: Number(u.hourlyRate || 0),
        monthlySalary: Number(u.monthlySalary || 0),
        imageUrl: resolveImageUrl(u.imageUrl || u.profileImage || u.image || ""),
      }));

      setEmployees(normalized);
    } catch (err) {
      toast.error(err.message || "Error loading employees");
    } finally {
      setLoadingEmployees(false);
    }
  }, [fetchWithAuth, resolveImageUrl]);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [fetchDepartments, fetchEmployees]);

  const validateEmployee = (isEdit = false) => {
    if (!form.name.trim()) return toast.error("Name is required.");
    if (!form.email.trim()) return toast.error("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return toast.error("Enter a valid email.");
    if (!isEdit && (!form.password || form.password.length < 6)) return toast.error("Password must be at least 6 characters.");
    if (isEdit && form.password && form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (!form.departmentId) return toast.error("Please select a department.");
    if (form.hourlyRate === "" || Number(form.hourlyRate) < 0) return toast.error("Hourly rate is required.");
    if (form.monthlySalary !== "" && Number(form.monthlySalary) < 0) return toast.error("Monthly salary cannot be negative.");
    return true;
  };

  const buildEmployeeFormData = () => {
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
    fd.append("hourlyRate", form.hourlyRate || 0);
    fd.append("monthlySalary", form.monthlySalary || 0);
    if (form.password) fd.append("password", form.password);
    if (form.imageFile) fd.append("image", form.imageFile);
    return fd;
  };

  const createEmployee = async () => {
    if (!validateEmployee(false)) return;
    try {
      setSavingEmployee(true);
      const data = await fetchWithAuth("/api/admin/employees", {
        method: "POST",
        body: buildEmployeeFormData(),
      });
      if (!data?.success) throw new Error(data?.error || "Failed to create employee");
      setShowCreate(false);
      resetForm();
      await fetchEmployees();
      toast.success("Employee created successfully!");
    } catch (err) {
      toast.error(err.message || "Error creating employee");
    } finally {
      setSavingEmployee(false);
    }
  };

  const updateEmployee = async () => {
    if (!selectedEmployee?._id) return toast.error("Employee not selected.");
    if (!validateEmployee(true)) return;

    try {
      setUpdatingEmployee(true);
      const data = await fetchWithAuth(`/api/admin/employees/${selectedEmployee._id}`, {
        method: "PUT",
        body: buildEmployeeFormData(),
      });
      if (!data?.success) throw new Error(data?.error || "Failed to update employee");
      setShowEdit(false);
      resetForm();
      await fetchEmployees();
      toast.success("Employee updated successfully!");
    } catch (err) {
      toast.error(err.message || "Error updating employee");
    } finally {
      setUpdatingEmployee(false);
    }
  };

  const deleteEmployee = async () => {
    if (!selectedEmployee?._id) return toast.error("Employee not selected.");
    try {
      setDeletingEmployee(true);
      const data = await fetchWithAuth(`/api/admin/employees/${selectedEmployee._id}`, { method: "DELETE" });
      if (!data?.success) throw new Error(data?.error || "Failed to delete employee");
      setShowDelete(false);
      await fetchEmployees();
      toast.success("Employee deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Error deleting employee");
    } finally {
      setDeletingEmployee(false);
    }
  };

  const assignTask = async () => {
    if (!taskEmployee?._id) return toast.error("Employee not selected.");
    if (!taskForm.title.trim()) return toast.error("Task title is required.");

    try {
      setSavingTask(true);
      const data = await fetchWithAuth("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          priority: taskForm.priority,
          assignedTo: taskEmployee._id,
        }),
      });
      if (!data?.success) throw new Error(data?.error || "Failed to assign task");
      setShowTaskModal(false);
      toast.success(`Task assigned to ${taskEmployee.name} successfully!`);
    } catch (err) {
      toast.error(err.message || "Error assigning task");
    } finally {
      setSavingTask(false);
    }
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Please upload JPG, PNG, or WEBP image.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image size should be less than 5MB");
    setForm((p) => ({ ...p, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  };

  const clearPickedImage = () => setForm((p) => ({ ...p, imageFile: null, imagePreview: "" }));

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (emp) => {
    setSelectedEmployee(emp);
    setForm({
      ...emptyForm,
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone === "—" ? "" : emp.phone || "",
      departmentId: emp.departmentId || "",
      status: emp.status || "Active",
      role: emp.role || "employee",
      employeeId: emp.employeeId || emp.id || "",
      maritalStatus: emp.maritalStatus !== "—" ? emp.maritalStatus : "Single",
      dob: emp.dob ? String(emp.dob).slice(0, 10) : "",
      gender: emp.gender !== "—" ? emp.gender : "Male",
      hourlyRate: String(emp.hourlyRate || ""),
      monthlySalary: String(emp.monthlySalary || ""),
      imagePreview: emp.imageUrl || "",
    });
    setShowEdit(true);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = emp.name.toLowerCase().includes(s) || emp.email.toLowerCase().includes(s) || String(emp.employeeId).toLowerCase().includes(s);
      const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
      const matchesRole = roleFilter === "All" || emp.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [employees, searchTerm, statusFilter, roleFilter]);

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    onLeave: employees.filter((e) => e.status === "On Leave").length,
    inactive: employees.filter((e) => e.status === "Inactive").length,
    admins: employees.filter((e) => e.role === "admin").length,
    hr: employees.filter((e) => e.role === "hr").length,
  };

  const statusChipClasses = (status) => {
    if (status === "Active") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/40";
    if (status === "On Leave") return "bg-sky-500/10 text-sky-500 border-sky-500/40";
    return "bg-rose-500/10 text-rose-500 border-rose-500/40";
  };

  const EmployeeCard = ({ emp }) => (
    <div className={`rounded-xl border ${cardBg} p-5`}>
      <div className="flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-emerald-500/30 flex items-center justify-center">
          {emp.imageUrl ? <img src={emp.imageUrl} alt={emp.name} className="h-full w-full object-cover" /> : <UserCircle2 className="w-12 h-12 text-emerald-500" />}
        </div>
        <h3 className={`mt-4 font-semibold text-lg ${textColor}`}>{emp.name}</h3>
        <p className={`text-xs ${subText}`}>{emp.email}</p>
        <p className={`text-xs ${subText} mt-1`}>ID: {emp.employeeId || emp.id}</p>
      </div>

      <div className={`mt-4 pt-4 border-t ${borderColor} text-sm space-y-2`}>
        <p className={subText}>Department: {emp.department}</p>
        <p className={subText}>Phone: {emp.phone}</p>
        <p className={subText}>Hourly Rate: Rs. {Number(emp.hourlyRate || 0).toLocaleString()}/hr</p>
        <p className={subText}>Monthly Salary: Rs. {Number(emp.monthlySalary || 0).toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button onClick={() => { setTaskEmployee(emp); setShowTaskModal(true); }} className="flex-1 px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-600">Task</button>
        <button onClick={() => { setSelectedEmployee(emp); setShowView(true); }} className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600"><Eye className="w-4 h-4" /></button>
        <button onClick={() => openEdit(emp)} className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => { setSelectedEmployee(emp); setShowDelete(true); }} className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-600"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className={`rounded-xl border ${cardBg} p-5`}>
      <p className={`text-xs uppercase ${subText}`}>{label}</p>
      <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
    </div>
  );

  const formProps = {
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
  };

  return (
    <div className={`min-h-screen w-full px-4 md:px-8 py-6 md:py-8 ${bgMain}`}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admindashboard")} className={`p-2 rounded-xl ${darkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-200 text-slate-700"}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textColor}`}>Employee Management</h1>
              <p className={`text-sm ${subText}`}>Manage employees and salary details</p>
            </div>
          </div>

          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl">
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <StatCard icon={Users} label="Total" value={stats.total} />
          <StatCard icon={CheckCircle} label="Active" value={stats.active} />
          <StatCard icon={Clock} label="On Leave" value={stats.onLeave} />
          <StatCard icon={AlertCircle} label="Inactive" value={stats.inactive} />
          <StatCard icon={ShieldCheck} label="Admins" value={stats.admins} />
          <StatCard icon={BadgeCheck} label="HR" value={stats.hr} />
        </div>
      </div>

      <div className={`rounded-xl border ${cardBg} p-5 mb-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <input className={`flex-1 px-4 py-2.5 rounded-lg border ${borderColor} ${darkMode ? "bg-slate-900/50 text-white" : "bg-white text-slate-900"}`} placeholder="Search by name, email, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className={`${inputBase} ${inputTheme} lg:w-48`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
          <select className={`${inputBase} ${inputTheme} lg:w-48`} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option>All</option>
            <option>employee</option>
            <option>hr</option>
            <option>admin</option>
          </select>
          <button onClick={fetchEmployees} className={`px-4 py-2.5 rounded-lg border ${borderColor} ${textColor}`}>
            <RefreshCw className={`w-4 h-4 ${loadingEmployees ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className={`rounded-xl border ${cardBg} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${borderColor}`}>
          <span className={`text-sm ${subText}`}>Showing {filteredEmployees.length} of {employees.length} employees</span>
        </div>

        {loadingEmployees ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEmployees.map((emp) => <EmployeeCard key={emp._id} emp={emp} />)}
          </div>
        )}
      </div>

      <EmployeeModal show={showCreate} title="Add New Employee" darkMode={darkMode} textColor={textColor} borderColor={borderColor} onClose={() => { setShowCreate(false); resetForm(); }} onSave={createEmployee} saving={savingEmployee} saveText="Create Employee">
        <EmployeeFormBody mode="create" {...formProps} />
      </EmployeeModal>

      <EmployeeModal show={showEdit && selectedEmployee} title="Edit Employee" darkMode={darkMode} textColor={textColor} borderColor={borderColor} onClose={() => { setShowEdit(false); resetForm(); }} onSave={updateEmployee} saving={updatingEmployee} saveText="Update Employee">
        <EmployeeFormBody mode="edit" {...formProps} />
      </EmployeeModal>

      <EmployeeModal show={showDelete && selectedEmployee} title="Delete Employee" darkMode={darkMode} textColor={textColor} borderColor={borderColor} onClose={() => setShowDelete(false)} onSave={deleteEmployee} saving={deletingEmployee} saveText="Delete">
        <p className={subText}>Are you sure you want to delete <b>{selectedEmployee?.name}</b>?</p>
      </EmployeeModal>

      <EmployeeModal show={showView && selectedEmployee} title="Employee Details" darkMode={darkMode} textColor={textColor} borderColor={borderColor} onClose={() => setShowView(false)} hideSave>
        <div className="space-y-2">
          <p>Name: {selectedEmployee?.name}</p>
          <p>Email: {selectedEmployee?.email}</p>
          <p>Department: {selectedEmployee?.department}</p>
          <p>Hourly Rate: Rs. {Number(selectedEmployee?.hourlyRate || 0).toLocaleString()}/hr</p>
          <p>Monthly Salary: Rs. {Number(selectedEmployee?.monthlySalary || 0).toLocaleString()}</p>
        </div>
      </EmployeeModal>

      <EmployeeModal show={showTaskModal && taskEmployee} title="Assign Task" darkMode={darkMode} textColor={textColor} borderColor={borderColor} onClose={() => setShowTaskModal(false)} onSave={assignTask} saving={savingTask} saveText="Assign Task">
        <div className="space-y-4">
          <input className={`${inputBase} ${inputTheme}`} placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} />
          <textarea className={`${inputBase} ${inputTheme}`} rows={4} placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} />
          <select className={`${inputBase} ${inputTheme}`} value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </EmployeeModal>
    </div>
  );
};

function EmployeeModal({ show, title, children, darkMode, textColor, borderColor, onClose, onSave, saving, saveText, hideSave }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 ${darkMode ? "bg-slate-900" : "bg-white"}`}>
            <div className={`px-6 py-5 border-b ${borderColor} flex items-center justify-between`}>
              <h3 className={`text-xl font-bold ${textColor}`}>{title}</h3>
              <button onClick={onClose}><X className="w-5 h-5" /></button>
            </div>

            <div className={`max-h-[70vh] overflow-y-auto px-6 py-5 ${textColor}`}>
              {children}
            </div>

            {!hideSave && (
              <div className={`px-6 py-4 border-t flex gap-3 ${borderColor}`}>
                <button onClick={onClose} className={`flex-1 px-4 py-2.5 rounded-xl border ${borderColor} ${textColor}`}>Cancel</button>
                <button onClick={onSave} disabled={saving} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : saveText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default EmployeeList;