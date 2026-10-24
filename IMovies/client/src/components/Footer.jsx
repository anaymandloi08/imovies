import React from 'react';
import { Film, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-secondary border-top border-secondary border-opacity-25 py-5 mt-auto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-5 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 brand-font fs-3 text-white text-decoration-none mb-3">
              <Film className="text-danger" size={28} />
              <span>I<span className="text-danger">Movies</span></span>
            </Link>
            <p className="small text-muted mb-3" style={{ maxWidth: '380px' }}>
              IMovies makes cinema ticket booking effortless, transparent, and lightning-fast. Explore blockbuster movies, check showtimes across premium multiplexes, and book seats with atomic concurrency safety.
            </p>
            <div className="d-flex align-items-center gap-2 text-success small">
              <ShieldCheck size={18} />
              <span>Zero Hidden Fees • Guaranteed Reservation Concurrency</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-light fw-bold text-uppercase mb-3 small tracking-wider">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-muted text-decoration-none hover-white">Now Showing</Link></li>
              <li><Link to="/movies" className="text-muted text-decoration-none hover-white">Explore All Movies</Link></li>
              <li><Link to="/my-bookings" className="text-muted text-decoration-none hover-white">My Reservations</Link></li>
              <li><Link to="/register" className="text-muted text-decoration-none hover-white">Create Account</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-light fw-bold text-uppercase mb-3 small tracking-wider">Multiplexes</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><span className="text-muted">PVR ICON IMAX</span></li>
              <li><span className="text-muted">Cinépolis VIP Grand</span></li>
              <li><span className="text-muted">INOX Megaplex</span></li>
              <li><span className="text-muted">Dolby Atmos Theatres</span></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-light fw-bold text-uppercase mb-3 small tracking-wider">Skillwallet Submission</h6>
            <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 small">
              <div className="text-info fw-semibold mb-1 d-flex align-items-center gap-1">
                <Sparkles size={16} /> MERN Full-Stack Project
              </div>
              <p className="text-muted mb-0 small">
                Developed strictly under the MERN Development curriculum with complete documentation traceability.
              </p>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary border-opacity-25" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 small text-muted">
          <div>
            © {new Date().getFullYear()} IMovies. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-1">
            Built with React, Express, Node.js & MongoDB
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
