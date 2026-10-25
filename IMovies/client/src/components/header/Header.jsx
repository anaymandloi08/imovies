import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { FaFilm, FaHeart, FaTicketAlt, FaUserCircle, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import "./style.scss";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem("imovies_user");
    const rawAdmin = localStorage.getItem("imovies_admin");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {
        setUser({ username: rawUser });
      }
    } else {
      setUser(null);
    }

    if (rawAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [location]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("imovies_user");
    localStorage.removeItem("imovies_admin");
    setUser(null);
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <header className="imoviesHeader">
      <div className="headerContainer">
        <div className="leftBrand">
          <Link to="/home" className="brandLink">
            <span className="brandI">i</span>
            <span className="brandMovies">Movies</span>
            <span className="badgeLive">CINEMA</span>
          </Link>
        </div>

        <nav className="navLinks">
          <Link to="/home" className={`navItem ${location.pathname === "/home" ? "active" : ""}`}>
            <FaFilm className="icon" /> Movies
          </Link>
          <Link to="/favorites" className={`navItem ${location.pathname === "/favorites" ? "active" : ""}`}>
            <FaHeart className="icon" /> Watchlist
          </Link>
          <Link to="/bookings" className={`navItem ${location.pathname === "/bookings" ? "active" : ""}`}>
            <FaTicketAlt className="icon" /> Bookings
          </Link>
          {isAdmin ? (
            <Link to="/admin" className={`navItem adminBadge ${location.pathname.startsWith("/admin") ? "active" : ""}`}>
              <FaShieldAlt className="icon" /> Admin Panel
            </Link>
          ) : (
            <Link to="/admin/login" className="navItem adminLink">
              <FaShieldAlt className="icon" /> Admin
            </Link>
          )}
        </nav>

        <div className="rightActions">
          {user ? (
            <div className="userCluster">
              <Link to="/profile" className="profileLink" title="User Profile">
                <FaUserCircle className="userIcon" />
                <span className="userName">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="logoutBtn" title="Logout">
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <div className="authButtons">
              <Link to="/login" className="btnSecondary">Sign In</Link>
              <Link to="/register" className="btnPrimary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
