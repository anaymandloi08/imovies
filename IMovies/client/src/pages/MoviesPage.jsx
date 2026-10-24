import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Film, Search, Filter } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Biography'];

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedTrailerMovie, setSelectedTrailerMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, [searchTerm, selectedGenre]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedGenre !== 'All') params.genre = selectedGenre;

      const res = await axios.get('/api/movies', { params });
      if (res.data.success) {
        setMovies(res.data.movies);
      }
    } catch (err) {
      console.error('Failed to query movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ search: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="fs-2 text-white fw-bold d-flex align-items-center gap-2 mb-2 brand-font">
          <Film className="text-danger" size={28} />
          <span>Explore Cinema Catalog</span>
        </h1>
        <p className="text-muted small">Discover movies, explore showtimes, and book your tickets</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 mb-5">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary border-opacity-50"
                placeholder="Search by movie title..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-md-end">
              <span className="text-secondary small d-flex align-items-center gap-1">
                <Filter size={14} /> Genre:
              </span>
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`btn btn-sm px-3 py-1 rounded-pill ${
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
        </div>
      </div>

      {/* Results Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small">
          Showing <strong className="text-light">{movies.length}</strong> movies
        </span>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
          <p className="text-muted mt-3">Loading movies...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-5 glass-card p-5">
          <h4 className="text-light">No matching movies found</h4>
          <p className="text-muted">We couldn't find any movies matching "{searchTerm}".</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('All');
              setSearchParams({});
            }}
            className="btn btn-cinema btn-sm mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-3 g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard
                movie={movie}
                onWatchTrailer={(m) => setSelectedTrailerMovie(m)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        movie={selectedTrailerMovie}
        onClose={() => setSelectedTrailerMovie(null)}
      />
    </div>
  );
};

export default MoviesPage;
