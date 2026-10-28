// Booking Routes
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// User protected routes
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Admin-only route to view all system bookings
router.get('/', protect, adminOnly, getAllBookings);

module.exports = router;
