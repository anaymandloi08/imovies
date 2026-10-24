import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Play } from 'lucide-react';

const MovieCard = ({ movie, onWatchTrailer }) => {
  return (
    <div className="card movie-card h-100 text-light shadow-sm">
      <div className="position-relative overflow-hidden" style={{ height: '380px' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="card-img-top w-100 h-100 object-fit-cover"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="position-absolute top-0 start-0 m-3 badge-rating d-flex align-items-center gap-1 shadow">
          <Star size={14} className="fill-warning text-warning" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Duration Badge */}
        <div className="position-absolute top-0 end-0 m-3 bg-black bg-opacity-75 text-light px-2 py-1 rounded small d-flex align-items-center gap-1">
          <Clock size={13} className="text-info" />
          <span>{movie.duration}m</span>
        </div>

        {/* Hover Trailer Overlay Button */}
        {movie.trailerUrl && (
          <button
            onClick={() => onWatchTrailer && onWatchTrailer(movie)}
            className="btn btn-dark btn-sm rounded-circle position-absolute top-50 start-50 translate-middle p-3 shadow-lg border border-light border-opacity-25"
            style={{ opacity: 0.9 }}
            title="Watch Trailer"
          >
            <Play size={22} className="text-danger ms-1" />
          </button>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3">
        {/* Genre Tags */}
        <div className="d-flex flex-wrap gap-1 mb-2">
          {movie.genre.slice(0, 2).map((g, idx) => (
            <span key={idx} className="badge-genre small" style={{ fontSize: '0.7rem' }}>
              {g}
            </span>
          ))}
          <span className="badge bg-secondary bg-opacity-25 text-light small ms-auto" style={{ fontSize: '0.7rem' }}>
            {movie.language || 'English'}
          </span>
        </div>

        {/* Title */}
        <h5 className="card-title text-truncate fw-bold mb-1" title={movie.title}>
          {movie.title}
        </h5>

        {/* Short Synopsis */}
        <p className="card-text text-muted small line-clamp-2 mb-3" style={{ fontSize: '0.8rem', minHeight: '38px' }}>
          {movie.description}
        </p>

        {/* Action Button */}
        <div className="mt-auto pt-2 border-top border-secondary border-opacity-25">
          <Link
            to={`/movie/${movie._id}`}
            className="btn btn-cinema w-100 d-flex align-items-center justify-content-center gap-2 py-2"
          >
            <Ticket size={18} />
            <span>Book Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
