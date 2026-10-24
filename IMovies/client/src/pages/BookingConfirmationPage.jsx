import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Ticket, Calendar, Clock, MapPin, Printer, Film, ArrowRight } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await axios.get(`/api/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      console.error('Failed to load booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="text-muted mt-3">Loading confirmation details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Booking not found</h4>
        <Link to="/" className="btn btn-cinema btn-sm mt-3">Back to Home</Link>
      </div>
    );
  }

  const { show } = booking;

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-20 text-success mb-3 shadow">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-white fw-bold brand-font mb-1">Booking Confirmed!</h1>
        <p className="text-muted">Your cinema tickets have been securely reserved.</p>
      </div>

      {/* Confirmed Ticket Card */}
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          <div className="glass-card p-4 p-md-5 border-success shadow-2xl position-relative overflow-hidden">
            {/* Top Bar with Reference ID */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-3 mb-4 border-bottom border-secondary border-opacity-25 gap-2">
              <div>
                <span className="text-muted small d-block">Booking Reference Number</span>
                <span className="fs-4 fw-extrabold text-info brand-font letter-spacing-1">
                  {booking.bookingReference}
                </span>
              </div>
              <span className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 align-self-start align-self-sm-auto">
                ● Confirmed & Verified
              </span>
            </div>

            {/* Movie & Show Info */}
            <div className="row g-4 align-items-center mb-4">
              <div className="col-4 col-sm-3 text-center">
                <img
                  src={show.movie.posterUrl}
                  alt={show.movie.title}
                  className="img-fluid rounded-3 shadow border border-secondary border-opacity-25"
                  style={{ maxHeight: '150px', objectFit: 'cover' }}
                />
              </div>
              <div className="col-8 col-sm-9">
                <h4 className="text-white fw-bold mb-1">{show.movie.title}</h4>
                <div className="text-muted small mb-2">
                  {show.movie.language || 'English'} • {show.movie.duration} mins • ★ {show.movie.rating?.toFixed(1) || '8.5'}
                </div>
                <div className="d-flex align-items-center gap-1 text-light small mb-1">
                  <MapPin size={15} className="text-danger flex-shrink-0" />
                  <span>{show.theatre.name} ({show.screenName})</span>
                </div>
                <div className="d-flex align-items-center gap-3 text-muted small mt-2">
                  <div className="d-flex align-items-center gap-1">
                    <Calendar size={14} className="text-info" />
                    <span>{show.date}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Clock size={14} className="text-info" />
                    <span>{show.time}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reserved Seats & Cost */}
            <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 mb-4">
              <div className="row g-3">
                <div className="col-sm-6 border-end-sm border-secondary border-opacity-25">
                  <span className="text-muted small d-block mb-1">Reserved Seats ({booking.seats.length})</span>
                  <div className="d-flex flex-wrap gap-2">
                    {booking.seats.map((seat) => (
                      <span key={seat} className="badge bg-success bg-opacity-20 text-success border border-success px-2 py-1 fs-6">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-sm-6 ps-sm-4">
                  <span className="text-muted small d-block mb-1">Total Paid Amount</span>
                  <span className="fs-3 fw-bold text-white">₹{booking.totalAmount}</span>
                  <span className="text-success small d-block">Zero Convenience Surcharges</span>
                </div>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="d-flex flex-wrap gap-3 justify-content-between pt-2">
              <button
                onClick={handlePrint}
                className="btn btn-outline-light d-flex align-items-center gap-2"
              >
                <Printer size={18} />
                <span>Print Ticket</span>
              </button>

              <div className="d-flex gap-2">
                <Link
                  to="/my-bookings"
                  className="btn btn-secondary-cinema d-flex align-items-center gap-2"
                >
                  <Ticket size={18} className="text-danger" />
                  <span>View All Bookings</span>
                </Link>
                <Link
                  to="/"
                  className="btn btn-cinema d-flex align-items-center gap-2"
                >
                  <span>Explore More</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
