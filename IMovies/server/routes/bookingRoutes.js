const express = require("express");
const router = express.Router();
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const fetchUser = require("../middlewares/fetchUser");

// ROUTE 1: Create a booking: POST "/api/bookings/book"
router.post("/book", async (req, res) => {
  try {
    const { bookingId, userEmail, showId, ticketsData } = req.body;

    if (!bookingId || !userEmail || !showId || !ticketsData) {
      return res.status(400).json({
        success: false,
        error: "All fields (bookingId, userEmail, showId, ticketsData) are required",
      });
    }

    // Find the show
    const show = await Show.findOne({
      $or: [{ showId }, { _id: showId.match(/^[0-9a-fA-F]{24}$/) ? showId : null }],
    });

    if (!show) {
      return res.status(404).json({ success: false, error: "Show not found" });
    }

    // Check if any seat is already booked
    const currentTickets = show.tickets || {};
    const bookedSeats = Array.isArray(currentTickets.bookedSeats) ? currentTickets.bookedSeats : [];
    const requestedSeats = Array.isArray(ticketsData.seats) ? ticketsData.seats : [];

    const overlap = requestedSeats.some((seat) => bookedSeats.includes(seat));
    if (overlap) {
      return res.status(400).json({
        success: false,
        error: "One or more of the selected seats have already been booked. Please select different seats.",
      });
    }

    // Create booking
    const booking = await Booking.create({
      bookingId,
      userEmail,
      showId,
      ticketsData,
    });

    // Update show tickets with newly booked seats
    show.tickets = {
      ...currentTickets,
      bookedSeats: [...bookedSeats, ...requestedSeats],
    };
    show.markModified("tickets");
    await show.save();

    res.status(201).json({
      success: true,
      booking,
      message: "Ticket booking confirmed successfully!",
    });
  } catch (error) {
    console.error("Booking error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// ROUTE 2: Get user bookings: GET "/api/bookings/userbookings/:userEmail"
router.get("/userbookings/:userEmail", async (req, res) => {
  try {
    const userEmail = req.params.userEmail.toLowerCase();
    const bookings = await Booking.find({
      userEmail: { $regex: new RegExp(`^${userEmail}$`, "i") },
    }).sort({ createdAt: -1 });

    // Enrich with show, movie, and theatre information
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const bObj = b.toObject();
        const show = await Show.findOne({
          $or: [{ showId: b.showId }, { _id: b.showId.match(/^[0-9a-fA-F]{24}$/) ? b.showId : null }],
        });

        let movie = null;
        let theatre = null;
        if (show) {
          movie = await Movie.findOne({
            $or: [{ _id: show.movieId.match(/^[0-9a-fA-F]{24}$/) ? show.movieId : null }, { movieName: show.movieId }],
          });
          theatre = await Theatre.findOne({ theatreName: show.theatreName });
        }

        return {
          ...bObj,
          showDetails: show || null,
          movieDetails: movie || null,
          theatreDetails: theatre || null,
        };
      })
    );

    res.json({ success: true, bookings: enriched });
  } catch (error) {
    console.error("Get user bookings error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 3: Get all bookings (Admin): GET "/api/bookings/allbookings"
router.get("/allbookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const bObj = b.toObject();
        const show = await Show.findOne({
          $or: [{ showId: b.showId }, { _id: b.showId.match(/^[0-9a-fA-F]{24}$/) ? b.showId : null }],
        });
        let movie = null;
        if (show) {
          movie = await Movie.findOne({
            $or: [{ _id: show.movieId.match(/^[0-9a-fA-F]{24}$/) ? show.movieId : null }, { movieName: show.movieId }],
          });
        }
        return {
          ...bObj,
          showDetails: show || null,
          movieDetails: movie || null,
        };
      })
    );

    res.json({ success: true, bookings: enriched });
  } catch (error) {
    console.error("Get all bookings error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 4: Cancel booking: DELETE "/api/bookings/cancelbooking/:bookingId"
router.delete("/cancelbooking/:bookingId", async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Release booked seats in the show
    const show = await Show.findOne({
      $or: [{ showId: booking.showId }, { _id: booking.showId.match(/^[0-9a-fA-F]{24}$/) ? booking.showId : null }],
    });

    if (show && show.tickets && Array.isArray(show.tickets.bookedSeats)) {
      const seatsToFree = booking.ticketsData?.seats || [];
      show.tickets.bookedSeats = show.tickets.bookedSeats.filter(
        (seat) => !seatsToFree.includes(seat)
      );
      show.markModified("tickets");
      await show.save();
    }

    res.json({ success: true, message: "Booking cancelled and seats released successfully!" });
  } catch (error) {
    console.error("Cancel booking error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
