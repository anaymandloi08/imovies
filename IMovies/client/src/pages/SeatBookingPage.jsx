import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchShowDetails();
  }, [showId]);

  const fetchShowDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/shows/${showId}`);
      if (res.data.success) {
        setShow(res.data.show);
      }
    } catch (err) {
      console.error('Failed to load show details:', err);
      setErrorMessage('Could not load showtime details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId) => {
    setErrorMessage('');
    if (show.bookedSeats.includes(seatId)) {
      return; // Already booked, cannot select
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Calculate total price based on seat tiers
  const calculateTotal = () => {
    if (!show) return 0;
    return selectedSeats.reduce((total, seat) => {
      const row = seat.charAt(0);
      const isVIP = row === 'E' || row === 'F';
      return total + (isVIP ? show.vipPrice : show.standardPrice);
    }, 0);
  };

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate(`/login?redirect=/booking/${showId}`);
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat to proceed.');
      return;
    }

    try {
      setBookingLoading(true);
      setErrorMessage('');

      const totalAmount = calculateTotal();
      const res = await axios.post('/api/bookings', {
        showId,
        seats: selectedSeats,
        totalAmount
      });

      if (res.data.success) {
        navigate(`/booking-confirmation/${res.data.booking._id}`, {
          state: { booking: res.data.booking }
        });
      }
    } catch (err) {
      console.error('Booking failed:', err);
      if (err.response && err.response.status === 409) {
        // Concurrency conflict error from atomic check
        setErrorMessage(
          'Seat Conflict: One or more selected seats were just reserved by another customer. Please select different seats.'
        );
        // Refresh show details to show updated booked seats
        fetchShowDetails();
        setSelectedSeats([]);
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Booking transaction failed. Please try again.'
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="text-muted mt-3">Loading cinema hall layout...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h4>Show not found</h4>
        <Link to="/" className="btn btn-cinema btn-sm mt-3">Back to Movies</Link>
      </div>
    );
  }

  const rows = show.rows || ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = show.seatsPerRow || 10;
  const totalAmount = calculateTotal();

  return (
    <div className="container py-4 pb-5">
      {/* Header & Back link */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-link text-light p-0 mb-1 d-flex align-items-center gap-1 text-decoration-none"
          >
            <ArrowLeft size={16} /> Back to Movie Details
          </button>
          <h2 className="text-white fw-bold brand-font mb-0">
            {show.movie.title}
          </h2>
          <div className="text-muted small mt-1">
            <strong className="text-info">{show.theatre.name}</strong> • {show.screenName} • {show.date} at {show.time}
          </div>
        </div>
      </div>

      {/* Error / Conflict Alert */}
      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 border-danger shadow">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Cinema Seating Layout */}
        <div className="col-lg-8">
          <div className="glass-card p-4 text-center">
            {/* Curved Cinema Screen */}
            <div className="cinema-screen-container">
              <div className="cinema-screen"></div>
              <div className="screen-text">ALL EYES THIS WAY • CINEMA SCREEN</div>
            </div>

            {/* Seat Matrix */}
            <div className="seat-matrix mt-4">
              {rows.map((row) => {
                const isVIP = row === 'E' || row === 'F';
                return (
                  <div key={row} className="seat-row">
                    <span className="seat-row-label">{row}</span>

                    {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((colNum) => {
                      const seatId = `${row}${colNum}`;
                      const isBooked = show.bookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      let seatClass = 'seat available';
                      if (isBooked) seatClass = 'seat booked';
                      else if (isSelected) seatClass = 'seat selected';

                      if (isVIP) seatClass += ' vip';

                      return (
                        <div
                          key={seatId}
                          onClick={() => handleSeatClick(seatId)}
                          className={seatClass}
                          title={`${seatId} (${isVIP ? 'VIP Recliner' : 'Standard'}) ${isBooked ? '- Booked' : ''}`}
                        >
                          {colNum}
                        </div>
                      );
                    })}

                    <span className="seat-row-label">{row}</span>
                  </div>
                );
              })}
            </div>

            {/* Seating Legend */}
            <div className="d-flex flex-wrap justify-content-center gap-4 mt-4 pt-3 border-top border-secondary border-opacity-25 small text-muted">
              <div className="d-flex align-items-center gap-2">
                <div className="seat available" style={{ width: '22px', height: '22px' }}></div>
                <span>Available</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="seat selected" style={{ width: '22px', height: '22px' }}></div>
                <span>Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="seat booked" style={{ width: '22px', height: '22px' }}></div>
                <span>Sold Out</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="seat available vip" style={{ width: '22px', height: '22px' }}></div>
                <span>VIP Recliner (₹{show.vipPrice})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="col-lg-4">
          <div className="glass-card p-4 sticky-top" style={{ top: '100px' }}>
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2 border-bottom border-secondary border-opacity-25 pb-2">
              <Ticket size={20} className="text-danger" />
              <span>Reservation Summary</span>
            </h5>

            <div className="d-flex gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
              <img
                src={show.movie.posterUrl}
                alt={show.movie.title}
                className="rounded"
                style={{ width: '60px', height: '80px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="text-light fw-bold mb-1">{show.movie.title}</h6>
                <div className="text-muted small">{show.theatre.name}</div>
                <div className="text-info small">{show.date} • {show.time}</div>
              </div>
            </div>

            {/* Selected Seats Pills */}
            <div className="mb-3">
              <label className="text-muted small fw-semibold mb-2 d-block">Selected Seats:</label>
              {selectedSeats.length === 0 ? (
                <div className="text-secondary small fst-italic">
                  Please tap on the seat layout to choose your seats.
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span key={seat} className="badge bg-success bg-opacity-25 text-success border border-success px-2 py-1">
                      {seat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="py-2 border-top border-bottom border-secondary border-opacity-25 my-3 small">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tickets ({selectedSeats.length})</span>
                <span className="text-light fw-semibold">₹{totalAmount}</span>
              </div>
              <div className="d-flex justify-content-between text-success">
                <span>Convenience Fee</span>
                <span>₹0 (Free)</span>
              </div>
            </div>

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-6 text-light fw-bold">Total Payable:</span>
              <span className="fs-4 text-white fw-extrabold text-danger">₹{totalAmount}</span>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleBookingSubmit}
              disabled={selectedSeats.length === 0 || bookingLoading}
              className="btn btn-cinema w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
            >
              {bookingLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Confirming Reservation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>{isAuthenticated ? 'Confirm & Book Tickets' : 'Sign In to Reserve'}</span>
                </>
              )}
            </button>

            <div className="text-center text-muted small mt-3" style={{ fontSize: '0.75rem' }}>
              🔒 Protected by Atomic Concurrency Lock • Zero Double-Bookings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBookingPage;
