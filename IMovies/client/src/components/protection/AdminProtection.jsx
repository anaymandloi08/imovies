import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const AdminProtection = () => {
  const adminToken =
    Cookies.get("adminToken") ||
    localStorage.getItem("adminToken") ||
    Cookies.get("token") ||
    localStorage.getItem("token");

  const adminUser = localStorage.getItem("imovies_admin");

  if (!adminToken && !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtection;
