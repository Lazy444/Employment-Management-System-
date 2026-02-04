import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || "").toLowerCase().trim();

  // wrong role
  if (allowRoles.length > 0 && !allowRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
