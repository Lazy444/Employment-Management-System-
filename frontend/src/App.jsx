// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeList from "./pages/EmployeeList";
import AdminDepartment from "./pages/AdminDepartment";
import AdminSettings from "./pages/AdminSetting";
import AdminSalary from "./pages/AdminSalary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<Navigate to="/login" replace />} />

        
        <Route path="/login" element={<Login />} />

       
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<EmployeeList />} />
        <Route path="/admin/departments" element={<AdminDepartment />} />
        <Route path="/employeedashboard" element={<EmployeeDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/salary" element={<AdminSalary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;