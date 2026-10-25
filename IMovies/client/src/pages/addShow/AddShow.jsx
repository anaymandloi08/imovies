import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCalendarPlus, FaArrowLeft } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { render } from "../../host";
import "../addMovie/style.scss";

const AddShow = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [formData, setFormData] = useState({
    adminEmail: "admin@imovies.com",
    showId: `show-${Date.now().toString().slice(-6)}`,
    movieId: "",
    theatreName: "",
    showdate: new Date().toISOString().split("T")[0],
    showtime: "18:00",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rawAdmin = localStorage.getItem("imovies_admin");
    if (rawAdmin) {
      try {
        const a = JSON.parse(rawAdmin);
        if (a.email) setFormData((prev) => ({ ...prev, adminEmail: a.email }));
      } catch (e) {}
    }

    Promise.all([
      axios.get(`${render}/api/movie/getallmovies`),
      axios.get(`${render}/api/theatre/getalltheatres`),
    ])
      .then(([mRes, tRes]) => {
        if (mRes.data.success && mRes.data.movies.length > 0) {
          setMovies(mRes.data.movies);
          setFormData((prev) => ({
            ...prev,
            movieId: mRes.data.movies[0].movieName,
          }));
        }
        if (tRes.data.success && tRes.data.theatres.length > 0) {
          setTheatres(tRes.data.theatres);
          setFormData((prev) => ({
            ...prev,
            theatreName: tRes.data.theatres[0].theatreName,
          }));
        }
      })
      .catch((err) => {
        console.error("Error loading movies/theatres for show scheduling", err);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movieId || !formData.theatreName || !formData.showdate || !formData.showtime) {
      toast.error("Please fill in all show details");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${render}/api/shows/addshow`, formData);
      if (res.data.success) {
        toast.success("Showtime scheduled successfully!");
        navigate("/admin");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to schedule show");
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
              <FaCalendarPlus className="icon" /> Schedule Movie Showtime
            </h2>
            <p>Assign movies to auditoriums with date and time slots</p>
          </div>

          <form onSubmit={handleSubmit} className="standardAdminForm">
            <div className="formGridDouble">
              <div className="formGroup">
                <label>Admin Contact Email *</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Unique Show ID *</label>
                <input
                  type="text"
                  name="showId"
                  value={formData.showId}
                  onChange={handleChange}
                  placeholder="show-01"
                  required
                />
              </div>
            </div>

            <div className="formGridDouble">
              <div className="formGroup">
                <label>Select Movie *</label>
                <select
                  name="movieId"
                  value={formData.movieId}
                  onChange={handleChange}
                  required
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m.movieName}>
                      {m.movieName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formGroup">
                <label>Select Theatre Venue *</label>
                <select
                  name="theatreName"
                  value={formData.theatreName}
                  onChange={handleChange}
                  required
                >
                  {theatres.map((t) => (
                    <option key={t._id} value={t.theatreName}>
                      {t.theatreName} ({t.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="formGridDouble">
              <div className="formGroup">
                <label>Show Date *</label>
                <input
                  type="date"
                  name="showdate"
                  value={formData.showdate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Show Time (24h format, e.g. 18:30) *</label>
                <input
                  type="text"
                  name="showtime"
                  value={formData.showtime}
                  onChange={handleChange}
                  placeholder="18:30"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btnSubmitForm" disabled={loading}>
              {loading ? "Scheduling Show..." : "Publish Showtime"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddShow;
