// src/pages/EmployeeList.jsx  (or src/pages/admin/EmployeeList.jsx)
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext"; // adjust path if needed
import { Navigate, useNavigate } from "react-router-dom";

// demo data – later replace with API data
const MOCK_EMPLOYEES = [
  {
    id: "EMP001",
    name: "Asif Khan",
    email: "asif.khan@example.com",
    phone: "+61 400 000 001",
    department: "Database",
    role: "employee",
    status: "Active",
  },
  {
    id: "EMP002",
    name: "Ria Sharma",
    email: "ria.sharma@example.com",
    phone: "+61 400 000 002",
    department: "HR",
    role: "employee",
    status: "On Leave",
  },
  {
    id: "EMP003",
    name: "Sohan Koirala",
    email: "sohan.k@example.com",
    phone: "+61 400 000 003",
    department: "IT",
    role: "employee",
    status: "Active",
  },
  {
    id: "EMP004",
    name: "Adarsh Sapkota",
    email: "adarsh.s@example.com",
    phone: "+61 400 000 004",
    department: "Operations",
    role: "employee",
    status: "Inactive",
  },
];

const EmployeeList = () => {
  const theme = useTheme?.();
  const darkMode = theme?.darkMode ?? false;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const bgMain = darkMode ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-900";
  const cardBg = darkMode
    ? "bg-slate-900/80 border-slate-800"
    : "bg-white border-slate-200";
  const subText = darkMode ? "text-slate-400" : "text-slate-600";

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : emp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const statusChipClasses = (status) => {
    if (status === "Active")
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/40";
    if (status === "On Leave")
      return "bg-sky-500/10 text-sky-500 border-sky-500/40";
    return "bg-rose-500/10 text-rose-500 border-rose-500/40";
  };
const navigate = useNavigate();
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
               <ArrowLeft
  className="w-5 h-5 cursor-pointer"
  onClick={() => navigate("/admindashboard")}
/>
            <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
         
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              Employee Profiles
            </h1>
          </div>
          <p className={`text-xs md:text-sm ${subText}`}>
            View and manage all employee profiles in the system.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`mb-5 md:mb-6 rounded-2xl border shadow-sm px-4 py-3.5 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${cardBg}`}
      >
        {/* Search */}
        <div className="flex-1 flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full md:w-80 ${
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

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className={subText}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 text-xs md:text-sm outline-none ${
              darkMode
                ? "border-slate-700 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-800"
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
          <span className="text-xs md:text-sm font-medium uppercase tracking-[0.18em]">
            Employee List
          </span>
          <span className={`text-[11px] md:text-xs ${subText}`}>
            {filteredEmployees.length} employee
            {filteredEmployees.length !== 1 && "s"}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredEmployees.map((emp, index) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * index }}
              className="px-4 py-3.5 md:px-5 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              {/* Left: name + id + dept */}
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                  <UserCircle2 className="w-4 h-4 text-emerald-500" />
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
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11px]">
                    <span className={subText}>ID: {emp.id}</span>
                    <span className={`flex items-center gap-1 ${subText}`}>
                      <Building2 className="w-3 h-3" />
                      {emp.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: contact */}
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

              {/* Right: status */}
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
              </div>
            </motion.div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="px-5 py-10 text-center text-xs md:text-sm text-slate-400">
              No employees match your filters.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeList;