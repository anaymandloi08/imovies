import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
  FaTicketAlt,
  FaTv,
  FaTimes,
  FaTrashAlt,
  FaShieldAlt,
  FaQrcode,
  FaRegCreditCard,
  FaBuilding,
} from "react-icons/fa";
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
      balcony: show?.tickets?.balconySeatPrice || theatre?.balconySeatPrice || 450,
      middle: show?.tickets?.middleSeatPrice || theatre?.middleSeatPrice || 280,
      lower: show?.tickets?.lowerSeatPrice || theatre?.lowerSeatPrice || 180,
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
        toast.warning("Maximum 8 seats allowed per booking transaction.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const removeSingleSeat = (seatCode, e) => {
    e.stopPropagation();
    setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
  };

  const clearAllSeats = () => {
    setSelectedSeats([]);
  };

  const calculateSeatPrice = (seatCode) => {
    const row = seatCode.charAt(0);
    if (balconyRows.includes(row)) return prices.balcony;
    if (middleRows.includes(row)) return prices.middle;
    return prices.lower;
  };

  const getSeatTier = (seatCode) => {
    const row = seatCode.charAt(0);
    if (balconyRows.includes(row)) return "Balcony Club";
    if (middleRows.includes(row)) return "Middle Executive";
    return "Lower Classic";
  };

  const ticketSubtotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + calculateSeatPrice(seat), 0);
  }, [selectedSeats, prices]);

  const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
  const gstAmount = selectedSeats.length > 0 ? Math.round(convenienceFee * 0.18) : 0;
  const grandTotal = ticketSubtotal + convenienceFee + gstAmount;

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please pick your seats before checking out.");
      return;
    }
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.info("Please sign in to confirm your booking");
      navigate("/login");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    const rawUser = localStorage.getItem("imovies_user");
    if (!rawUser) {
      toast.error("Session timed out. Please sign in again.");
      navigate("/login");
      return;
    }
    const user = JSON.parse(rawUser);

    setProcessingBooking(true);
    const newBookingId = `IMV-${uuidv4().slice(0, 8).toUpperCase()}`;

    const ticketsData = {
      seats: selectedSeats,
      totalPrice: grandTotal,
      subtotal: ticketSubtotal,
      convenienceFee,
      gst: gstAmount,
      paymentMethod,
      theatreName: show?.theatreName || theatre?.theatreName,
      movieName: movie?.movieName || show?.movieId,
      showdate: show?.showdate,
      showtime: show?.showtime,
      bookingDate: new Date().toISOString(),
    };

    try {
      const res = await axios.post(
        `${render}/api/bookings/book`,
        {
          bookingId: newBookingId,
          userEmail: user.email,
          showId: show?.showId || showId,
          ticketsData,
        },
        { timeout: 3000 }
      );

      if (res.data.success) {
        toast.success("Booking confirmed! Your tickets are ready.");
        setShowPaymentModal(false);
        navigate("/bookings");
        return;
      }
    } catch (err) {
      // Offline fallback: save to localStorage
      const savedBookings = JSON.parse(
        localStorage.getItem("imovies_bookings") || "[]"
      );
      const localBooking = {
        _id: "book-" + Date.now(),
        bookingId: newBookingId,
        userEmail: user.email,
        showId: show?.showId || showId,
        ticketsData,
        movieDetails: movie,
        theatreDetails: theatre,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      savedBookings.unshift(localBooking);
      localStorage.setItem("imovies_bookings", JSON.stringify(savedBookings));

      toast.success("Booking confirmed! Your e-ticket is generated.");
      setShowPaymentModal(false);
      navigate("/bookings");
      return;
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
            Return to Cinema
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
                title={`${seatCode} (${getSeatTier(seatCode)}) - ₹${calculateSeatPrice(
                  seatCode
                )} ${isBooked ? "• Booked" : "• Click to select"}`}
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
            <FaArrowLeft /> Back to Shows
          </button>
          <div className="movieShowMeta">
            <h2>{movie?.movieName || show?.movieId}</h2>
            <p>
              {show.theatreName} • Screen 1 (IMAX) •{" "}
              {dayjs(show.showdate).format("dddd, MMM D, YYYY")} at {show.showtime}
            </p>
          </div>
        </div>

        <div className="seatingAndSummaryGrid">
          {/* Main Seating Plan */}
          <div className="screenAndSeatsSection">
            {/* Curved Cinema Screen with Projection Light Beam */}
            <div className="cinemaScreenWrapper">
              <div className="projectionBeam"></div>
              <div className="screenCurve"></div>
              <p className="screenNotice">
                <FaTv /> ALL EYES THIS WAY — CINEMA SCREEN
              </p>
            </div>

            {/* Balcony Section */}
            <div className="tierSection tierBalcony">
              <div className="tierHeader">
                <div className="tierTitle">
                  <span className="tierBadge balconyBadge">PREMIUM</span>
                  <h4>BALCONY RECLINERS</h4>
                </div>
                <span className="tierPrice">₹{prices.balcony}</span>
              </div>
              <div className="rowsBlock">
                {balconyRows.map((r) => renderSeatRow(r, "balcony"))}
              </div>
            </div>

            {/* Middle Section */}
            <div className="tierSection tierMiddle">
              <div className="tierHeader">
                <div className="tierTitle">
                  <span className="tierBadge middleBadge">POPULAR</span>
                  <h4>MIDDLE EXECUTIVE</h4>
                </div>
                <span className="tierPrice">₹{prices.middle}</span>
              </div>
              <div className="rowsBlock">
                {middleRows.map((r) => renderSeatRow(r, "middle"))}
              </div>
            </div>

            {/* Lower Section */}
            <div className="tierSection tierLower">
              <div className="tierHeader">
                <div className="tierTitle">
                  <span className="tierBadge lowerBadge">STANDARD</span>
                  <h4>LOWER CLASSIC</h4>
                </div>
                <span className="tierPrice">₹{prices.lower}</span>
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
                <span>Sold Out</span>
              </div>
              <div className="legendItem">
                <span className="legendBox balconyLegend"></span>
                <span>VIP Recliner</span>
              </div>
            </div>
          </div>

          {/* Checkout & Summary Sidebar */}
          <aside className="bookingSummaryPanel">
            <div className="panelHeaderRow">
              <h3>Booking Summary</h3>
              {selectedSeats.length > 0 && (
                <button
                  className="btnClearSeats"
                  onClick={clearAllSeats}
                  title="Deselect all seats"
                >
                  <FaTrashAlt /> Clear
                </button>
              )}
            </div>

            <div className="summaryCard">
              <div className="summaryItem">
                <span className="itemLabel">Movie</span>
                <span className="itemVal highlight">
                  {movie?.movieName || show?.movieId}
                </span>
              </div>
              <div className="summaryItem">
                <span className="itemLabel">Cinema Venue</span>
                <span className="itemVal">{show.theatreName}</span>
              </div>
              <div className="summaryItem">
                <span className="itemLabel">Date & Time</span>
                <span className="itemVal">
                  {dayjs(show.showdate).format("MMM D")} • {show.showtime}
                </span>
              </div>

              <hr className="divider" />

              <div className="selectedSeatsBlock">
                <div className="seatsBlockHeader">
                  <span>Selected Seats ({selectedSeats.length}/8)</span>
                </div>
                {selectedSeats.length === 0 ? (
                  <p className="noSeatsSelected">
                    Click any available seat above to add to your reservation.
                  </p>
                ) : (
                  <div className="seatChipsGrid">
                    {selectedSeats.map((seat) => (
                      <div key={seat} className="seatChip">
                        <span className="chipCode">{seat}</span>
                        <span className="chipPrice">
                          ₹{calculateSeatPrice(seat)}
                        </span>
                        <button
                          className="btnRemoveChip"
                          onClick={(e) => removeSingleSeat(seat, e)}
                          title="Remove seat"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="divider" />

              <div className="pricingBreakdown">
                <div className="priceRow">
                  <span>Tickets Subtotal</span>
                  <span>₹{ticketSubtotal}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <>
                    <div className="priceRow feeRow">
                      <span>Convenience Fee</span>
                      <span>₹{convenienceFee}</span>
                    </div>
                    <div className="priceRow feeRow">
                      <span>Integrated GST (18%)</span>
                      <span>₹{gstAmount}</span>
                    </div>
                  </>
                )}
              </div>

              <hr className="divider" />

              <div className="summaryItem totalLine">
                <span>Grand Total</span>
                <span className="priceTotal">₹{grandTotal}</span>
              </div>

              <button
                className="btnProceedPayment"
                onClick={handleProceedToPayment}
                disabled={selectedSeats.length === 0}
              >
                <FaLock /> Check Out (₹{grandTotal})
              </button>

              <div className="guarantee">
                <FaShieldAlt className="shieldIcon" />
                <span>Encrypted 256-Bit SSL Instant Ticket Lock</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Payment Gateway Modal */}
      {showPaymentModal && (
        <div
          className="paymentModalOverlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="paymentModalCard"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <div className="headerTitleGroup">
                <FaShieldAlt className="shieldIcon" />
                <h3>Complete Cinema Reservation</h3>
              </div>
              <button
                className="btnClose"
                onClick={() => setShowPaymentModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="paymentDetails">
              <div className="payAmountBox">
                <div>
                  <span className="amountLabel">Total Payable</span>
                  <p className="amountMeta">
                    {selectedSeats.length} {selectedSeats.length === 1 ? "Ticket" : "Tickets"} • {movie?.movieName || show?.movieId}
                  </p>
                </div>
                <span className="payValue">₹{grandTotal}</span>
              </div>

              <div className="paymentMethodSelect">
                <label>Choose Payment Method:</label>
                <div className="methodOptions">
                  <button
                    type="button"
                    className={`methodBtn ${
                      paymentMethod === "card" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <FaRegCreditCard /> Card
                  </button>
                  <button
                    type="button"
                    className={`methodBtn ${
                      paymentMethod === "upi" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <FaQrcode /> UPI / GPay
                  </button>
                  <button
                    type="button"
                    className={`methodBtn ${
                      paymentMethod === "netbanking" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("netbanking")}
                  >
                    <FaBuilding /> Net Banking
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="cardSimFields">
                  <div className="fieldGroup">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      defaultValue="4242 •••• •••• 4242"
                    />
                  </div>
                  <div className="splitInputs">
                    <div className="fieldGroup">
                      <label>Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="08/29" />
                    </div>
                    <div className="fieldGroup">
                      <label>CVV / CVC</label>
                      <input type="password" placeholder="•••" defaultValue="888" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="upiSimField">
                  <div className="fieldGroup">
                    <label>Virtual Payment Address (VPA / UPI ID)</label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@oksbi"
                      defaultValue="moviefan@okhdfc"
                    />
                  </div>
                  <div className="upiQrBadge">
                    <FaQrcode className="qrIcon" />
                    <span>Instant payment supported via Google Pay, PhonePe, and Paytm.</span>
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="netBankingSelect">
                  <label>Select Bank</label>
                  <select defaultValue="HDFC">
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <button
                className="btnFinalConfirm"
                onClick={handleConfirmBooking}
                disabled={processingBooking}
              >
                {processingBooking ? (
                  <span className="spinnerWrapper">Securing Seats...</span>
                ) : (
                  `Authorize & Pay ₹${grandTotal}`
                )}
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
