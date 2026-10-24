import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Ticket, Sparkles, ShieldCheck, Zap, Smartphone } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Biography'];

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await axios.get('/api/movies');
      if (res.data.success) {
        setMovies(res.data.movies);
        setFilteredMovies(res.data.movies);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterGenre = (genre) => {
    setSelectedGenre(genre);
    if (genre === 'All') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter((m) =>
        m.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  };

  const featuredMovie = movies[0] || null;

  return (
    <div className="pb-5">
      {/* Hero Banner Section */}
      {featuredMovie && (
        <section
          className="position-relative d-flex align-items-center py-5"
          style={{
            minHeight: '520px',
            backgroundImage: `linear-gradient(to right, rgba(11, 15, 23, 0.95) 25%, rgba(11, 15, 23, 0.7) 60%, rgba(11, 15, 23, 0.9) 100%), url(${featuredMovie.bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container py-4">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-danger text-uppercase px-3 py-2 fw-bold">Featured Premiere</span>
                  <span className="badge bg-dark border border-secondary text-info">IMAX Exclusive</span>
                  <span className="badge bg-warning bg-opacity-25 text-warning fw-bold">★ {featuredMovie.rating.toFixed(1)}/10</span>
                </div>

                <h1 className="display-4 fw-extrabold text-white mb-3 brand-font">
                  {featuredMovie.title}
                </h1>

                <p className="lead text-light text-opacity-75 mb-4" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>
                  {featuredMovie.description}
                </p>

                <div className="d-flex flex-wrap gap-3 align-items-center">
                  <Link
                    to={`/movie/${featuredMovie._id}`}
                    className="btn btn-cinema btn-lg px-4 py-3 d-flex align-items-center gap-2 shadow-lg"
                  >
                    <Ticket size={22} />
                    <span>Book Tickets Now</span>
                  </Link>

                  {featuredMovie.trailerUrl && (
                    <button
                      onClick={() => setSelectedTrailerMovie(featuredMovie)}
                      className="btn btn-secondary-cinema btn-lg px-4 py-3 d-flex align-items-center gap-2"
                    >
                      <Play size={20} className="text-danger" />
                      <span>Watch Trailer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content: Movie Grid */}
      <div className="container mt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fs-2 text-white mb-1 d-flex align-items-center gap-2">
              <Sparkles className="text-danger" size={26} />
              <span>Now Showing In Cinemas</span>
            </h2>
            <p className="text-muted small mb-0">Browse latest blockbuster releases and explore showtimes</p>
          </div>

          {/* Genre Filter Pills */}
          <div className="d-flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleFilterGenre(genre)}
                className={`btn btn-sm px-3 py-1 rounded-pill fw-medium transition-all ${
                  selectedGenre === genre
                    ? 'btn-danger shadow'
                    : 'btn-dark border border-secondary border-opacity-50 text-light'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Cards Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading movies...</span>
            </div>
            <p className="text-muted mt-3">Fetching current cinema releases...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-5 glass-card p-5 my-4">
            <h4 className="text-light">No movies found</h4>
            <p className="text-muted">Try selecting another genre or searching for a different title.</p>
            <button onClick={() => handleFilterGenre('All')} className="btn btn-outline-danger btn-sm mt-2">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-3 g-4">
            {filteredMovies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard
                  movie={movie}
                  onWatchTrailer={(m) => setSelectedTrailerMovie(m)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Why Choose IMovies Features */}
        <section className="mt-5 pt-4">
          <div className="glass-card p-4 p-md-5">
            <h3 className="text-center text-white mb-4 brand-font">Why Book With IMovies?</h3>
            <div className="row g-4 text-center">
              <div className="col-md-3 col-sm-6">
                <div className="p-3">
                  <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
                    <Zap size={28} />
                  </div>
                  <h6 className="text-white fw-bold">Atomic Seat Locking</h6>
                  <p className="text-muted small mb-0">Zero double-booking risk. Seats are locked atomically at the database level.</p>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="p-3">
                  <div className="d-inline-flex p-3 rounded-circle bg-info bg-opacity-10 text-info mb-3">
                    <ShieldCheck size={28} />
                  </div>
                  <h6 className="text-white fw-bold">Zero Hidden Fees</h6>
                  <p className="text-muted small mb-0">100% price transparency. The price you see on the seat matrix is what you pay.</p>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="p-3">
                  <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
                    <Ticket size={28} />
                  </div>
                  <h6 className="text-white fw-bold">Instant Confirmation</h6>
                  <p className="text-muted small mb-0">Receive a verifiable Booking Reference ID and printable receipt immediately.</p>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="p-3">
                  <div className="d-inline-flex p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-3">
                    <Smartphone size={28} />
                  </div>
                  <h6 className="text-white fw-bold">Mobile First UX</h6>
                  <p className="text-muted small mb-0">Tailored for fast bookings on phones, tablets, or desktop browsers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        movie={selectedTrailerMovie}
        onClose={() => setSelectedTrailerMovie(null)}
      />
    </div>
  );
};

export default HomePage;
