import React, { useState } from "react";
import dayjs from "dayjs";
import "./style.scss";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import useFetch from "../../hooks/useFetch";
import { BiCameraMovie } from "react-icons/bi";
import { TbMovieOff } from "react-icons/tb";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaTicketAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams, Link } from "react-router-dom";

const MovieShows = () => {
  const navigate = useNavigate();
  const { movieName } = useParams();
  const { resData, loading, error } = useFetch(
    `/api/shows/getmovieshows/${encodeURIComponent(movieName)}`
  );

  const [selectedDate, setSelectedDate] = useState("All");

  const showsData = resData?.data?.showData;

  showsData?.sort(function (a, b) {
    // Concatenate date and time strings for comparison (from Page 30)
    var datetimeA = new Date(a.showdate + "T" + a.showtime + "Z");
    var datetimeB = new Date(b.showdate + "T" + b.showtime + "Z");

    return datetimeA - datetimeB;
  });

  function convertTo12HourFormat(time24) {
    if (!time24) return "";
    // Split the time string into hours and minutes (from Page 30)
    var [hours, minutes] = time24.split(":");

    // Convert hours to integer
    hours = parseInt(hours);

    // Determine AM or PM
    var meridiem = hours >= 12 ? "PM" : "AM";

    // Adjust hours for 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours) as 12

    // Return the formatted time string
    return hours + ":" + minutes + " " + meridiem;
  }

  // Extract unique available dates
  const uniqueDates = ["All"];
  showsData?.forEach((s) => {
    if (s.showdate && !uniqueDates.includes(s.showdate)) {
      uniqueDates.push(s.showdate);
    }
  });

  // Filter shows by date
  const filteredShows = (showsData || []).filter((s) => {
    return selectedDate === "All" || s.showdate === selectedDate;
  });

  // Group shows by Theatre
  const showsByTheatre = filteredShows.reduce((acc, show) => {
    const theatre = show.theatreName || "Standard Cinema";
    if (!acc[theatre]) {
      acc[theatre] = [];
    }
    acc[theatre].push(show);
    return acc;
  }, {});

  return (
    <div className="movieShowsPage">
      <Header />

      <main className="showsMainContainer">
        <div className="showsHeaderBar">
          <button onClick={() => navigate(-1)} className="btnBack">
            <FaArrowLeft /> Back
          </button>
          <div className="titleArea">
            <span className="subTitle">Select Theatre & Show Time</span>
            <h1 className="movieNameHeading">
              <BiCameraMovie className="movieIcon" /> {decodeURIComponent(movieName)}
            </h1>
          </div>
        </div>

        {/* Date Selector Tabs */}
        {uniqueDates.length > 1 && (
          <div className="dateFilterBar">
            <span className="filterLabel">
              <FaCalendarAlt /> Dates:
            </span>
            <div className="dateTabs">
              {uniqueDates.map((dateStr) => (
                <button
                  key={dateStr}
                  className={`dateBtn ${selectedDate === dateStr ? "active" : ""}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  {dateStr === "All"
                    ? "All Dates"
                    : dayjs(dateStr).format("ddd, MMM D")}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : error || !showsData || showsData.length === 0 ? (
          <div className="noShowsBox">
            <TbMovieOff className="offIcon" />
            <h3>No Scheduled Shows Found</h3>
            <p>
              There are currently no active showtimes for "{decodeURIComponent(movieName)}".
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
                    <h3 className="theatreName">{theatreName}</h3>
                    {theatreInfo?.location && (
                      <p className="theatreLoc">
                        <FaMapMarkerAlt /> {theatreInfo.location}
                      </p>
                    )}
                    <div className="priceTags">
                      <span>Balcony: ₹{shows[0]?.tickets?.balconySeatPrice || theatreInfo?.balconySeatPrice || 350}</span>
                      <span>Middle: ₹{shows[0]?.tickets?.middleSeatPrice || theatreInfo?.middleSeatPrice || 220}</span>
                      <span>Lower: ₹{shows[0]?.tickets?.lowerSeatPrice || theatreInfo?.lowerSeatPrice || 150}</span>
                    </div>
                  </div>

                  <div className="showtimeSlots">
                    {shows.map((show) => {
                      const formattedTime = convertTo12HourFormat(show.showtime);
                      const bookedCount = (show.tickets?.bookedSeats || []).length;

                      return (
                        <button
                          key={show.showId}
                          className="timeSlotBtn"
                          onClick={() => navigate(`/seats/${show.showId}`)}
                          title={`${show.showdate} - Click to select seats`}
                        >
                          <span className="slotTime">{formattedTime}</span>
                          <span className="slotDate">{dayjs(show.showdate).format("MMM D")}</span>
                          <span className="slotAvail">
                            <FaTicketAlt /> Select Seats
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

      <Footer />
    </div>
  );
};

export default MovieShows;
