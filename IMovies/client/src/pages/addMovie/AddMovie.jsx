import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaFilm, FaArrowLeft } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { render } from "../../host";
import "./style.scss";

const AddMovie = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    movieName: "",
    description: "",
    genres: "Action, Sci-Fi",
    releaseDate: new Date().toISOString().split("T")[0],
    runtime: 120,
    certification: "UA",
    rating: 8.5,
    language: "English",
    media: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movieName || !formData.description || !formData.genres || !formData.releaseDate) {
      toast.error("Please fill in all required movie details");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${render}/api/movie/addmovie`, {
        ...formData,
        genres: formData.genres.split(",").map((g) => g.trim()),
      });

      if (res.data.success) {
        toast.success("Movie added to cinema repertoire!");
        navigate("/admin");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add movie");
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
              <FaFilm className="icon" /> Add New Movie Premiere
            </h2>
            <p>Publish a new title into the iMovies catalog</p>
          </div>

          <form onSubmit={handleSubmit} className="standardAdminForm">
            <div className="formGroup">
              <label>Movie Title *</label>
              <input
                type="text"
                name="movieName"
                value={formData.movieName}
                onChange={handleChange}
                placeholder="e.g. Gladiator II"
                required
              />
            </div>

            <div className="formGroup">
              <label>Description / Synopsis *</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Synopsis of the movie..."
                required
              ></textarea>
            </div>

            <div className="formGridDouble">
              <div className="formGroup">
                <label>Genres (comma separated) *</label>
                <input
                  type="text"
                  name="genres"
                  value={formData.genres}
                  onChange={handleChange}
                  placeholder="Action, Sci-Fi, Drama"
                  required
                />
              </div>

              <div className="formGroup">
                <label>Release Date *</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="formGridTriple">
              <div className="formGroup">
                <label>Runtime (minutes)</label>
                <input
                  type="number"
                  name="runtime"
                  value={formData.runtime}
                  onChange={handleChange}
                />
              </div>

              <div className="formGroup">
                <label>Certification</label>
                <select
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                >
                  <option value="U">U (Universal)</option>
                  <option value="UA">UA (Parental Guidance)</option>
                  <option value="A">A (Adults Only)</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R (Restricted)</option>
                </select>
              </div>

              <div className="formGroup">
                <label>Rating (out of 10)</label>
                <input
                  type="number"
                  step="0.1"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="formGroup">
              <label>Poster Image URL</label>
              <input
                type="url"
                name="media"
                value={formData.media}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="formGroup">
              <label>Trailer URL (YouTube)</label>
              <input
                type="url"
                name="trailerUrl"
                value={formData.trailerUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <button type="submit" className="btnSubmitForm" disabled={loading}>
              {loading ? "Adding Movie..." : "Add Movie to Catalog"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddMovie;
