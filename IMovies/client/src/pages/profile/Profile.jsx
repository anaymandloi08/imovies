import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaUserCircle, FaTicketAlt, FaHeart, FaEdit, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import "./style.scss";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("imovies_user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {
        setUser({ username: rawUser, email: "user@imovies.com" });
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    localStorage.removeItem("imovies_user");
    navigate("/login");
  };

  return (
    <div className="userProfilePage">
      <Header />

      <main className="profileContainer">
        <div className="profileCard">
          <div className="avatarBanner">
            <div className="avatarIconWrapper">
              <FaUserCircle />
            </div>
          </div>

          <div className="profileInfo">
            <h2>{user?.username || "Cinema Fan"}</h2>
            <p className="emailText">{user?.email || "user@imovies.com"}</p>
            <span className="memberBadge">PRO MEMBER</span>

            <div className="quickStatsRow">
              <Link to="/bookings" className="statBox">
                <FaTicketAlt className="statIcon" />
                <span className="statLabel">My Bookings</span>
                <span className="statSub">View tickets</span>
              </Link>
              <Link to="/favorites" className="statBox">
                <FaHeart className="statIcon fav" />
                <span className="statLabel">Watchlist</span>
                <span className="statSub">Saved movies</span>
              </Link>
            </div>

            <div className="profileActions">
              <Link to="/profile/edit" className="btnEdit">
                <FaEdit /> Edit Account Details
              </Link>
              <button onClick={handleLogout} className="btnLogout">
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
