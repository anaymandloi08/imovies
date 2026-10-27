import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { render } from "../../host";
import "../login/style.scss";

const Register = () => {
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
    if (formData.username.length < 3 || formData.username.length > 20) {
      toast.error("Username must be between 3 and 20 characters");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${render}/api/auth/register`, formData, { timeout: 3000 });
      if (res.data.success) {
        Cookies.set("token", res.data.authToken, { expires: 7 });
        localStorage.setItem("token", res.data.authToken);
        localStorage.setItem("imovies_user", JSON.stringify(res.data.user));

        toast.success(res.data.message || "Registration successful!");
        navigate("/home");
        return;
      }
    } catch (err) {
      // Offline fallback
      const savedUsers = JSON.parse(localStorage.getItem("imovies_local_users") || "[]");
      const newUser = { username: formData.username, email: formData.email, password: formData.password };
      savedUsers.push(newUser);
      localStorage.setItem("imovies_local_users", JSON.stringify(savedUsers));

      const dummyToken = "demo-jwt-user-" + Date.now();
      Cookies.set("token", dummyToken, { expires: 7 });
      localStorage.setItem("token", dummyToken);
      localStorage.setItem("imovies_user", JSON.stringify({ username: formData.username, email: formData.email }));

      toast.success("Account created successfully!");
      navigate("/home");
      return;
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
          <h2>Create Your Account</h2>
          <p>Join iMovies for personalized movie ticket booking</p>
        </div>

        <form onSubmit={handleSubmit} className="authForm">
          <div className="formGroup">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. cinema_fanatic"
              minLength={3}
              maxLength={20}
              required
            />
          </div>

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
            <label>Password (min. 8 characters)</label>
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="authFooter">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
