// Booking Controller
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc    Create a new ticket booking
// @route   POST /api/bookings
// @access  Private (Logged-in user)
const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;

    // Validate request body
    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        message: 'Please provide a valid showtime ID and select at least one seat',
      });
    }

    // Retrieve the showtime
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Real-time server-side check: Ensure none of the requested seats are already booked
    const alreadyBooked = seats.filter((seat) => showtime.bookedSeats.includes(seat));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        message: `Seat(s) already booked: ${alreadyBooked.join(', ')}. Please select other seats.`,
      });
    }

    // Calculate total price based on ticket price * number of seats
    const totalAmount = seats.length * showtime.price;

    // Create the booking record
    const booking = await Booking.create({
      user: req.user._id,
      showtime: showtime._id,
      seats,
      totalAmount,
      status: 'confirmed',
    });

    // Update showtime bookedSeats array with the newly reserved seats
    showtime.bookedSeats.push(...seats);
    await showtime.save();

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showtime',
      populate: { path: 'movie' },
    });

    return res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create booking error:', error.message);
    return res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
};

// @desc    Get all bookings belonging to the currently logged-in user
// @route   GET /api/bookings/my
// @access  Private (Logged-in user)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error.message);
    return res.status(500).json({ message: 'Server error fetching user bookings', error: error.message });
  }
};

// @desc    Cancel a booking (user can only cancel their own; admin can cancel any)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: only the booking owner or an admin can cancel it
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if the booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Mark the booking as cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Release the booked seats back to the showtime
    const showtime = await Showtime.findById(booking.showtime);
    if (showtime) {
      showtime.bookedSeats = showtime.bookedSeats.filter(
        (seat) => !booking.seats.includes(seat)
      );
      await showtime.save();
    }

    return res.status(200).json({
      message: 'Booking cancelled successfully and seats released',
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error.message);
    return res.status(500).json({ message: 'Server error cancelling booking', error: error.message });
  }
};

// @desc    Get all bookings in the system (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email role')
      .populate({
        path: 'showtime',
        populate: { path: 'movie' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error.message);
    return res.status(500).json({ message: 'Server error fetching all bookings', error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
};
