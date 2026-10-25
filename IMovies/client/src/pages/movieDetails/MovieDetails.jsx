import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import { FaStar, FaClock, FaCalendarAlt, FaHeart, FaTicketAlt, FaCommentAlt, FaArrowLeft } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import useFetch from "../../hooks/useFetch";
import { render } from "../../host";
import "./style.scss";

const MovieDetails = () => {
  const { movieName } = useParams();
  const navigate = useNavigate();
  const { resData, loading, error } = useFetch(`/api/movie/getmovie/${encodeURIComponent(movieName)}`);
  const movie = resData?.movie;

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (movie?._id) {
      axios
        .get(`${render}/api/reviews/${movie._id}`)
        .then((res) => {
          if (res.data.success) {
            setReviews(res.data.reviews || []);
          }
        })
        .catch(() => {});
    }
  }, [movie]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please sign in to post a review");
      navigate("/login");
      return;
    }
    const user = JSON.parse(rawUser);

    setSubmittingReview(true);
    try {
      const res = await axios.post(`${render}/api/reviews/add`, {
        movieId: movie._id,
        userEmail: user.email,
        username: user.username,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      if (res.data.success) {
        toast.success("Review submitted!");
        setReviews([res.data.review, ...reviews]);
        setNewReview({ rating: 5, comment: "" });
      }
    } catch (err) {
      toast.error("Failed to post review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleFavorite = async () => {
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please sign in to add to favorites");
      navigate("/login");
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

  if (loading) {
    return (
      <div className="movieDetailsPage">
        <Header />
        <Loader />
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movieDetailsPage">
        <Header />
        <div className="notFoundContainer">
          <h2>Movie not found</h2>
          <p>{error || "We couldn't locate this movie."}</p>
          <Link to="/home" className="btnBack">Back to Movies</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const posterImg = typeof movie.media === "string" ? movie.media : movie.media?.[0]?.url || "/default-movie.png";

  return (
    <div className="movieDetailsPage">
      <Header />

      <div className="movieHeroBackdrop" style={{ backgroundImage: `url(${posterImg})` }}>
        <div className="backdropOverlay"></div>
        <div className="backdropContent">
          <button onClick={() => navigate(-1)} className="btnGoBack">
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>

      <main className="movieMainContainer">
        <div className="movieHeaderGrid">
          <div className="posterColumn">
            <img src={posterImg} alt={movie.movieName} className="moviePosterImg" />
          </div>

          <div className="infoColumn">
            <div className="badgeLine">
              <span className="cert">{movie.certification || "UA"}</span>
              <span className="lang">{movie.language || "English"}</span>
            </div>

            <h1 className="movieTitle">{movie.movieName}</h1>

            <div className="metaStats">
              <div className="statItem">
                <FaStar className="star" />
                <span className="bold">{movie.rating || "8.5"}</span>
                <span className="dim">/10 IMDB</span>
              </div>
              <div className="statItem">
                <FaClock className="icon" />
                <span>{movie.runtime || 120} Minutes</span>
              </div>
              <div className="statItem">
                <FaCalendarAlt className="icon" />
                <span>{dayjs(movie.releaseDate).format("MMMM D, YYYY")}</span>
              </div>
            </div>

            <div className="genreChips">
              {(movie.genres || []).map((genre, idx) => (
                <span key={idx} className="genreChip">{genre}</span>
              ))}
            </div>

            <div className="synopsisBox">
              <h3>Synopsis</h3>
              <p>{movie.description}</p>
            </div>

            <div className="ctaActionRow">
              <Link to={`/shows/${encodeURIComponent(movie.movieName)}`} className="btnBookTickets">
                <FaTicketAlt /> Book Tickets & Showtimes
              </Link>
              <button onClick={handleFavorite} className="btnWatchlist">
                <FaHeart /> Add to Watchlist
              </button>
            </div>
          </div>
        </div>

        {/* Video Trailer */}
        {movie.trailerUrl && (
          <section className="trailerSection">
            <h2>Official Trailer</h2>
            <div className="videoEmbed">
              <iframe
                src={
                  movie.trailerUrl.includes("youtube.com/watch?v=")
                    ? movie.trailerUrl.replace("watch?v=", "embed/")
                    : movie.trailerUrl
                }
                title={movie.movieName}
                allowFullScreen
              ></iframe>
            </div>
          </section>
        )}

        {/* Reviews & Ratings (Epic/Story #8) */}
        <section className="reviewsSection">
          <h2>Audience Reviews & Ratings</h2>

          <div className="reviewsGrid">
            <div className="addReviewCard">
              <h3>Leave a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="formField">
                  <label>Your Rating (1 to 5 Stars)</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 - Masterpiece)</option>
                    <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value="3">⭐⭐⭐ (3 - Decent)</option>
                    <option value="2">⭐⭐ (2 - Below Average)</option>
                    <option value="1">⭐ (1 - Poor)</option>
                  </select>
                </div>

                <div className="formField">
                  <label>Your Review</label>
                  <textarea
                    rows={4}
                    placeholder="What did you think of the story, acting, and visuals?"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btnSubmitReview" disabled={submittingReview}>
                  {submittingReview ? "Posting..." : "Submit Review"}
                </button>
              </form>
            </div>

            <div className="reviewsList">
              {reviews.length === 0 ? (
                <div className="noReviews">
                  <FaCommentAlt className="dimIcon" />
                  <p>No reviews yet. Be the first to review this movie!</p>
                </div>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} className="reviewItem">
                    <div className="reviewHead">
                      <span className="reviewerName">{r.username || r.userEmail}</span>
                      <span className="reviewStars">
                        {"★".repeat(r.rating || 5)}{"☆".repeat(5 - (r.rating || 5))}
                      </span>
                    </div>
                    <p className="reviewComment">{r.comment}</p>
                    <span className="reviewDate">{dayjs(r.createdAt).format("MMM D, YYYY")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MovieDetails;
