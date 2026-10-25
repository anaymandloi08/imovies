import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import "./style.scss";

const Footer = () => {
  return (
    <footer className="imoviesFooter">
      <div className="footerContainer">
        <div className="footerBrandCol">
          <div className="brandLogo">
            <span className="brandI">i</span>
            <span className="brandMovies">Movies</span>
          </div>
          <p className="brandTagline">
            Movie ticket booking made simple. Experience seamless cinema reservations, instant seat locks, and live show updates.
          </p>
        </div>

        <div className="footerLinksCol">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/home">Browse Movies</Link></li>
            <li><Link to="/favorites">Watchlist</Link></li>
            <li><Link to="/bookings">My Bookings</Link></li>
            <li><Link to="/profile">Account</Link></li>
          </ul>
        </div>

        <div className="footerLinksCol">
          <h4>Admin Portal</h4>
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/add-movie">Add Movie</Link></li>
            <li><Link to="/admin/add-theatre">Theatres</Link></li>
            <li><Link to="/admin/add-show">Schedule Show</Link></li>
          </ul>
        </div>

        <div className="footerLinksCol">
          <h4>Connect</h4>
          <div className="socialIcons">
            <a href="https://github.com" target="_blank" rel="noreferrer"><FaGithub /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
          </div>
          <p className="copyNotice">© {new Date().getFullYear()} iMovies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
