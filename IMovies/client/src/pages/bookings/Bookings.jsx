import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaQrcode,
  FaTrashAlt,
  FaFilm,
  FaPrint,
  FaStar,
} from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import { render } from "../../host";
import { mockMovies } from "../../data/mockData";
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
      const res = await axios.get(
        `${render}/api/bookings/userbookings/${encodeURIComponent(user.email)}`,
        { timeout: 3000 }
      );
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.warn("Fetch bookings network fail, falling back to local storage:", err.message);
      const saved = JSON.parse(localStorage.getItem("imovies_bookings") || "[]");
      const userBookings = saved.filter(
        (b) => b.userEmail === user.email || !b.userEmail
      );
      setBookings(userBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? The seats will be released and refunded."
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(
        `${render}/api/bookings/cancelbooking/${bookingId}`,
        { timeout: 3000 }
      );
      if (res.data.success) {
        toast.success("Booking cancelled and seats released successfully.");
        fetchBookings();
        return;
      }
    } catch (err) {
      // Local fallback
      const saved = JSON.parse(localStorage.getItem("imovies_bookings") || "[]");
      const updated = saved.filter(
        (b) => b.bookingId !== bookingId && b._id !== bookingId
      );
      localStorage.setItem("imovies_bookings", JSON.stringify(updated));
      toast.success("Booking cancelled and seats released successfully.");
      fetchBookings();
    }
  };

  const handlePrintTicket = (bookingId) => {
    window.print();
  };

  const getPoster = (b) => {
    const movieName =
      b.ticketsData?.movieName || b.movieDetails?.movieName || b.movieId || "";
    const matched = mockMovies.find(
      (m) => m.movieName.toLowerCase() === movieName.toLowerCase()
    );
    if (matched?.coverImage) return matched.coverImage;
    if (matched?.bannerImage) return matched.bannerImage;

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
            <span className="eyebrow">CINEMA RESERVATIONS</span>
            <h1>My Booking Passes</h1>
            <p className="subtitle">
              Show your digital QR pass at the entrance scanner for seamless admission.
            </p>
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
            <h3>No Active Cinema Passes</h3>
            <p>
              You haven't reserved any movie tickets yet. Browse what's playing in theatres today and book your preferred seats!
            </p>
            <Link to="/home" className="btnBrowse">
              Browse Movies Now
            </Link>
          </div>
        ) : (
          <div className="ticketsGrid">
            {bookings.map((b) => {
              const movieName =
                b.ticketsData?.movieName ||
                b.movieDetails?.movieName ||
                "Blockbuster Premiere";
              const theatreName =
                b.ticketsData?.theatreName ||
                b.theatreDetails?.theatreName ||
                "PVR Cinemas: Grand Mall";
              const showdate =
                b.ticketsData?.showdate || b.showDetails?.showdate;
              const showtime =
                b.ticketsData?.showtime || b.showDetails?.showtime;
              const seats = b.ticketsData?.seats || [];
              const totalPrice = b.ticketsData?.totalPrice || 0;

              return (
                <div key={b.bookingId || b._id} className="ticketCard">
                  <div className="ticketPoster">
                    <img src={getPoster(b)} alt={movieName} />
                  </div>

                  <div className="ticketMain">
                    <div className="ticketStatusRow">
                      <span className="badgeConfirmed">
                        <span className="badgeDot"></span> ADMISSION CONFIRMED
                      </span>
                      <span className="bookingId">ID: {b.bookingId}</span>
                    </div>

                    <h2 className="movieTitle">{movieName}</h2>

                    <div className="theatreRow">
                      <FaMapMarkerAlt className="icon" /> {theatreName} • Screen 1 (IMAX)
                    </div>

                    <div className="showTimingRow">
                      <div className="timeItem">
                        <FaCalendarAlt className="icon" />
                        <span>
                          {showdate
                            ? dayjs(showdate).format("ddd, MMM D, YYYY")
                            : "Today"}
                        </span>
                      </div>
                      <div className="timeItem">
                        <FaClock className="icon" />
                        <span>{showtime || "Evening Show"}</span>
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
                        <button
                          onClick={() => handlePrintTicket(b.bookingId)}
                          className="btnPrint"
                          title="Print or Save PDF"
                        >
                          <FaPrint /> Print Pass
                        </button>
                        <Link
                          to={`/movie/${encodeURIComponent(movieName)}`}
                          className="btnReview"
                        >
                          <FaStar /> Rate
                        </Link>
                        <button
                          onClick={() => handleCancelBooking(b.bookingId)}
                          className="btnCancel"
                          title="Cancel Reservation"
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
                    <span className="admitCount">
                      ADMIT {seats.length} {seats.length === 1 ? "PERSON" : "PEOPLE"}
                    </span>
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
