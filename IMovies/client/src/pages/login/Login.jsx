import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { render } from "../../host";
import "./style.scss";

const Login = () => {
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
      const res = await axios.post(`${render}/api/auth/login`, formData);
      if (res.data.success) {
        // Save token to cookies and localStorage
        Cookies.set("token", res.data.authToken, { expires: 7 });
        localStorage.setItem("token", res.data.authToken);
        localStorage.setItem("imovies_user", JSON.stringify(res.data.user));

        toast.success(res.data.message || "Logged in successfully!");
        navigate("/home");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPageContainer">
      <div className="authCard">
        <div className="brandHeader">
          <Link to="/" className="brandLink">
            <span className="brandI">i</span>
            <span className="brandMovies">Movies</span>
          </Link>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to book tickets</p>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          <div className="formGroup">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="formGroup">
            <label>Password</label>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="authFooter">
          <p>
            New to iMovies? <Link to="/register">Create an account</Link>
          </p>
          <p className="adminPrompt">
            Administrator? <Link to="/admin/login">Admin Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
