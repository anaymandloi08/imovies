import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStar, FaTicketAlt, FaHeart, FaInfoCircle, FaSearch, FaPlay, FaFire } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import MovieDetailsPopup from "../movieDetails/MovieDetailsPopup";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { toast } from "react-toastify";
import { render } from "../../host";
import "./style.scss";

const GENRES = ["All", "Action", "Sci-Fi", "Adventure", "Drama", "Biography", "Crime"];

const Home = () => {
  const navigate = useNavigate();
  const { resData, loading, error } = useFetch("/api/movie/getallmovies");
  const movies = resData?.movies || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [activeMoviePopup, setActiveMoviePopup] = useState(null);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch =
        m.movieName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === "All" ||
        (Array.isArray(m.genres) &&
          m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  const featuredMovie = movies[0];

  const handleFavoriteClick = async (e, movie) => {
    e.stopPropagation();
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
        toast.success(res.data.message || "Added to Watchlist!");
      }
    } catch (err) {
      toast.error("Failed to add to watchlist");
    }
  };

  const getPoster = (media) => {
    if (!media) return "/default-movie.png";
    if (typeof media === "string") return media;
    return media?.[0]?.url || media || "/default-movie.png";
  };

  return (
    <div className="homePage">
      <Header />

      {/* Hero Featured Movie Banner */}
      {featuredMovie && !searchQuery && selectedGenre === "All" && (
        <section
          className="heroBanner"
          style={{ backgroundImage: `url(${getPoster(featuredMovie.media)})` }}
        >
          <div className="heroBackdropOverlay"></div>
          <div className="heroContent">
            <div className="trendingBadge">
              <FaFire /> Featured Premiere
            </div>
            <h1 className="featuredTitle">{featuredMovie.movieName}</h1>
            <div className="featuredMeta">
              <span className="ratingBadge">
                <FaStar /> {featuredMovie.rating || 8.5}/10
              </span>
              <span className="runtimeBadge">{featuredMovie.runtime || 120}m</span>
              <span className="certBadge">{featuredMovie.certification || "UA"}</span>
              <span className="genreList">
                {(featuredMovie.genres || []).join(" • ")}
              </span>
            </div>
            <p className="featuredDesc">{featuredMovie.description}</p>
            <div className="heroActions">
              <Link
                to={`/shows/${encodeURIComponent(featuredMovie.movieName)}`}
                className="btnBookHero"
              >
                <FaTicketAlt /> Book Tickets
              </Link>
              <button
                onClick={() => setActiveMoviePopup(featuredMovie)}
                className="btnInfoHero"
              >
                <FaInfoCircle /> Details
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Movie Gallery */}
      <main className="galleryContainer">
        <div className="filterToolbar">
          <div className="searchBox">
            <FaSearch className="searchIcon" />
            <input
              type="text"
              placeholder="Search movies by title, actor, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="genreTabs">
            {GENRES.map((genre) => (
              <button
                key={genre}
                className={`genreTab ${selectedGenre === genre ? "active" : ""}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="sectionHeader">
          <h2>Available Movies</h2>
          <span className="movieCount">{filteredMovies.length} movies showing</span>
        </div>

        {loading ? (
          <Loader />
        ) : filteredMovies.length === 0 ? (
          <div className="emptyState">
            <p>No movies found matching "{searchQuery || selectedGenre}".</p>
          </div>
        ) : (
          <div className="moviesGrid">
            {filteredMovies.map((movie) => {
              const poster = getPoster(movie.media);
              return (
                <div key={movie._id} className="movieCard">
                  <div
                    className="cardPosterWrap"
                    onClick={() => setActiveMoviePopup(movie)}
                  >
                    <img src={poster} alt={movie.movieName} loading="lazy" />
                    <div className="posterOverlay">
                      <button
                        className="btnQuickView"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMoviePopup(movie);
                        }}
                      >
                        Quick View
                      </button>
                    </div>
                    <span className="cardRating">
                      <FaStar /> {movie.rating || 8.5}
                    </span>
                    <button
                      className="cardFavBtn"
                      title="Add to Watchlist"
                      onClick={(e) => handleFavoriteClick(e, movie)}
                    >
                      <FaHeart />
                    </button>
                  </div>

                  <div className="cardDetails">
                    <div className="cardMetaRow">
                      <span className="cardCert">{movie.certification || "UA"}</span>
                      <span className="cardRuntime">{movie.runtime || 120}m</span>
                    </div>

                    <h3
                      className="cardTitle"
                      onClick={() => navigate(`/movie/${encodeURIComponent(movie.movieName)}`)}
                    >
                      {movie.movieName}
                    </h3>

                    <div className="cardGenres">
                      {(movie.genres || []).slice(0, 3).map((g, i) => (
                        <span key={i} className="genrePill">
                          {g}
                        </span>
                      ))}
                    </div>

                    <div className="cardActionButtons">
                      <Link
                        to={`/shows/${encodeURIComponent(movie.movieName)}`}
                        className="btnCardBook"
                      >
                        <FaTicketAlt /> Book
                      </Link>
                      <Link
                        to={`/movie/${encodeURIComponent(movie.movieName)}`}
                        className="btnCardDetails"
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

      {/* Movie Details Modal Popup */}
      {activeMoviePopup && (
        <MovieDetailsPopup
          movie={activeMoviePopup}
          onClose={() => setActiveMoviePopup(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Home;
