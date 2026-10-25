import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaLock, FaTicketAlt, FaTv } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import useFetch from "../../hooks/useFetch";
import { render } from "../../host";
import "./style.scss";

const SeatsPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { resData, loading, error, reFetch } = useFetch(`/api/shows/getshow/${showId}`);

  const show = resData?.show;
  const movie = resData?.movie;
  const theatre = resData?.theatre;

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingBooking, setProcessingBooking] = useState(false);

  // Seat pricing
  const prices = useMemo(() => {
    return {
      balcony: show?.tickets?.balconySeatPrice || theatre?.balconySeatPrice || 350,
      middle: show?.tickets?.middleSeatPrice || theatre?.middleSeatPrice || 220,
      lower: show?.tickets?.lowerSeatPrice || theatre?.lowerSeatPrice || 150,
    };
  }, [show, theatre]);

  // Seating definitions
  const balconyRows = ["A", "B"];
  const middleRows = ["C", "D", "E"];
  const lowerRows = ["F", "G"];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const bookedSeats = show?.tickets?.bookedSeats || [];

  const handleSeatClick = (seatCode) => {
    if (bookedSeats.includes(seatCode)) return;

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      if (selectedSeats.length >= 8) {
        toast.warning("You can select a maximum of 8 seats per reservation.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const calculateSeatPrice = (seatCode) => {
    const row = seatCode.charAt(0);
    if (balconyRows.includes(row)) return prices.balcony;
    if (middleRows.includes(row)) return prices.middle;
    return prices.lower;
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + calculateSeatPrice(seat), 0);
  }, [selectedSeats, prices]);

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat to proceed.");
      return;
    }
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please login to complete your booking");
      navigate("/login");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.error("User session expired. Please sign in again.");
      navigate("/login");
      return;
    }
    const user = JSON.parse(rawUser);

    setProcessingBooking(true);
    const newBookingId = `IMV-${uuidv4().slice(0, 8).toUpperCase()}`;

    const ticketsData = {
      seats: selectedSeats,
      totalPrice,
      paymentMethod,
      theatreName: show?.theatreName || theatre?.theatreName,
      movieName: movie?.movieName || show?.movieId,
      showdate: show?.showdate,
      showtime: show?.showtime,
      bookingDate: new Date().toISOString(),
    };

    try {
      const res = await axios.post(`${render}/api/bookings/book`, {
        bookingId: newBookingId,
        userEmail: user.email,
        showId: show?.showId || showId,
        ticketsData,
      });

      if (res.data.success) {
        toast.success("Booking confirmed! Your tickets are ready.");
        setShowPaymentModal(false);
        navigate("/bookings");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Booking failed. Please try again.");
      reFetch();
    } finally {
      setProcessingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="seatsBookingPage">
        <Header />
        <Loader />
        <Footer />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="seatsBookingPage">
        <Header />
        <div className="errorContainer">
          <h2>Show not found</h2>
          <p>{error || "Unable to retrieve seat layout for this show."}</p>
          <button onClick={() => navigate("/home")} className="btnReturn">
            Return to Movies
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const renderSeatRow = (rowLetter, tierName) => {
    return (
      <div key={rowLetter} className="seatRow">
        <span className="rowLabel">{rowLetter}</span>
        <div className="seatsInRow">
          {cols.map((colNum) => {
            const seatCode = `${rowLetter}${colNum}`;
            const isBooked = bookedSeats.includes(seatCode);
            const isSelected = selectedSeats.includes(seatCode);

            let seatClass = "seatAvailable";
            if (isBooked) seatClass = "seatBooked";
            else if (isSelected) seatClass = "seatSelected";

            return (
              <button
                key={seatCode}
                className={`seatButton ${seatClass} tier-${tierName}`}
                onClick={() => handleSeatClick(seatCode)}
                disabled={isBooked}
                title={`${seatCode} - ₹${calculateSeatPrice(seatCode)} (${isBooked ? "Booked" : "Available"})`}
              >
                {colNum}
              </button>
            );
          })}
        </div>
        <span className="rowLabel">{rowLetter}</span>
      </div>
    );
  };

  return (
    <div className="seatsBookingPage">
      <Header />

      <main className="seatsLayoutContainer">
        <div className="topInfoBanner">
          <button onClick={() => navigate(-1)} className="btnBack">
            <FaArrowLeft /> Back
          </button>
          <div className="movieShowMeta">
            <h2>{movie?.movieName || show?.movieId}</h2>
            <p>
              {show.theatreName} | {dayjs(show.showdate).format("dddd, MMM D, YYYY")} at {show.showtime}
            </p>
          </div>
        </div>

        <div className="seatingAndSummaryGrid">
          {/* Main Seating Plan */}
          <div className="screenAndSeatsSection">
            {/* Curved Cinema Screen */}
            <div className="cinemaScreenWrapper">
              <div className="screenCurve"></div>
              <p className="screenNotice">
                <FaTv /> ALL EYES THIS WAY — CINEMA SCREEN
              </p>
            </div>

            {/* Balcony Section */}
            <div className="tierSection">
              <div className="tierHeader">
                <h4>BALCONY SECTION</h4>
                <span className="tierPrice">₹{prices.balcony} per ticket</span>
              </div>
              <div className="rowsBlock">
                {balconyRows.map((r) => renderSeatRow(r, "balcony"))}
              </div>
            </div>

            {/* Middle Section */}
            <div className="tierSection">
              <div className="tierHeader">
                <h4>MIDDLE SECTION</h4>
                <span className="tierPrice">₹{prices.middle} per ticket</span>
              </div>
              <div className="rowsBlock">
                {middleRows.map((r) => renderSeatRow(r, "middle"))}
              </div>
            </div>

            {/* Lower Section */}
            <div className="tierSection">
              <div className="tierHeader">
                <h4>LOWER SECTION</h4>
                <span className="tierPrice">₹{prices.lower} per ticket</span>
              </div>
              <div className="rowsBlock">
                {lowerRows.map((r) => renderSeatRow(r, "lower"))}
              </div>
            </div>

            {/* Seat Legend */}
            <div className="seatLegend">
              <div className="legendItem">
                <span className="legendBox available"></span>
                <span>Available</span>
              </div>
              <div className="legendItem">
                <span className="legendBox selected"></span>
                <span>Selected</span>
              </div>
              <div className="legendItem">
                <span className="legendBox booked"></span>
                <span>Occupied</span>
              </div>
            </div>
          </div>

          {/* Checkout & Summary Sidebar */}
          <aside className="bookingSummaryPanel">
            <h3>Booking Summary</h3>
            <div className="summaryCard">
              <div className="summaryItem">
                <span className="itemLabel">Movie</span>
                <span className="itemVal highlight">{movie?.movieName || show?.movieId}</span>
              </div>
              <div className="summaryItem">
                <span className="itemLabel">Cinema</span>
                <span className="itemVal">{show.theatreName}</span>
              </div>
              <div className="summaryItem">
                <span className="itemLabel">Date & Time</span>
                <span className="itemVal">
                  {dayjs(show.showdate).format("MMM D")} | {show.showtime}
                </span>
              </div>

              <hr className="divider" />

              <div className="summaryItem">
                <span className="itemLabel">Selected Seats</span>
                <span className="itemVal seatsPill">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                </span>
              </div>

              <div className="summaryItem">
                <span className="itemLabel">Total Tickets</span>
                <span className="itemVal">{selectedSeats.length}</span>
              </div>

              <hr className="divider" />

              <div className="summaryItem totalLine">
                <span>Subtotal Amount</span>
                <span className="priceTotal">₹{totalPrice}</span>
              </div>

              <button
                className="btnProceedPayment"
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0}
              >
                <FaLock /> Proceed to Payment (₹{totalPrice})
              </button>

              <p className="guarantee">
                <FaCheckCircle /> 100% Secure & Guaranteed Reservation
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Payment Gateway Modal (Sections 4 & 5) */}
      {showPaymentModal && (
        <div className="paymentModalOverlay" onClick={() => setShowPaymentModal(false)}>
          <div className="paymentModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Secure Payment Gateway</h3>
              <button className="btnClose" onClick={() => setShowPaymentModal(false)}>
                ✕
              </button>
            </div>

            <div className="paymentDetails">
              <div className="payAmountBox">
                <span>Amount to Pay</span>
                <span className="payValue">₹{totalPrice}</span>
              </div>

              <div className="paymentMethodSelect">
                <label>Select Payment Method:</label>
                <div className="methodOptions">
                  <button
                    type="button"
                    className={`methodBtn ${paymentMethod === "card" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <FaCreditCard /> Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    className={`methodBtn ${paymentMethod === "upi" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    UPI / QR Code
                  </button>
                  <button
                    type="button"
                    className={`methodBtn ${paymentMethod === "netbanking" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("netbanking")}
                  >
                    Net Banking
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="cardSimFields">
                  <input type="text" placeholder="Card Number (4000 1234 5678 9010)" defaultValue="4242 •••• •••• 4242" />
                  <div className="splitInputs">
                    <input type="text" placeholder="MM/YY" defaultValue="12/28" />
                    <input type="password" placeholder="CVV" defaultValue="789" />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="upiSimField">
                  <input type="text" placeholder="Enter UPI ID (e.g. user@okhdfcbank)" defaultValue="cinemafan@upi" />
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="netBankingSelect">
                  <select defaultValue="HDFC">
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                  </select>
                </div>
              )}

              <button
                className="btnFinalConfirm"
                onClick={handleConfirmBooking}
                disabled={processingBooking}
              >
                {processingBooking ? "Processing Payment & Locking Seats..." : `Pay ₹${totalPrice} & Confirm Booking`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SeatsPage;
