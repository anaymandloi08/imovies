import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaTicketAlt,
  FaHeart,
  FaInfoCircle,
  FaSearch,
  FaPlay,
  FaFire,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaFilm,
} from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import MovieDetailsPopup from "../movieDetails/MovieDetailsPopup";
import TrailerModal from "../../components/trailer/TrailerModal";
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
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [watchlistIds, setWatchlistIds] = useState([]);

  // Load user's watchlist from localStorage
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("imovies_favorites") || "[]");
      setWatchlistIds(favs.map((f) => f.movieId || f.movieName));
    } catch (e) {
      // ignore
    }
  }, []);

  // Filter movies based on search and genre
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const title = m.movieName || "";
      const desc = m.description || "";
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === "All" ||
        (Array.isArray(m.genres) &&
          m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  // Featured carousel movies (first 4 movies)
  const carouselMovies = useMemo(() => {
    return movies.slice(0, Math.min(4, movies.length));
  }, [movies]);

  const featuredMovie = carouselMovies[featuredIndex] || movies[0];

  // Auto-cycle hero banner carousel every 7 seconds
  useEffect(() => {
    if (carouselMovies.length <= 1 || searchQuery || selectedGenre !== "All") return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % carouselMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [carouselMovies.length, searchQuery, selectedGenre]);

  const handleNextHero = () => {
    setFeaturedIndex((prev) => (prev + 1) % carouselMovies.length);
  };

  const handlePrevHero = () => {
    setFeaturedIndex((prev) =>
      prev === 0 ? carouselMovies.length - 1 : prev - 1
    );
  };

  const handleFavoriteClick = async (e, movie) => {
    e.stopPropagation();
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please sign in to add to your watchlist");
      return;
    }
    const user = JSON.parse(rawUser);
    const movieId = movie._id || movie.movieName;

    const isAlreadyFav = watchlistIds.includes(movieId) || watchlistIds.includes(movie.movieName);

    // Optimistic UI update
    let updated;
    const existingFavs = JSON.parse(localStorage.getItem("imovies_favorites") || "[]");
    if (isAlreadyFav) {
      updated = existingFavs.filter((f) => (f.movieId || f.movieName) !== movieId && f.movieName !== movie.movieName);
      setWatchlistIds(watchlistIds.filter((id) => id !== movieId && id !== movie.movieName));
      toast.info(`Removed ${movie.movieName} from Watchlist`);
    } else {
      updated = [...existingFavs, { movieId, movieName: movie.movieName, movieData: movie, userEmail: user.email }];
      setWatchlistIds([...watchlistIds, movieId, movie.movieName]);
      toast.success(`Added ${movie.movieName} to Watchlist!`);
    }
    localStorage.setItem("imovies_favorites", JSON.stringify(updated));

    try {
      await axios.post(`${render}/api/favorite/add`, {
        userEmail: user.email,
        movieId,
        movieData: movie,
      }, { timeout: 2000 });
    } catch (err) {
      // Local fallback already handled
    }
  };

  const getPoster = (movie) => {
    if (!movie) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
    if (movie.coverImage) return movie.coverImage;
    if (movie.bannerImage) return movie.bannerImage;
    if (movie.media) {
      if (typeof movie.media === "string") return movie.media;
      return movie.media[0]?.url || movie.media;
    }
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
  };

  const getBanner = (movie) => {
    if (!movie) return "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80";
    if (movie.bannerImage) return movie.bannerImage;
    if (movie.coverImage) return movie.coverImage;
    if (movie.media) {
      if (typeof movie.media === "string") return movie.media;
      return movie.media[0]?.url || movie.media;
    }
    return "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80";
  };

  return (
    <div className="homePage">
      <Header />

      {/* Hero Featured Movie Banner Carousel */}
      {featuredMovie && !searchQuery && selectedGenre === "All" && (
        <section
          className="heroBanner"
          style={{ backgroundImage: `url(${getBanner(featuredMovie)})` }}
        >
          <div className="heroBackdropOverlay"></div>

          <button
            className="carouselNavBtn prev"
            onClick={handlePrevHero}
            aria-label="Previous Featured Movie"
          >
            <FaChevronLeft />
          </button>
          <button
            className="carouselNavBtn next"
            onClick={handleNextHero}
            aria-label="Next Featured Movie"
          >
            <FaChevronRight />
          </button>

          <div className="heroContent">
            <div className="badgeRow">
              <span className="trendingBadge">
                <FaFire /> Featured Premiere
              </span>
              <span className="imaxBadge">IMAX 4K</span>
              <span className="atmosBadge">Dolby Atmos</span>
            </div>

            <h1 className="featuredTitle">{featuredMovie.movieName}</h1>

            <div className="featuredMeta">
              <span className="ratingBadge">
                <FaStar /> {featuredMovie.rating || 8.8}/10
              </span>
              <span className="runtimeBadge">
                {featuredMovie.duration || `${featuredMovie.runtime || 150}m`}
              </span>
              <span className="certBadge">
                {featuredMovie.certification || "UA 16+"}
              </span>
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
                onClick={() => setTrailerMovie(featuredMovie)}
                className="btnTrailerHero"
              >
                <FaPlay /> Watch Trailer
              </button>
              <button
                onClick={() => setActiveMoviePopup(featuredMovie)}
                className="btnInfoHero"
              >
                <FaInfoCircle /> Synopsis
              </button>
            </div>
          </div>

          {/* Carousel Slide Indicators */}
          {carouselMovies.length > 1 && (
            <div className="carouselIndicators">
              {carouselMovies.map((m, idx) => (
                <button
                  key={m._id || idx}
                  className={`dot ${featuredIndex === idx ? "active" : ""}`}
                  onClick={() => setFeaturedIndex(idx)}
                  title={m.movieName}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Movie Gallery */}
      <main className="galleryContainer">
        <div className="filterToolbar">
          <div className="searchBox">
            <FaSearch className="searchIcon" />
            <input
              type="text"
              placeholder="Search by title, director, cast, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btnClearSearch"
                onClick={() => setSearchQuery("")}
                title="Clear Search"
              >
                <FaTimes />
              </button>
            )}
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
          <div className="titleCluster">
            <h2>Now Showing in Theatres</h2>
            <span className="livePill">
              <span className="pingDot"></span> Live Screenings
            </span>
          </div>
          <span className="movieCount">
            {filteredMovies.length} {filteredMovies.length === 1 ? "Movie" : "Movies"} Available
          </span>
        </div>

        {loading ? (
          <Loader />
        ) : filteredMovies.length === 0 ? (
          <div className="emptyState">
            <FaFilm className="emptyIcon" />
            <h3>No Screenings Found</h3>
            <p>We couldn't find any movies matching "{searchQuery || selectedGenre}".</p>
            <button
              className="btnResetFilter"
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="moviesGrid">
            {filteredMovies.map((movie) => {
              const poster = getPoster(movie);
              const isFav =
                watchlistIds.includes(movie._id) ||
                watchlistIds.includes(movie.movieName);

              return (
                <div key={movie._id || movie.movieName} className="movieCard">
                  <div
                    className="cardPosterWrap"
                    onClick={() => setActiveMoviePopup(movie)}
                  >
                    <img src={poster} alt={movie.movieName} loading="lazy" />
                    <div className="posterOverlay">
                      <button
                        className="btnQuickTrailer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrailerMovie(movie);
                        }}
                      >
                        <FaPlay /> Trailer
                      </button>
                      <button
                        className="btnQuickView"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMoviePopup(movie);
                        }}
                      >
                        Synopsis
                      </button>
                    </div>

                    <span className="cardRating">
                      <FaStar /> {movie.rating || 8.8}
                    </span>

                    <button
                      className={`cardFavBtn ${isFav ? "activeFav" : ""}`}
                      title={isFav ? "In Watchlist" : "Add to Watchlist"}
                      onClick={(e) => handleFavoriteClick(e, movie)}
                    >
                      <FaHeart />
                    </button>
                  </div>

                  <div className="cardDetails">
                    <div className="cardMetaRow">
                      <span className="cardCert">
                        {movie.certification || "UA"}
                      </span>
                      <span className="cardRuntime">
                        {movie.duration || `${movie.runtime || 135}m`}
                      </span>
                    </div>

                    <h3
                      className="cardTitle"
                      title={movie.movieName}
                      onClick={() =>
                        navigate(`/movie/${encodeURIComponent(movie.movieName)}`)
                      }
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

      {/* Trailer Modal Popup */}
      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Home;
