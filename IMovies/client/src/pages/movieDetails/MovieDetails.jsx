import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaHeart,
  FaTicketAlt,
  FaCommentAlt,
  FaArrowLeft,
  FaPlay,
  FaUserCircle,
} from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import useFetch from "../../hooks/useFetch";
import { render } from "../../host";
import { mockMovies } from "../../data/mockData";
import TrailerModal from "../../components/trailer/TrailerModal";
import "./style.scss";

const MovieDetails = () => {
  const { movieName } = useParams();
  const navigate = useNavigate();
  const decodedMovieName = decodeURIComponent(movieName || "");

  const { resData, loading, error } = useFetch(
    `/api/movie/getmovie/${encodeURIComponent(decodedMovieName)}`
  );

  const rawMovie = resData?.movie;

  // Fallback to mockMovies if API is offline or not found
  const movie =
    rawMovie ||
    mockMovies.find(
      (m) => m.movieName.toLowerCase() === decodedMovieName.toLowerCase()
    ) ||
    mockMovies[0];

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!movie) return;

    // Check if in watchlist
    try {
      const favs = JSON.parse(localStorage.getItem("imovies_favorites") || "[]");
      const inFav = favs.some(
        (f) =>
          f.movieId === movie._id ||
          f.movieName?.toLowerCase() === movie.movieName?.toLowerCase()
      );
      setIsFavorite(inFav);
    } catch (e) {
      // ignore
    }

    // Load reviews
    const localReviews = JSON.parse(
      localStorage.getItem(`imovies_reviews_${movie._id || movie.movieName}`) || "[]"
    );

    if (movie._id) {
      axios
        .get(`${render}/api/reviews/${movie._id}`, { timeout: 2500 })
        .then((res) => {
          if (res.data.success) {
            setReviews([...(res.data.reviews || []), ...localReviews]);
          } else {
            setReviews(localReviews);
          }
        })
        .catch(() => {
          setReviews(localReviews);
        });
    } else {
      setReviews(localReviews);
    }
  }, [movie]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      toast.error("Please enter your thoughts before submitting.");
      return;
    }

    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please sign in to post a review");
      navigate("/login");
      return;
    }
    const user = JSON.parse(rawUser);

    setSubmittingReview(true);
    const reviewObj = {
      _id: "rev-" + Date.now(),
      movieId: movie._id || movie.movieName,
      userEmail: user.email,
      username: user.username || "Movie Fan",
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local save
    const key = `imovies_reviews_${movie._id || movie.movieName}`;
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    saved.unshift(reviewObj);
    localStorage.setItem(key, JSON.stringify(saved));
    setReviews([reviewObj, ...reviews]);
    setNewReview({ rating: 5, comment: "" });
    toast.success("Review posted successfully!");

    try {
      await axios.post(
        `${render}/api/reviews/add`,
        {
          movieId: movie._id,
          userEmail: user.email,
          username: user.username,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        { timeout: 2000 }
      );
    } catch (err) {
      // local copy is already saved
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleFavorite = async () => {
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please sign in to add to your watchlist");
      navigate("/login");
      return;
    }
    const user = JSON.parse(rawUser);

    const favs = JSON.parse(localStorage.getItem("imovies_favorites") || "[]");
    const movieId = movie._id || movie.movieName;

    if (isFavorite) {
      const updated = favs.filter(
        (f) => f.movieId !== movieId && f.movieName !== movie.movieName
      );
      localStorage.setItem("imovies_favorites", JSON.stringify(updated));
      setIsFavorite(false);
      toast.info(`Removed ${movie.movieName} from Watchlist`);
    } else {
      favs.push({
        movieId,
        movieName: movie.movieName,
        movieData: movie,
        userEmail: user.email,
      });
      localStorage.setItem("imovies_favorites", JSON.stringify(favs));
      setIsFavorite(true);
      toast.success(`Added ${movie.movieName} to Watchlist!`);
    }

    try {
      await axios.post(
        `${render}/api/favorite/add`,
        {
          userEmail: user.email,
          movieId,
          movieData: movie,
        },
        { timeout: 2000 }
      );
    } catch (err) {
      // handled locally
    }
  };

  if (loading && !movie) {
    return (
      <div className="movieDetailsPage">
        <Header />
        <Loader />
        <Footer />
      </div>
    );
  }

  const posterImg =
    movie.coverImage ||
    movie.bannerImage ||
    (typeof movie.media === "string" ? movie.media : movie.media?.[0]?.url) ||
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";

  const bannerImg =
    movie.bannerImage ||
    movie.coverImage ||
    (typeof movie.media === "string" ? movie.media : movie.media?.[0]?.url) ||
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80";

  return (
    <div className="movieDetailsPage">
      <Header />

      {/* Hero Backdrop */}
      <div
        className="movieHeroBackdrop"
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        <div className="heroBackdropOverlay"></div>

        <div className="heroContentContainer">
          <button onClick={() => navigate(-1)} className="btnBackNav">
            <FaArrowLeft /> Back
          </button>

          <div className="mainPresentation">
            <div className="posterCard">
              <img src={posterImg} alt={movie.movieName} />
              <button
                className={`btnFavPoster ${isFavorite ? "active" : ""}`}
                onClick={handleFavorite}
                title={isFavorite ? "In Watchlist" : "Add to Watchlist"}
              >
                <FaHeart />
              </button>
            </div>

            <div className="infoBlock">
              <div className="badgeRow">
                <span className="imaxTag">IMAX 4K</span>
                <span className="certTag">UA 16+</span>
              </div>

              <h1 className="title">{movie.movieName}</h1>

              <div className="metaRow">
                <span className="ratingBadge">
                  <FaStar /> {movie.rating || 8.8}/10
                </span>
                <span className="runtime">
                  <FaClock /> {movie.duration || `${movie.runtime || 140}m`}
                </span>
                <span className="releaseDate">
                  <FaCalendarAlt />{" "}
                  {movie.releaseDate
                    ? dayjs(movie.releaseDate).format("MMMM YYYY")
                    : "Now Showing"}
                </span>
              </div>

              <div className="genresRow">
                {(movie.genres || []).map((g, idx) => (
                  <span key={idx} className="genrePill">
                    {g}
                  </span>
                ))}
              </div>

              <p className="description">{movie.description}</p>

              {movie.director && (
                <p className="director">
                  <strong>Director:</strong> {movie.director}
                </p>
              )}

              {movie.cast && Array.isArray(movie.cast) && (
                <p className="cast">
                  <strong>Starring:</strong> {movie.cast.join(", ")}
                </p>
              )}

              <div className="actionRow">
                <Link
                  to={`/shows/${encodeURIComponent(movie.movieName)}`}
                  className="btnBookTickets"
                >
                  <FaTicketAlt /> Select Seats & Book Tickets
                </Link>

                {movie.trailerLink && (
                  <button
                    className="btnTrailerHero"
                    onClick={() => setTrailerMovie(movie)}
                  >
                    <FaPlay /> Official Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details & Reviews Section */}
      <main className="detailsBody">
        <div className="detailsSectionsGrid">
          {/* Left Column: Reviews & Ratings */}
          <div className="reviewsColumn">
            <div className="sectionHeader">
              <h3>
                <FaCommentAlt /> Audience Reviews & Ratings
              </h3>
              <span className="reviewCount">{reviews.length} Reviews</span>
            </div>

            {/* Post Review Form */}
            <form onSubmit={handleReviewSubmit} className="reviewForm">
              <h4>Write a Review</h4>
              <div className="ratingSelector">
                <span>Rating:</span>
                <div className="starsGroup">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      className={`starBtn ${
                        newReview.rating >= starVal ? "selected" : ""
                      }`}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: starVal })
                      }
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
                <span className="ratingNumber">{newReview.rating}/5</span>
              </div>

              <textarea
                placeholder="Share what you liked about the story, performances, and cinematography..."
                rows="3"
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
              ></textarea>

              <button
                type="submit"
                className="btnSubmitReview"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>

            {/* Reviews List */}
            <div className="reviewsList">
              {reviews.length === 0 ? (
                <div className="noReviews">
                  <p>Be the first cinema fan to review {movie.movieName}!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="reviewCard">
                    <div className="reviewTop">
                      <div className="userCluster">
                        <FaUserCircle className="userIcon" />
                        <span className="reviewerName">
                          {rev.username || rev.userEmail || "Cinema Fan"}
                        </span>
                      </div>
                      <div className="reviewRating">
                        {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                    </div>
                    <p className="reviewComment">{rev.comment}</p>
                    <span className="reviewDate">
                      {rev.createdAt
                        ? dayjs(rev.createdAt).format("MMM D, YYYY")
                        : "Verified Audience"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Cinema Experience Info */}
          <div className="cinemaDetailsColumn">
            <div className="cinemaFeatureCard">
              <h4>Cinema Technology</h4>
              <div className="techList">
                <div className="techItem">
                  <strong>IMAX with Laser</strong>
                  <p>Crystal-clear 4K projection with unparalleled brightness.</p>
                </div>
                <div className="techItem">
                  <strong>Dolby Atmos 7.1</strong>
                  <p>Object-based multi-dimensional audio surrounds you.</p>
                </div>
                <div className="techItem">
                  <strong>Balcony VIP Recliners</strong>
                  <p>Extra-wide plush leather recliners with in-seat food service.</p>
                </div>
              </div>
            </div>

            <div className="quickBookingPrompt">
              <h4>Ready to watch?</h4>
              <p>Tickets are selling fast for upcoming weekend screenings.</p>
              <Link
                to={`/shows/${encodeURIComponent(movie.movieName)}`}
                className="btnQuickBook"
              >
                <FaTicketAlt /> View Showtime Schedule
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Trailer Modal */}
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

export default MovieDetails;
