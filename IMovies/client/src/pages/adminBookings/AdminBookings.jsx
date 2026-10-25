import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTicketAlt, FaArrowLeft, FaTrashAlt, FaRupeeSign } from "react-icons/fa";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/loader/Loader";
import { render } from "../../host";
import "../admin/style.scss";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${render}/api/bookings/allbookings`);
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Admin fetch bookings error:", err);
      toast.error("Failed to load customer reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Revoke reservation ${bookingId}? Seats will be unlocked.`)) return;

    try {
      const res = await axios.delete(`${render}/api/bookings/cancelbooking/${bookingId}`);
      if (res.data.success) {
        toast.success("Booking revoked and seats released.");
        fetchBookings();
      }
    } catch (err) {
      toast.error("Failed to cancel booking");
    }
  };

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (Number(b.ticketsData?.totalPrice) || 0),
    0
  );

  return (
    <div className="adminDashboardPage">
      <Header />

      <main className="adminContainer">
        <div className="dashboardTopBar">
          <div className="adminHeading">
            <Link to="/admin" style={{ color: "#888", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
              <FaArrowLeft /> Back to Dashboard
            </Link>
            <h1>Customer Ticket Reservations</h1>
          </div>

          <div style={{ background: "#181818", border: "1px solid #333", padding: "0.8rem 1.4rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#888", fontSize: "0.9rem" }}>Total Revenue:</span>
            <span style={{ color: "#4ade80", fontSize: "1.3rem", fontWeight: "800" }}>
              ₹{totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="managementSection">
            <div className="tableWrapper">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer Email</th>
                    <th>Movie</th>
                    <th>Show Time</th>
                    <th>Reserved Seats</th>
                    <th>Total Paid</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.bookingId}>
                      <td className="monoText">{b.bookingId}</td>
                      <td>{b.userEmail}</td>
                      <td className="boldText">{b.ticketsData?.movieName || "Movie"}</td>
                      <td>
                        {b.ticketsData?.showdate} ({b.ticketsData?.showtime})
                      </td>
                      <td>
                        {(b.ticketsData?.seats || []).join(", ")}
                      </td>
                      <td style={{ color: "#4ade80", fontWeight: "700" }}>
                        ₹{b.ticketsData?.totalPrice || 0}
                      </td>
                      <td>
                        <button
                          onClick={() => handleCancelBooking(b.bookingId)}
                          className="btnDelete"
                          title="Cancel Reservation"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminBookings;
