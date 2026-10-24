import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Ticket, Calendar, Clock, MapPin, XCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyBookingsPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=/my-bookings');
      } else {
        fetchMyBookings();
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setActionMessage({ text: 'Failed to retrieve booking history.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, reference) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking ${reference}? Your reserved seats will be released back to the theatre inventory.`
    );
    if (!confirmCancel) return;

    try {
      setCancellingId(bookingId);
      const res = await axios.put(`/api/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        setActionMessage({
          text: `Booking ${reference} has been cancelled successfully. Reserved seats have been released.`,
          type: 'success'
        });
        // Update local status
        setBookings(
          bookings.map((b) => (b._id === bookingId ? { ...b, status: 'Cancelled' } : b))
        );
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
      setActionMessage({
        text: err.response?.data?.message || 'Failed to cancel booking. Please try again.',
        type: 'danger'
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="text-muted mt-3">Loading your booking history...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 pb-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <h1 className="fs-2 text-white fw-bold d-flex align-items-center gap-2 mb-1 brand-font">
            <Ticket className="text-danger" size={28} />
            <span>My Cinema Bookings</span>
          </h1>
          <p className="text-muted small mb-0">Manage your active cinema reservations and past ticket history</p>
        </div>
        <span className="badge bg-dark border border-secondary text-light px-3 py-2 align-self-start align-self-md-auto">
          {bookings.length} Total Bookings Recorded
        </span>
      </div>

      {/* Action Notification */}
      {actionMessage.text && (
        <div className={`alert alert-${actionMessage.type} alert-dismissible fade show mb-4`} role="alert">
          {actionMessage.text}
          <button type="button" className="btn-close" onClick={() => setActionMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-card p-5 text-center my-4">
          <Ticket size={48} className="text-secondary mb-3" />
          <h4 className="text-light">No bookings found</h4>
          <p className="text-muted">You haven't reserved any movie tickets yet.</p>
          <Link to="/" className="btn btn-cinema mt-2">
            Explore Now Showing
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {bookings.map((booking) => {
            const { show } = booking;
            const isConfirmed = booking.status === 'Confirmed';

            return (
              <div
                key={booking._id}
                className={`glass-card p-4 transition-all ${
                  !isConfirmed ? 'opacity-75 border-secondary' : 'border-secondary border-opacity-50'
                }`}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 pb-3 mb-3 border-bottom border-secondary border-opacity-25">
                  <div className="d-flex align-items-center gap-3">
                    <div>
                      <span className="text-muted small d-block">Booking Reference</span>
                      <span className="fs-5 fw-bold text-info brand-font">{booking.bookingReference}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span
                      className={`badge px-3 py-2 ${
                        isConfirmed
                          ? 'bg-success bg-opacity-20 text-success border border-success'
                          : 'bg-secondary bg-opacity-25 text-danger border border-danger'
                      }`}
                    >
                      ● {booking.status}
                    </span>

                    <span className="text-muted small">
                      Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="row g-4 align-items-center">
                  <div className="col-3 col-sm-2 text-center">
                    <img
                      src={show.movie.posterUrl}
                      alt={show.movie.title}
                      className="img-fluid rounded border border-secondary border-opacity-25 shadow-sm"
                      style={{ maxHeight: '110px', objectFit: 'cover' }}
                    />
                  </div>

                  <div className="col-9 col-sm-6">
                    <h5 className="text-white fw-bold mb-1">{show.movie.title}</h5>
                    <div className="d-flex align-items-center gap-1 text-light small mb-1">
                      <MapPin size={14} className="text-danger flex-shrink-0" />
                      <span>{show.theatre.name} ({show.screenName})</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 text-muted small mt-2">
                      <div className="d-flex align-items-center gap-1">
                        <Calendar size={13} className="text-info" />
                        <span>{show.date}</span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <Clock size={13} className="text-info" />
                        <span>{show.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 text-sm-end border-top-sm pt-3 pt-sm-0 border-secondary border-opacity-25">
                    <div className="mb-2">
                      <span className="text-muted small d-block">Seats:</span>
                      <div className="d-flex flex-wrap gap-1 justify-content-sm-end">
                        {booking.seats.map((seat) => (
                          <span key={seat} className="badge bg-dark border border-secondary text-light">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="fs-5 fw-bold text-white mb-2">
                      ₹{booking.totalAmount}
                    </div>

                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelBooking(booking._id, booking.bookingReference)}
                        disabled={cancellingId === booking._id}
                        className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                      >
                        {cancellingId === booking._id ? (
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                          <XCircle size={15} />
                        )}
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
