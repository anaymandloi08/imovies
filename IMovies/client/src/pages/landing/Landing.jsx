import React from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaTicketAlt, FaShieldAlt, FaFilm } from "react-icons/fa";
import "./style.scss";

const Landing = () => {
  return (
    <div className="landingPage">
      <div className="overlay"></div>

      <header className="landingHeader">
        <div className="brand">
          <span className="brandI">i</span>
          <span className="brandMovies">Movies</span>
        </div>
        <div className="headerActions">
          <Link to="/login" className="btnNavLogin">Sign In</Link>
          <Link to="/admin/login" className="btnNavAdmin">Admin</Link>
        </div>
      </header>

      <main className="landingHero">
        <div className="heroContent">
          <span className="eyebrow">PREMIER CINEMA EXPERIENCE</span>
          <h1 className="heroTitle">Welcome to iMovies</h1>
          <p className="heroSubtitle">
            Movie ticket booking made simple. Discover the latest blockbusters, select your favorite seats with live availability, and reserve in seconds.
          </p>

          <div className="ctaButtons">
            <Link to="/home" className="btnCtaPrimary">
              <FaFilm className="btnIcon" /> Browse Movies
            </Link>
            <Link to="/register" className="btnCtaSecondary">
              <FaTicketAlt className="btnIcon" /> Create Account
            </Link>
          </div>

          <div className="featuresPills">
            <div className="pill">
              <span className="pillDot"></span> Real-Time Seat Locks
            </div>
            <div className="pill">
              <span className="pillDot"></span> Instant E-Tickets
            </div>
            <div className="pill">
              <span className="pillDot"></span> Balcony & Dolby Atmos
            </div>
          </div>
        </div>
      </main>

      <footer className="landingFooter">
        <p>© {new Date().getFullYear()} iMovies. Seamless Cinema Booking.</p>
      </footer>
    </div>
  );
};

export default Landing;
