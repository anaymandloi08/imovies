import React, { useState } from "react";
import dayjs from "dayjs";
import { RxCross1 } from "react-icons/rx";
import { FaStar, FaHeart, FaTicketAlt, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { render } from "../../host";
import "./style.scss";

const MovieDetailsPopup = ({ movie, onClose }) => {
  if (!movie) return null;

  // Helper function to get the first available image URL (from Page 29)
  const getImageUrl = (media) => {
    if (!media) return "/default-movie.png";
    if (typeof media === "string") return media;
    const mediaItem = Array.isArray(media) ? media[0] : media;
    return mediaItem?.url || mediaItem || "/default-movie.png";
  };

  const handleAddToWatchlist = async () => {
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please login to add to watchlist");
      return;
    }
    const user = JSON.parse(rawUser);
    try {
      const res = await axios.post(`${render}/api/favorite/add`, {
        userEmail: user.email,
        movieId: movie._id || movie.movieName,
        movieData: movie,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Added to favorites!");
      }
    } catch (err) {
      toast.error("Failed to add to watchlist");
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="movie-details-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          <RxCross1 />
        </button>

        <div className="popupContentGrid">
          <div className="popupPoster">
            <img src={getImageUrl(movie.media)} alt={movie.movieName} />
          </div>

          <div className="popupDetails">
            <div className="tagRow">
              <span className="certTag">{movie.certification || "UA"}</span>
              <span className="langTag">{movie.language || "English"}</span>
            </div>

            <h2 className="popupTitle">{movie.movieName}</h2>

            <div className="metaRow">
              <span className="ratingBadge">
                <FaStar className="starIcon" /> {movie.rating || "8.5"}/10
              </span>
              <span className="runtime">
                <FaClock /> {movie.runtime ? `${movie.runtime} mins` : "120 mins"}
              </span>
              <span className="releaseDate">
                Released: {dayjs(movie.releaseDate).format("MMM DD, YYYY")}
              </span>
            </div>

            <div className="genresList">
              {(movie.genres || []).map((g, idx) => (
                <span key={idx} className="genreBadge">
                  {g}
                </span>
              ))}
            </div>

            <p className="synopsis">{movie.description}</p>

            {movie.trailerUrl && (
              <div className="trailerSection">
                <h4>Trailer Preview</h4>
                <div className="videoFrame">
                  <iframe
                    src={
                      movie.trailerUrl.includes("youtube.com/watch?v=")
                        ? movie.trailerUrl.replace("watch?v=", "embed/")
                        : movie.trailerUrl
                    }
                    title={movie.movieName}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <div className="popupActions">
              <Link
                to={`/shows/${encodeURIComponent(movie.movieName)}`}
                className="btnBookShow"
              >
                <FaTicketAlt /> Select Shows & Book
              </Link>
              <button onClick={handleAddToWatchlist} className="btnFavorite">
                <FaHeart /> Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPopup;
