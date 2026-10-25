import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTheaterMasks, FaArrowLeft } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { render } from "../../host";
import "../addMovie/style.scss";

const AddTheatre = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    theatreName: "",
    theatreId: "",
    location: "",
    balconySeatPrice: 350,
    middleSeatPrice: 220,
    lowerSeatPrice: 150,
    adminName: "Admin",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.theatreName || !formData.theatreId || !formData.location) {
      toast.error("Please fill in theatre name, unique ID, and location");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${render}/api/theatre/addtheatre`, formData);
      if (res.data.success) {
        toast.success("Theatre venue registered successfully!");
        navigate("/admin");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add theatre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addEntityPage">
      <Header />

      <main className="formWrapper">
        <div className="formCard">
          <div className="formHeader">
            <Link to="/admin" className="btnBack">
              <FaArrowLeft /> Back to Admin
            </Link>
            <h2>
              <FaTheaterMasks className="icon" /> Register Cinema Theatre
            </h2>
            <p>Configure auditorium seats, tiers, and base pricing</p>
          </div>

          <form onSubmit={handleSubmit} className="standardAdminForm">
            <div className="formGridDouble">
              <div className="formGroup">
                <label>Theatre Name *</label>
                <input
                  type="text"
                  name="theatreName"
                  value={formData.theatreName}
                  onChange={handleChange}
                  placeholder="e.g. Cinepolis VIP Lounge"
                  required
                />
              </div>

              <div className="formGroup">
                <label>Unique Theatre ID *</label>
                <input
                  type="text"
                  name="theatreId"
                  value={formData.theatreId}
                  onChange={handleChange}
                  placeholder="e.g. cinepolis-vip-01"
                  required
                />
              </div>
            </div>

            <div className="formGroup">
              <label>Location & Hall / Screen *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Phoenix Marketcity, Screen 3 (Dolby Atmos)"
                required
              />
            </div>

            <div className="formGridTriple">
              <div className="formGroup">
                <label>Balcony Seat Price (₹) *</label>
                <input
                  type="number"
                  name="balconySeatPrice"
                  value={formData.balconySeatPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Middle Seat Price (₹) *</label>
                <input
                  type="number"
                  name="middleSeatPrice"
                  value={formData.middleSeatPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Lower Seat Price (₹) *</label>
                <input
                  type="number"
                  name="lowerSeatPrice"
                  value={formData.lowerSeatPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btnSubmitForm" disabled={loading}>
              {loading ? "Registering Theatre..." : "Register Theatre"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddTheatre;
