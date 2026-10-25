import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { render } from "../../host";
import "../login/style.scss";

const EditUserDetails = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem("imovies_user");
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        setFormData((prev) => ({ ...prev, username: u.username || "" }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`${render}/api/auth/updateuser`, formData, {
        headers: { "auth-token": token },
      });

      if (res.data.success) {
        localStorage.setItem("imovies_user", JSON.stringify(res.data.user));
        toast.success("Profile updated successfully!");
        navigate("/profile");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editUserPage" style={{ background: "#121212", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="authCard" style={{ maxWidth: "480px" }}>
          <div className="brandHeader">
            <h2>Edit Account Profile</h2>
            <p>Update your display name or password</p>
          </div>

          <form onSubmit={handleSubmit} className="authForm">
            <div className="formGroup">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                minLength={3}
                maxLength={20}
                required
              />
            </div>

            <div className="formGroup">
              <label>New Password (leave empty to keep current)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            <button type="submit" className="submitBtn" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>

          <div className="authFooter">
            <Link to="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FaArrowLeft /> Back to Profile
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditUserDetails;
