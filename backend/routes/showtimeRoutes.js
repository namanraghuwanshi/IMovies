// Showtime Routes
const express = require('express');
const router = express.Router();
const {
  getShowtimeById,
  createShowtime,
  deleteShowtime,
} = require('../controllers/showtimeController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Public route to get single showtime details
router.get('/:id', getShowtimeById);

// Admin-only routes
router.post('/', protect, adminOnly, createShowtime);
router.delete('/:id', protect, adminOnly, deleteShowtime);

module.exports = router;
