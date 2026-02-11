import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeProfile from "./pages/EmpoyeeProfile";
import EmployeeList from "./pages/EmployeeList";
import AdminDepartment from "./pages/AdminDepartment";
import AdminSettings from "./pages/AdminSetting";
import AdminSalary from "./pages/AdminSalary";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import AddNewLeave from "./pages/AddNewLeave";
import EmployeeSettings from "./pages/EmployeeSettings";
import EmployeeSalary from "./pages/EmployeeSalary";
import AdminLeaveRequests from "./pages/AdminLeaveRequests";
import PunchClock from "./pages/PunchClock";
import AdminAttendanceToday from "./pages/AdminAttendanceToday";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Admin Routes */}
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <AdminDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              < AdminLeaveRequests/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/salary"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <AdminSalary />
            </ProtectedRoute>
          
          }

        />
        <Route
          path="/admin/punch"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              < AdminAttendanceToday/>
            </ProtectedRoute>
          }
        />

        {/* ✅ Employee Routes */}
        <Route
          path="/employeeprofile"
          element={
            <ProtectedRoute allowRoles={["employee"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employeeleave"
          element={
            <ProtectedRoute allowRoles={["employee"]}>
              <EmployeeLeaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-new-leave"
          element={
            <ProtectedRoute allowRoles={["employee"]}>
              <AddNewLeave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employeesettings"
          element={
            <ProtectedRoute allowRoles={["employee"]}>
              <EmployeeSettings/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employeesalary"
          element={
            <ProtectedRoute allowRoles={["employee"]}>
              <EmployeeSalary/>
            </ProtectedRoute>
          }
        />

<Route path="/punch-clock" element={  
  <ProtectedRoute allowRoles={["employee"]}>
              <PunchClock/>
            </ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
