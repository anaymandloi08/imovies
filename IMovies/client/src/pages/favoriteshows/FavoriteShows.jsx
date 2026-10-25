import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaHeart, FaTicketAlt, FaTrashAlt, FaStar } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import { render } from "../../host";
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
      const res = await axios.get(`${render}/api/favorite/userfavorites/${encodeURIComponent(user.email)}`);
      if (res.data.success) {
        setFavorites(res.data.favorites || []);
      }
    } catch (err) {
      console.error("Fetch favorites error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (movieId) => {
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) return;
    const user = JSON.parse(rawUser);

    try {
      const res = await axios.post(`${render}/api/favorite/remove`, {
        userEmail: user.email,
        movieId,
      });
      if (res.data.success) {
        toast.info("Removed from watchlist");
        setFavorites(favorites.filter((f) => f.movieId !== movieId));
      }
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const getPoster = (fav) => {
    const movie = fav.movie || fav.movieData || {};
    if (movie.media) {
      if (typeof movie.media === "string") return movie.media;
      return movie.media[0]?.url || movie.media;
    }
    return "/default-movie.png";
  };

  return (
    <div className="favoriteShowsPage">
      <Header />

      <main className="favoritesContainer">
        <div className="favoritesHeader">
          <div className="titleArea">
            <span className="eyebrow">SAVED FOR LATER</span>
            <h1>My Watchlist</h1>
          </div>
          <Link to="/home" className="btnDiscover">
            Explore More
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : favorites.length === 0 ? (
          <div className="emptyWatchlist">
            <FaHeart className="emptyHeartIcon" />
            <h3>Your Watchlist is Empty</h3>
            <p>Save upcoming movies or blockbusters you want to watch soon.</p>
            <Link to="/home" className="btnExploreMovies">
              Browse Current Movies
            </Link>
          </div>
        ) : (
          <div className="favoritesGrid">
            {favorites.map((fav) => {
              const movie = fav.movie || fav.movieData || {};
              const movieName = movie.movieName || fav.movieId;

              return (
                <div key={fav._id} className="favCard">
                  <div className="favPoster">
                    <img src={getPoster(fav)} alt={movieName} />
                    <button
                      className="btnRemoveFav"
                      title="Remove from Watchlist"
                      onClick={() => handleRemove(fav.movieId)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>

                  <div className="favDetails">
                    <div className="metaRow">
                      <span className="rating">
                        <FaStar /> {movie.rating || 8.5}
                      </span>
                      <span className="cert">{movie.certification || "UA"}</span>
                    </div>

                    <h3 className="movieTitle">{movieName}</h3>
                    <p className="desc">{movie.description || "Exciting cinematic experience."}</p>

                    <div className="cardActions">
                      <Link
                        to={`/shows/${encodeURIComponent(movieName)}`}
                        className="btnBook"
                      >
                        <FaTicketAlt /> Book Tickets
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
