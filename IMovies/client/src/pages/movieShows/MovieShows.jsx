import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { BiCameraMovie } from "react-icons/bi";
import { TbMovieOff } from "react-icons/tb";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTicketAlt,
  FaArrowLeft,
  FaStar,
  FaShieldAlt,
  FaPlay,
} from "react-icons/fa";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import useFetch from "../../hooks/useFetch";
import { mockMovies } from "../../data/mockData";
import TrailerModal from "../../components/trailer/TrailerModal";
import "./style.scss";

const MovieShows = () => {
  const navigate = useNavigate();
  const { movieName } = useParams();
  const decodedMovieName = decodeURIComponent(movieName || "");

  const { resData, loading, error } = useFetch(
    `/api/shows/getmovieshows/${encodeURIComponent(decodedMovieName)}`
  );

  const [selectedDate, setSelectedDate] = useState("All");
  const [trailerMovie, setTrailerMovie] = useState(null);

  const showsData = resData?.data?.showData || [];

  // Match movie info
  const movieInfo = useMemo(() => {
    return (
      mockMovies.find(
        (m) => m.movieName.toLowerCase() === decodedMovieName.toLowerCase()
      ) ||
      showsData[0]?.movieDetails || {
        movieName: decodedMovieName,
        rating: 8.8,
        duration: "2h 30m",
        genres: ["Cinema", "Premiere"],
        description: "Experience this cinematic marvel on IMAX and Dolby Atmos screens.",
      }
    );
  }, [decodedMovieName, showsData]);

  // Sort shows chronologically
  const sortedShows = useMemo(() => {
    const arr = [...showsData];
    arr.sort((a, b) => {
      const datetimeA = new Date((a.showdate || "") + "T" + (a.showtime || "") + "Z");
      const datetimeB = new Date((b.showdate || "") + "T" + (b.showtime || "") + "Z");
      return datetimeA - datetimeB;
    });
    return arr;
  }, [showsData]);

  function convertTo12HourFormat(time24) {
    if (!time24) return "";
    const [hoursStr, minutes] = time24.split(":");
    let hours = parseInt(hoursStr, 10);
    const meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${meridiem}`;
  }

  // Extract unique available dates
  const uniqueDates = useMemo(() => {
    const dates = ["All"];
    sortedShows.forEach((s) => {
      if (s.showdate && !dates.includes(s.showdate)) {
        dates.push(s.showdate);
      }
    });
    return dates;
  }, [sortedShows]);

  // Filter shows by date
  const filteredShows = useMemo(() => {
    return sortedShows.filter((s) => {
      return selectedDate === "All" || s.showdate === selectedDate;
    });
  }, [sortedShows, selectedDate]);

  // Group shows by Theatre
  const showsByTheatre = useMemo(() => {
    return filteredShows.reduce((acc, show) => {
      const theatre = show.theatreName || "PVR Cinemas: Grand Mall";
      if (!acc[theatre]) {
        acc[theatre] = [];
      }
      acc[theatre].push(show);
      return acc;
    }, {});
  }, [filteredShows]);

  return (
    <div className="movieShowsPage">
      <Header />

      {/* Movie Showcase Banner */}
      <section
        className="movieShowsBanner"
        style={{
          backgroundImage: `url(${movieInfo.bannerImage || movieInfo.coverImage || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80"})`,
        }}
      >
        <div className="bannerOverlay"></div>
        <div className="bannerContent">
          <button onClick={() => navigate(-1)} className="btnBackNav">
            <FaArrowLeft /> Back to Cinema
          </button>

          <div className="movieMetaCluster">
            <div className="posterThumb">
              <img
                src={movieInfo.coverImage || movieInfo.bannerImage || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80"}
                alt={movieInfo.movieName}
              />
            </div>

            <div className="movieDetailsInfo">
              <div className="badgeRow">
                <span className="imaxBadge">IMAX Experience</span>
                <span className="certBadge">UA 16+</span>
              </div>
              <h1 className="movieTitle">{movieInfo.movieName}</h1>
              <div className="metaRow">
                <span className="ratingBadge">
                  <FaStar /> {movieInfo.rating || 8.8}/10
                </span>
                <span className="runtimeBadge">
                  <FaClock /> {movieInfo.duration || "2h 30m"}
                </span>
                <span className="genres">
                  {(movieInfo.genres || []).join(" • ")}
                </span>
              </div>
              <p className="synopsis">{movieInfo.description}</p>

              {movieInfo.trailerLink && (
                <button
                  className="btnTrailer"
                  onClick={() => setTrailerMovie(movieInfo)}
                >
                  <FaPlay /> Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="showsMainContainer">
        {/* Date Filter Tabs Bar */}
        <div className="dateFilterBar">
          <span className="filterLabel">
            <FaCalendarAlt /> Screenings Date:
          </span>
          <div className="dateTabs">
            {uniqueDates.map((dateStr) => {
              const isToday =
                dateStr !== "All" &&
                dayjs(dateStr).isSame(dayjs(), "day");
              return (
                <button
                  key={dateStr}
                  className={`dateBtn ${selectedDate === dateStr ? "active" : ""}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  {dateStr === "All"
                    ? "All Dates"
                    : isToday
                    ? `Today (${dayjs(dateStr).format("MMM D")})`
                    : dayjs(dateStr).format("ddd, MMM D")}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error || !showsData || showsData.length === 0 ? (
          <div className="noShowsBox">
            <TbMovieOff className="offIcon" />
            <h3>No Scheduled Screenings Found</h3>
            <p>
              There are currently no active showtimes for "{decodedMovieName}". Please check back tomorrow!
            </p>
            <Link to="/home" className="btnExplore">
              Browse Other Movies
            </Link>
          </div>
        ) : (
          <div className="theatreList">
            {Object.keys(showsByTheatre).map((theatreName) => {
              const shows = showsByTheatre[theatreName];
              const theatreInfo = shows[0]?.theatreDetails;

              return (
                <div key={theatreName} className="theatreCard">
                  <div className="theatreInfo">
                    <div className="theatreHeader">
                      <h3 className="theatreName">{theatreName}</h3>
                      <div className="amenityBadges">
                        <span className="amenity">IMAX Laser</span>
                        <span className="amenity">Dolby Atmos</span>
                        <span className="amenity">Recliner</span>
                      </div>
                    </div>

                    <p className="theatreLoc">
                      <FaMapMarkerAlt />{" "}
                      {theatreInfo?.location || "Downtown Screen 1 (Multiplex)"}
                    </p>

                    <div className="priceTags">
                      <span className="priceBalcony">
                        Balcony: ₹{shows[0]?.tickets?.balconySeatPrice || theatreInfo?.balconySeatPrice || 450}
                      </span>
                      <span className="priceMiddle">
                        Middle: ₹{shows[0]?.tickets?.middleSeatPrice || theatreInfo?.middleSeatPrice || 280}
                      </span>
                      <span className="priceLower">
                        Lower: ₹{shows[0]?.tickets?.lowerSeatPrice || theatreInfo?.lowerSeatPrice || 180}
                      </span>
                    </div>
                  </div>

                  <div className="showtimeSlots">
                    {shows.map((show) => {
                      const formattedTime = convertTo12HourFormat(show.showtime);
                      const bookedCount = (show.tickets?.bookedSeats || []).length;
                      const isFillingFast = bookedCount > 2;

                      return (
                        <button
                          key={show.showId || show._id}
                          className="timeSlotBtn"
                          onClick={() => navigate(`/seats/${show.showId || show._id}`)}
                          title={`${show.showdate} - Reserve seats`}
                        >
                          <span className="slotTime">{formattedTime}</span>
                          <span className="slotDate">
                            {dayjs(show.showdate).format("MMM D")}
                          </span>
                          <span className={`slotStatus ${isFillingFast ? "filling" : "available"}`}>
                            {isFillingFast ? "Almost Full" : "Available"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export default MovieShows;
