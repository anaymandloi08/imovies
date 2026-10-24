import React from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ movie, onClose }) => {
  if (!movie) return null;

  // Convert youtube watch URL to embed URL
  let embedUrl = movie.trailerUrl;
  if (embedUrl && embedUrl.includes('watch?v=')) {
    const videoId = embedUrl.split('watch?v=')[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content bg-dark text-light border border-secondary border-opacity-50 shadow-2xl rounded-3 overflow-hidden">
          <div className="modal-header border-bottom border-secondary border-opacity-25 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <span className="text-danger">▶</span> {movie.title} — Official Trailer
            </h5>
            <button type="button" className="btn btn-sm btn-link text-light p-0" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="modal-body p-0 ratio ratio-16x9">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center text-muted">
                Trailer not available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
