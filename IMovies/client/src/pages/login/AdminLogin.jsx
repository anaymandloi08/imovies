import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FaShieldAlt } from "react-icons/fa";
import { render } from "../../host";
import "./style.scss";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${render}/api/auth/admin/login`, formData, { timeout: 3000 });
      if (res.data.success) {
        Cookies.set("adminToken", res.data.authToken, { expires: 7 });
        localStorage.setItem("adminToken", res.data.authToken);
        localStorage.setItem("imovies_admin", JSON.stringify(res.data.admin));

        toast.success(res.data.message || "Admin login successful!");
        navigate("/admin");
        return;
      }
    } catch (err) {
      // Offline / Live Demo Fallback
      const savedAdmins = JSON.parse(localStorage.getItem("imovies_local_admins") || "[]");
      const matched = savedAdmins.find(
        (a) => a.email === formData.email && a.password === formData.password
      ) || (formData.email === "admin@imovies.com" && formData.password === "admin123"
        ? { username: "admin", email: "admin@imovies.com", role: "admin" }
        : null);

      if (matched) {
        const dummyToken = "demo-jwt-admin-" + Date.now();
        Cookies.set("adminToken", dummyToken, { expires: 7 });
        localStorage.setItem("adminToken", dummyToken);
        localStorage.setItem("imovies_admin", JSON.stringify(matched));

        toast.success("Admin portal unlocked!");
        navigate("/admin");
        return;
      }
      toast.error(err?.response?.data?.error || "Invalid administrator credentials. Use admin@imovies.com / admin123");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPageContainer">
      <div className="authCard adminCard">
        <div className="brandHeader">
          <div className="adminBadgeTag">
            <FaShieldAlt /> System Administrator
          </div>
          <Link to="/" className="brandLink">
            <span className="brandI">i</span>
            <span className="brandMovies">Movies</span>
          </Link>
          <h2>Admin Control Center</h2>
          <p>Sign in to manage movies, theatres, and bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          <div className="formGroup">
            <label>Admin Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@imovies.com"
              required
            />
          </div>

          <div className="formGroup">
            <label>Master Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? "Authenticating..." : "Access Control Panel"}
          </button>
        </form>

        <div className="authFooter">
          <p>
            Need an admin account? <Link to="/admin/register">Register Admin</Link>
          </p>
          <p className="adminPrompt">
            Regular User? <Link to="/login">User Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
