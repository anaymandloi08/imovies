import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaTicketAlt,
  FaShieldAlt,
  FaFilm,
  FaStar,
  FaBolt,
  FaQrcode,
  FaCheckCircle,
} from "react-icons/fa";
import { mockMovies } from "../../data/mockData";
import TrailerModal from "../../components/trailer/TrailerModal";
import "./style.scss";

const Landing = () => {
  const navigate = useNavigate();
  const [trailerMovie, setTrailerMovie] = useState(null);

  return (
    <div className="landingPage">
      <div className="overlay"></div>

      <header className="landingHeader">
        <div className="brand">
          <span className="brandI">i</span>
          <span className="brandMovies">Movies</span>
          <span className="brandTag">CINEMA</span>
        </div>
        <div className="headerActions">
          <Link to="/home" className="btnNavBrowse">
            <FaFilm /> Browse
          </Link>
          <Link to="/login" className="btnNavLogin">
            Sign In
          </Link>
          <Link to="/admin/login" className="btnNavAdmin">
            <FaShieldAlt /> Admin
          </Link>
        </div>
      </header>

      <main className="landingHero">
        <div className="heroContent">
          <div className="eyebrowBadge">
            <span className="pingDot"></span> PREMIER CINEMA EXPERIENCE
          </div>

          <h1 className="heroTitle">
            Movie Ticket Booking <br />
            <span className="gradientText">Made Simple & Seamless.</span>
          </h1>

          <p className="heroSubtitle">
            Reserve premium IMAX, 4K Dolby Atmos, and Balcony Recliner seats in seconds. Instant QR digital boarding passes delivered directly to your device.
          </p>

          <div className="ctaButtons">
            <Link to="/home" className="btnCtaPrimary">
              <FaFilm className="btnIcon" /> Browse All Movies
            </Link>
            <Link to="/register" className="btnCtaSecondary">
              <FaTicketAlt className="btnIcon" /> Get Started Free
            </Link>
          </div>

          {/* Interactive Live Metrics Bar */}
          <div className="metricsBar">
            <div className="metricItem">
              <span className="metricVal">50,000+</span>
              <span className="metricLabel">Tickets Reserved</span>
            </div>
            <div className="metricDivider"></div>
            <div className="metricItem">
              <span className="metricVal">150+</span>
              <span className="metricLabel">IMAX & Dolby Screens</span>
            </div>
            <div className="metricDivider"></div>
            <div className="metricItem">
              <span className="metricVal">100%</span>
              <span className="metricLabel">Instant Digital Passes</span>
            </div>
            <div className="metricDivider"></div>
            <div className="metricItem">
              <span className="metricVal">4.9 ★</span>
              <span className="metricLabel">Customer Rating</span>
            </div>
          </div>
        </div>

        {/* Featured Blockbuster Strip */}
        <section className="nowPlayingPreview">
          <div className="previewHeader">
            <h3>Now Playing In Theatres</h3>
            <Link to="/home" className="viewAllLink">
              View All Screenings →
            </Link>
          </div>

          <div className="previewCardsGrid">
            {mockMovies.map((movie) => (
              <div
                key={movie.movieId || movie._id}
                className="previewCard"
                onClick={() => navigate(`/shows/${encodeURIComponent(movie.movieName)}`)}
              >
                <div className="cardPoster">
                  <img src={movie.coverImage || movie.bannerImage} alt={movie.movieName} />
                  <div className="posterGlow"></div>
                  <button
                    className="btnPlayTrailer"
                    title="Watch Official Trailer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrailerMovie(movie);
                    }}
                  >
                    <FaPlay />
                  </button>
                  <span className="ratingBadge">
                    <FaStar /> {movie.rating}
                  </span>
                </div>
                <div className="cardInfo">
                  <h4>{movie.movieName}</h4>
                  <p>{movie.genres.slice(0, 2).join(" • ")} • {movie.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Proposition Highlights */}
        <section className="featuresGrid">
          <div className="featureCard">
            <div className="featureIcon red">
              <FaTicketAlt />
            </div>
            <h4>Real-Time Seat Locking</h4>
            <p>
              Interactive seating plans with real-time seat locks across Balcony, Middle, and Lower tiers.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon blue">
              <FaQrcode />
            </div>
            <h4>Instant QR Passes</h4>
            <p>
              Skip box-office queues entirely with digital gate passes ready on your smartphone.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon gold">
              <FaBolt />
            </div>
            <h4>Atmos & IMAX Sound</h4>
            <p>
              Certified acoustic engineering with multi-screen venues across your favourite city multiplexes.
            </p>
          </div>
        </section>
      </main>

      <footer className="landingFooter">
        <p>© {new Date().getFullYear()} iMovies Inc. Movie ticket booking made simple.</p>
        <div className="footerLinks">
          <Link to="/home">Movies</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/admin/login">Admin</Link>
        </div>
      </footer>

      {/* Trailer Modal Popup */}
      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}
    </div>
  );
};

export default Landing;
