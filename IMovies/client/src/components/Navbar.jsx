import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Ticket, User, LogOut, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    navigate(`/movies?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary border-opacity-25 sticky-top py-3">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 brand-font fs-3 text-white text-decoration-none">
          <Film className="text-danger" size={32} />
          <span>I<span className="text-danger">Movies</span></span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none text-light"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
        >
          {navOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Nav Content */}
        <div className={`collapse navbar-collapse ${navOpen ? 'show mt-3 mt-lg-0' : ''}`}>
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="d-flex mx-lg-auto my-2 my-lg-0 w-100 w-lg-50" style={{ maxWidth: '420px' }}>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary border-opacity-50"
                placeholder="Search movies, genres, language..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
              />
            </div>
          </form>

          {/* Links */}
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link to="/" className="nav-link text-light px-3 fw-medium">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/movies" className="nav-link text-light px-3 fw-medium">
                Movies
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/my-bookings" className="nav-link text-light px-3 fw-medium d-flex align-items-center gap-1">
                    <Ticket size={18} className="text-danger" />
                    <span>My Bookings</span>
                  </Link>
                </li>
                <li className="nav-item dropdown ms-lg-2">
                  <div className="d-flex align-items-center gap-2 bg-dark px-3 py-2 rounded-pill border border-secondary border-opacity-25">
                    <User size={16} className="text-info" />
                    <span className="text-light fw-semibold small">{user?.name || 'My Account'}</span>
                    <button
                      onClick={handleLogout}
                      className="btn btn-sm btn-link text-secondary p-0 ms-2 hover-danger"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <div className="d-flex gap-2 ms-lg-3 mt-2 mt-lg-0">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 py-2 rounded-pill fw-medium">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema btn-sm px-3 py-2 rounded-pill fw-medium">
                  Register
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
