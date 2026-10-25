import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTicketAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaQrcode, FaTrashAlt, FaFilm } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import { render } from "../../host";
import "./style.scss";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      setLoading(false);
      return;
    }
    const user = JSON.parse(rawUser);

    try {
      const res = await axios.get(`${render}/api/bookings/userbookings/${encodeURIComponent(user.email)}`);
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      toast.error("Failed to load your reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? The seats will be released.")) {
      return;
    }

    try {
      const res = await axios.delete(`${render}/api/bookings/cancelbooking/${bookingId}`);
      if (res.data.success) {
        toast.success("Booking cancelled and seats released successfully.");
        fetchBookings();
      }
    } catch (err) {
      toast.error("Failed to cancel booking");
    }
  };

  const getPoster = (b) => {
    if (b.movieDetails?.media) {
      if (typeof b.movieDetails.media === "string") return b.movieDetails.media;
      return b.movieDetails.media[0]?.url || b.movieDetails.media;
    }
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";
  };

  return (
    <div className="userBookingsPage">
      <Header />

      <main className="bookingsContainer">
        <div className="bookingsHeader">
          <div className="titleCluster">
            <span className="eyebrow">MY CINEMA PASSES</span>
            <h1>Your Booking History</h1>
          </div>
          <Link to="/home" className="btnNewBooking">
            <FaTicketAlt /> Book More Tickets
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <div className="noBookingsCard">
            <FaTicketAlt className="ticketEmptyIcon" />
            <h3>No Active Reservations</h3>
            <p>You haven't reserved any movie tickets yet. Explore current releases and select your seats!</p>
            <Link to="/home" className="btnBrowse">
              Browse Movies Now
            </Link>
          </div>
        ) : (
          <div className="ticketsGrid">
            {bookings.map((b) => {
              const movieName = b.ticketsData?.movieName || b.movieDetails?.movieName || "Movie";
              const theatreName = b.ticketsData?.theatreName || b.theatreDetails?.theatreName || "PVR Cinemas";
              const showdate = b.ticketsData?.showdate || b.showDetails?.showdate;
              const showtime = b.ticketsData?.showtime || b.showDetails?.showtime;
              const seats = b.ticketsData?.seats || [];
              const totalPrice = b.ticketsData?.totalPrice || 0;

              return (
                <div key={b.bookingId} className="ticketCard">
                  <div className="ticketPoster">
                    <img src={getPoster(b)} alt={movieName} />
                  </div>

                  <div className="ticketMain">
                    <div className="ticketStatusRow">
                      <span className="badgeConfirmed">CONFIRMED</span>
                      <span className="bookingId">ID: {b.bookingId}</span>
                    </div>

                    <h2 className="movieTitle">{movieName}</h2>

                    <div className="theatreRow">
                      <FaMapMarkerAlt className="icon" /> {theatreName}
                    </div>

                    <div className="showTimingRow">
                      <div className="timeItem">
                        <FaCalendarAlt className="icon" />
                        <span>{showdate ? dayjs(showdate).format("ddd, MMM D, YYYY") : "Today"}</span>
                      </div>
                      <div className="timeItem">
                        <FaClock className="icon" />
                        <span>{showtime || "Standard"}</span>
                      </div>
                    </div>

                    <div className="seatsRow">
                      <span className="seatsLabel">Reserved Seats:</span>
                      <div className="seatBadges">
                        {seats.map((seat) => (
                          <span key={seat} className="seatPill">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="ticketFooter">
                      <div className="priceCluster">
                        <span className="priceLabel">Total Paid</span>
                        <span className="priceVal">₹{totalPrice}</span>
                      </div>

                      <div className="actionCluster">
                        <Link
                          to={`/movie/${encodeURIComponent(movieName)}`}
                          className="btnReview"
                        >
                          Write Review
                        </Link>
                        <button
                          onClick={() => handleCancelBooking(b.bookingId)}
                          className="btnCancel"
                          title="Cancel Booking & Refund"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="ticketPerforation">
                    <div className="notch top"></div>
                    <div className="dashedLine"></div>
                    <div className="notch bottom"></div>
                  </div>

                  <div className="ticketStub">
                    <div className="qrWrapper">
                      <FaQrcode className="qrGraphic" />
                    </div>
                    <span className="scanText">SCAN AT CINEMA GATE</span>
                    <span className="admitCount">ADMIT {seats.length}</span>
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

export default Bookings;
