import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, Calendar, MapPin, Play, Ticket, Film, ChevronRight } from 'lucide-react';
import TrailerModal from '../components/TrailerModal';

const getDayFormatted = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const iso = d.toISOString().split('T')[0];
  const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
  const dateFormatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  return { iso, dayName, dateFormatted };
};

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getDayFormatted(0).iso);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  const dateOptions = [getDayFormatted(0), getDayFormatted(1), getDayFormatted(2)];

  useEffect(() => {
    fetchMovieAndShows();
  }, [id, selectedDate]);

  const fetchMovieAndShows = async () => {
    try {
      setLoading(true);
      const [movieRes, showsRes] = await Promise.all([
        axios.get(`/api/movies/${id}`),
        axios.get(`/api/movies/${id}/shows?date=${selectedDate}`)
      ]);

      if (movieRes.data.success) {
        setMovie(movieRes.data.movie);
      }
      if (showsRes.data.success) {
        setShows(showsRes.data.shows);
      }
    } catch (err) {
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const theatreId = show.theatre._id;
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  if (loading && !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="text-muted mt-3">Loading movie details & showtimes...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h4>Movie not found</h4>
        <Link to="/" className="btn btn-cinema btn-sm mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="pb-5">
      {/* Movie Hero Header */}
      <div
        className="position-relative py-5"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 23, 0.8) 0%, rgba(11, 15, 23, 0.95) 100%), url(${movie.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '420px'
        }}
      >
        <div className="container py-4">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb small">
              <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/movies" className="text-muted text-decoration-none">Movies</Link></li>
              <li className="breadcrumb-item active text-light" aria-current="page">{movie.title}</li>
            </ol>
          </nav>

          <div className="row g-4 align-items-center">
            {/* Poster Card */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="img-fluid rounded-3 shadow-2xl border border-secondary border-opacity-50"
                style={{ maxHeight: '380px', objectFit: 'cover' }}
              />
            </div>

            {/* Details */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <span className="badge-rating d-flex align-items-center gap-1">
                  <Star size={15} className="fill-warning text-warning" />
                  <span>{movie.rating.toFixed(1)} / 10</span>
                </span>
                <span className="badge bg-dark border border-secondary text-info d-flex align-items-center gap-1">
                  <Clock size={13} />
                  <span>{movie.duration} Minutes</span>
                </span>
                <span className="badge bg-secondary bg-opacity-25 text-light">
                  {movie.language}
                </span>
              </div>

              <h1 className="display-5 fw-bold text-white mb-2 brand-font">
                {movie.title}
              </h1>

              {/* Genre Badges */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genre.map((g, i) => (
                  <span key={i} className="badge-genre small">{g}</span>
                ))}
              </div>

              <p className="text-light text-opacity-75 mb-3" style={{ maxWidth: '750px', fontSize: '0.95rem' }}>
                {movie.description}
              </p>

              <div className="row g-3 text-muted small mb-4">
                {movie.director && (
                  <div className="col-sm-6">
                    <strong className="text-light">Director:</strong> {movie.director}
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="col-sm-6">
                    <strong className="text-light">Starring:</strong> {movie.cast.join(', ')}
                  </div>
                )}
              </div>

              {movie.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn btn-secondary-cinema d-inline-flex align-items-center gap-2"
                >
                  <Play size={18} className="text-danger" />
                  <span>Watch Official Trailer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtime Selection Section */}
      <div className="container mt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
          <div>
            <h3 className="text-white mb-1 d-flex align-items-center gap-2 brand-font">
              <Calendar className="text-danger" size={24} />
              <span>Select Date & Showtimes</span>
            </h3>
            <p className="text-muted small mb-0">Choose your preferred cinema hall and timing</p>
          </div>

          {/* Date Selector Tabs */}
          <div className="d-flex gap-2">
            {dateOptions.map((opt) => (
              <button
                key={opt.iso}
                onClick={() => setSelectedDate(opt.iso)}
                className={`btn d-flex flex-column align-items-center px-3 py-2 rounded-3 transition-all ${
                  selectedDate === opt.iso
                    ? 'btn-danger shadow'
                    : 'btn-dark border border-secondary border-opacity-50 text-light'
                }`}
                style={{ minWidth: '95px' }}
              >
                <span className="small fw-bold text-uppercase">{opt.dayName}</span>
                <span className="fs-6 fw-extrabold">{opt.dateFormatted}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theatres List */}
        {shows.length === 0 ? (
          <div className="glass-card p-5 text-center my-4">
            <h5 className="text-light">No showtimes scheduled for this date</h5>
            <p className="text-muted small">Try choosing another day from the date selector tabs above.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {Object.values(showsByTheatre).map(({ theatre, shows }) => (
              <div key={theatre._id} className="glass-card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                  <div>
                    <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                      <Film className="text-danger" size={20} />
                      <span>{theatre.name}</span>
                    </h5>
                    <div className="d-flex align-items-center gap-1 text-muted small">
                      <MapPin size={14} className="text-secondary" />
                      <span>{theatre.location}, {theatre.city}</span>
                    </div>
                  </div>
                  <span className="badge bg-secondary bg-opacity-25 text-light mt-2 mt-md-0 align-self-start align-self-md-auto">
                    {theatre.screens} Screen Multiplex
                  </span>
                </div>

                {/* Showtimes Pills */}
                <div className="d-flex flex-wrap gap-3">
                  {shows.map((show) => (
                    <button
                      key={show._id}
                      onClick={() => navigate(`/booking/${show._id}`)}
                      className="btn btn-outline-light d-flex flex-column align-items-center py-2 px-3 rounded-3 border-secondary border-opacity-50 hover-cinema"
                      style={{ minWidth: '130px' }}
                    >
                      <span className="fw-bold fs-6 text-light">{show.time}</span>
                      <span className="small text-info">{show.screenName}</span>
                      <span className="small text-success mt-1">₹{show.standardPrice} onwards</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        movie={showTrailer ? movie : null}
        onClose={() => setShowTrailer(false)}
      />
    </div>
  );
};

export default MovieDetailsPage;
