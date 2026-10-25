import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FaShieldAlt } from "react-icons/fa";
import { render } from "../../host";
import "../login/style.scss";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${render}/api/auth/admin/register`, formData);
      if (res.data.success) {
        Cookies.set("adminToken", res.data.authToken, { expires: 7 });
        localStorage.setItem("adminToken", res.data.authToken);
        localStorage.setItem("imovies_admin", JSON.stringify(res.data.admin));

        toast.success(res.data.message || "Admin registered successfully!");
        navigate("/admin");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPageContainer">
      <div className="authCard adminCard">
        <div className="brandHeader">
          <div className="adminBadgeTag">
            <FaShieldAlt /> Administrator Onboarding
          </div>
          <Link to="/" className="brandLink">
            <span className="brandI">i</span>
            <span className="brandMovies">Movies</span>
          </Link>
          <h2>New Administrator</h2>
          <p>Register as a certified cinema administrator</p>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          <div className="formGroup">
            <label>Admin Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. admin_hq"
              required
            />
          </div>

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
            <label>Master Password (min. 8 characters)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? "Registering..." : "Create Admin Account"}
          </button>
        </form>

        <div className="authFooter">
          <p>
            Already an administrator? <Link to="/admin/login">Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
