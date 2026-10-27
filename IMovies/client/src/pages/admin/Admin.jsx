import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaFilm,
  FaTheaterMasks,
  FaCalendarCheck,
  FaTicketAlt,
  FaRupeeSign,
  FaPlus,
  FaTrash,
  FaShieldAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import Cookies from "js-cookie";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import { render } from "../../host";
import { mockMovies, mockTheatres, mockShows } from "../../data/mockData";
import "./style.scss";

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalTheatres: 0,
    totalShows: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("movies");

  const fetchAdminData = async () => {
    try {
      const token = Cookies.get("adminToken") || localStorage.getItem("adminToken");
      const headers = token ? { "auth-token": token } : {};

      const [statsRes, moviesRes, theatresRes, showsRes] = await Promise.all([
        axios.get(`${render}/api/auth/admin/stats`, { headers }),
        axios.get(`${render}/api/movie/getallmovies`),
        axios.get(`${render}/api/theatre/getalltheatres`),
        axios.get(`${render}/api/shows/getallshows`),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (moviesRes.data.success) setMovies(moviesRes.data.movies || []);
      if (theatresRes.data.success) setTheatres(theatresRes.data.theatres || []);
      if (showsRes.data.success) setShows(showsRes.data.shows || []);
    } catch (err) {
      console.warn("Admin fetch fell back to demo storage:", err.message);
      const savedMovies = JSON.parse(localStorage.getItem("imovies_custom_movies") || "[]");
      const savedTheatres = JSON.parse(localStorage.getItem("imovies_custom_theatres") || "[]");
      const allMovies = [...mockMovies, ...savedMovies];
      const allTheatres = [...mockTheatres, ...savedTheatres];
      const savedBookings = JSON.parse(localStorage.getItem("imovies_bookings") || "[]");
      const rev = savedBookings.reduce((sum, b) => sum + (b.ticketsData?.totalPrice || 0), 0);

      setMovies(allMovies);
      setTheatres(allTheatres);
      setShows(mockShows);
      setStats({
        totalMovies: allMovies.length,
        totalTheatres: allTheatres.length,
        totalShows: mockShows.length,
        totalBookings: savedBookings.length,
        totalRevenue: rev,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      const res = await axios.delete(`${render}/api/movie/deletemovie/${id}`, { timeout: 2500 });
      if (res.data.success) {
        toast.success("Movie deleted successfully");
        setMovies(movies.filter((m) => m._id !== id));
        return;
      }
    } catch (err) {
      // Local fallback
      const saved = JSON.parse(localStorage.getItem("imovies_custom_movies") || "[]");
      const updated = saved.filter((m) => m._id !== id);
      localStorage.setItem("imovies_custom_movies", JSON.stringify(updated));
      setMovies(movies.filter((m) => m._id !== id));
      toast.success("Movie removed from repertoire");
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm("Are you sure you want to delete this theatre?")) return;
    try {
      const res = await axios.delete(`${render}/api/theatre/deletetheatre/${id}`, { timeout: 2500 });
      if (res.data.success) {
        toast.success("Theatre deleted successfully");
        setTheatres(theatres.filter((t) => t._id !== id));
        return;
      }
    } catch (err) {
      // Local fallback
      const saved = JSON.parse(localStorage.getItem("imovies_custom_theatres") || "[]");
      const updated = saved.filter((t) => t._id !== id);
      localStorage.setItem("imovies_custom_theatres", JSON.stringify(updated));
      setTheatres(theatres.filter((t) => t._id !== id));
      toast.success("Theatre removed successfully");
    }
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm("Are you sure you want to cancel this show?")) return;
    try {
      const res = await axios.delete(`${render}/api/shows/deleteshow/${showId}`, { timeout: 2500 });
      if (res.data.success) {
        toast.success("Show deleted successfully");
        setShows(shows.filter((s) => s.showId !== showId));
        return;
      }
    } catch (err) {
      setShows(shows.filter((s) => s.showId !== showId && s._id !== showId));
      toast.success("Show cancelled successfully");
    }
  };

  return (
    <div className="adminDashboardPage">
      <Header />

      <main className="adminContainer">
        <div className="dashboardTopBar">
          <div className="adminHeading">
            <span className="badgeAdmin">
              <FaShieldAlt /> ADMINISTRATION HUB
            </span>
            <h1>Cinema Management Console</h1>
          </div>

          <div className="quickAddActions">
            <Link to="/admin/add-movie" className="btnQuickAdd">
              <FaPlus /> Add Movie
            </Link>
            <Link to="/admin/add-theatre" className="btnQuickAdd">
              <FaPlus /> Add Theatre
            </Link>
            <Link to="/admin/add-show" className="btnQuickAdd">
              <FaPlus /> Schedule Show
            </Link>
            <Link to="/admin/bookings" className="btnViewBookings">
              <FaTicketAlt /> All Bookings
            </Link>
          </div>
        </div>

        {/* Analytics Stats Grid */}
        <div className="statsGrid">
          <div className="statCard">
            <div className="statIconWrap red">
              <FaFilm />
            </div>
            <div className="statDetails">
              <span className="statTitle">Total Movies</span>
              <span className="statNumber">{stats.totalMovies}</span>
            </div>
          </div>

          <div className="statCard">
            <div className="statIconWrap purple">
              <FaTheaterMasks />
            </div>
            <div className="statDetails">
              <span className="statTitle">Partner Theatres</span>
              <span className="statNumber">{stats.totalTheatres}</span>
            </div>
          </div>

          <div className="statCard">
            <div className="statIconWrap blue">
              <FaCalendarCheck />
            </div>
            <div className="statDetails">
              <span className="statTitle">Scheduled Shows</span>
              <span className="statNumber">{stats.totalShows}</span>
            </div>
          </div>

          <div className="statCard">
            <div className="statIconWrap green">
              <FaTicketAlt />
            </div>
            <div className="statDetails">
              <span className="statTitle">Total Bookings</span>
              <span className="statNumber">{stats.totalBookings}</span>
            </div>
          </div>

          <div className="statCard revenueCard">
            <div className="statIconWrap gold">
              <FaRupeeSign />
            </div>
            <div className="statDetails">
              <span className="statTitle">Platform Revenue</span>
              <span className="statNumber">₹{stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="managementSection">
          <div className="tabsRow">
            <button
              className={`tabBtn ${activeTab === "movies" ? "active" : ""}`}
              onClick={() => setActiveTab("movies")}
            >
              Movies Directory ({movies.length})
            </button>
            <button
              className={`tabBtn ${activeTab === "theatres" ? "active" : ""}`}
              onClick={() => setActiveTab("theatres")}
            >
              Theatres ({theatres.length})
            </button>
            <button
              className={`tabBtn ${activeTab === "shows" ? "active" : ""}`}
              onClick={() => setActiveTab("shows")}
            >
              Active Shows ({shows.length})
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="tableWrapper">
              {activeTab === "movies" && (
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Movie Name</th>
                      <th>Genres</th>
                      <th>Rating</th>
                      <th>Duration</th>
                      <th>Cert</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((m) => (
                      <tr key={m._id}>
                        <td className="boldText">{m.movieName}</td>
                        <td>{(m.genres || []).join(", ")}</td>
                        <td className="ratingCell">⭐ {m.rating}</td>
                        <td>{m.runtime} mins</td>
                        <td>{m.certification}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteMovie(m._id)}
                            className="btnDelete"
                            title="Delete Movie"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "theatres" && (
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Theatre Name</th>
                      <th>Theatre ID</th>
                      <th>Location</th>
                      <th>Balcony (₹)</th>
                      <th>Middle (₹)</th>
                      <th>Lower (₹)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theatres.map((t) => (
                      <tr key={t._id}>
                        <td className="boldText">{t.theatreName}</td>
                        <td>{t.theatreId}</td>
                        <td>{t.location}</td>
                        <td>₹{t.balconySeatPrice}</td>
                        <td>₹{t.middleSeatPrice}</td>
                        <td>₹{t.lowerSeatPrice}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteTheatre(t._id)}
                            className="btnDelete"
                            title="Delete Theatre"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "shows" && (
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Show ID</th>
                      <th>Movie</th>
                      <th>Theatre</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Booked Seats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((s) => (
                      <tr key={s._id || s.showId}>
                        <td className="monoText">{s.showId}</td>
                        <td className="boldText">{s.movieId}</td>
                        <td>{s.theatreName}</td>
                        <td>{s.showdate}</td>
                        <td>{s.showtime}</td>
                        <td>{(s.tickets?.bookedSeats || []).length} seats</td>
                        <td>
                          <button
                            onClick={() => handleDeleteShow(s.showId)}
                            className="btnDelete"
                            title="Delete Show"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
