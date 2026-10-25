import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const UserProtection = () => {
  const token = Cookies.get("token") || localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default UserProtection;
