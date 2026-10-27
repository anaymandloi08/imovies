import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaHeart, FaTicketAlt, FaTrashAlt, FaStar, FaFilm } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import { render } from "../../host";
import { mockMovies } from "../../data/mockData";
import "./style.scss";

const FavoriteShows = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      setLoading(false);
      return;
    }
    const user = JSON.parse(rawUser);

    try {
      const res = await axios.get(
        `${render}/api/favorite/userfavorites/${encodeURIComponent(user.email)}`,
        { timeout: 2500 }
      );
      if (res.data.success) {
        setFavorites(res.data.favorites || []);
      }
    } catch (err) {
      console.warn("Watchlist fetch failed, falling back to local storage:", err.message);
      const saved = JSON.parse(localStorage.getItem("imovies_favorites") || "[]");
      setFavorites(saved);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (movieId, movieName) => {
    // Local update
    const saved = JSON.parse(localStorage.getItem("imovies_favorites") || "[]");
    const updated = saved.filter(
      (f) => f.movieId !== movieId && f.movieName !== movieName
    );
    localStorage.setItem("imovies_favorites", JSON.stringify(updated));
    setFavorites(updated);
    toast.info("Removed from watchlist");

    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) return;
    const user = JSON.parse(rawUser);

    try {
      await axios.post(
        `${render}/api/favorite/remove`,
        {
          userEmail: user.email,
          movieId,
        },
        { timeout: 2000 }
      );
    } catch (err) {
      // Local copy is updated
    }
  };

  const getPoster = (fav) => {
    const movie = fav.movie || fav.movieData || {};
    const movieName = fav.movieName || movie.movieName || "";

    const matched = mockMovies.find(
      (m) => m.movieName.toLowerCase() === movieName.toLowerCase()
    );
    if (matched?.coverImage) return matched.coverImage;
    if (matched?.bannerImage) return matched.bannerImage;

    if (movie.coverImage) return movie.coverImage;
    if (movie.bannerImage) return movie.bannerImage;
    if (movie.media) {
      if (typeof movie.media === "string") return movie.media;
      return movie.media[0]?.url || movie.media;
    }
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";
  };

  return (
    <div className="favoritesPage">
      <Header />

      <main className="favoritesContainer">
        <div className="favHeader">
          <div className="titleCluster">
            <span className="eyebrow">SAVED BLOCKBUSTERS</span>
            <h1>My Watchlist</h1>
          </div>
          <span className="countBadge">{favorites.length} Saved</span>
        </div>

        {loading ? (
          <Loader />
        ) : favorites.length === 0 ? (
          <div className="emptyWatchlist">
            <FaHeart className="emptyIcon" />
            <h3>Your Watchlist is Empty</h3>
            <p>Save movies you want to watch so you never miss their premiere in theatres.</p>
            <Link to="/home" className="btnExplore">
              <FaFilm /> Browse Current Movies
            </Link>
          </div>
        ) : (
          <div className="favGrid">
            {favorites.map((fav) => {
              const movie = fav.movie || fav.movieData || {};
              const movieName = fav.movieName || movie.movieName || "Movie";
              const movieId = fav.movieId || movie._id || movieName;
              const poster = getPoster(fav);

              return (
                <div key={movieId} className="favCard">
                  <div className="favPosterWrap">
                    <img src={poster} alt={movieName} />
                    <button
                      className="btnRemoveFav"
                      title="Remove from watchlist"
                      onClick={() => handleRemove(movieId, movieName)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>

                  <div className="favDetails">
                    <h3 className="movieTitle">{movieName}</h3>
                    <div className="metaRow">
                      <span className="rating">
                        <FaStar /> {movie.rating || 8.8}
                      </span>
                      <span className="runtime">{movie.duration || "2h 30m"}</span>
                    </div>

                    <div className="btnRow">
                      <Link
                        to={`/shows/${encodeURIComponent(movieName)}`}
                        className="btnBook"
                      >
                        <FaTicketAlt /> Book Tickets
                      </Link>
                      <Link
                        to={`/movie/${encodeURIComponent(movieName)}`}
                        className="btnDetails"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FavoriteShows;
