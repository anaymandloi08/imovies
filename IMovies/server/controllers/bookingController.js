const Booking = require('../models/Booking');
const Show = require('../models/Show');

// Helper to generate unique booking reference ID e.g. "IMV-74921"
const generateBookingRef = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `IMV-${randomNum}`;
};

// @desc    Create new booking with atomic concurrency double-booking prevention
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { showId, seats, totalAmount } = req.body;
    const userId = req.user._id;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking request. Please provide showId and selected seats.'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount for booking.'
      });
    }

    // ATOMIC RESERVATION LOCK
    // findOneAndUpdate checks that NO seat in 'seats' array is already in 'bookedSeats'.
    // If condition holds, it atomically appends the seats. If any seat is already taken, it returns null.
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seats }
      },
      {
        $addToSet: { bookedSeats: { $each: seats } }
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        success: false,
        message: 'Concurrency conflict: One or more selected seats have already been booked by another user. Please re-select your seats.'
      });
    }

    // Create the booking record
    let bookingReference = generateBookingRef();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Booking.findOne({ bookingReference });
      if (!existing) {
        isUnique = true;
      } else {
        bookingReference = generateBookingRef();
      }
    }

    try {
      const booking = await Booking.create({
        bookingReference,
        user: userId,
        show: showId,
        seats,
        totalAmount,
        status: 'Confirmed'
      });

      const populatedBooking = await Booking.findById(booking._id)
        .populate({
          path: 'show',
          populate: [
            { path: 'movie', select: 'title duration rating posterUrl language' },
            { path: 'theatre', select: 'name city location' }
          ]
        })
        .populate('user', 'name email');

      return res.status(201).json({
        success: true,
        message: 'Ticket reservation confirmed successfully!',
        booking: populatedBooking
      });
    } catch (bookingError) {
      // Rollback locked seats if booking record creation failed
      await Show.findByIdAndUpdate(showId, {
        $pull: { bookedSeats: { $in: seats } }
      });
      throw bookingError;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title duration rating posterUrl bannerUrl' },
          { path: 'theatre', select: 'name city location' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title duration rating posterUrl bannerUrl' },
          { path: 'theatre', select: 'name city location' }
        ]
      })
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify ownership or admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this booking.'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking and release seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only cancel your own bookings.'
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    // Release seats atomically from Show document
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { $in: booking.seats } }
    });

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Reserved seats have been released.',
      booking
    });
  } catch (error) {
    next(error);
  }
};
