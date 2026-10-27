import React, { useEffect } from "react";
import { FaTimes, FaFilm } from "react-icons/fa";
import "./style.scss";

const TrailerModal = ({ movie, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  // Convert YouTube standard URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("embed")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : url;
  };

  const embedUrl = getEmbedUrl(movie.trailerLink || "https://www.youtube.com/watch?v=zSWdZVtXT7E");

  return (
    <div className="trailerModalBackdrop" onClick={onClose}>
      <div className="trailerModalContent" onClick={(e) => e.stopPropagation()}>
        <div className="trailerModalHeader">
          <div className="trailerTitle">
            <FaFilm className="filmIcon" />
            <span>{movie.movieName} — Official Trailer</span>
          </div>
          <button className="btnClose" onClick={onClose} aria-label="Close trailer">
            <FaTimes />
          </button>
        </div>

        <div className="videoWrapper">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movie.movieName} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="trailerUnavailable">
              <p>Trailer stream is temporarily unavailable for this title.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
