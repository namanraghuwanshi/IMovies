// Movie Routes
const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { getShowtimesByMovie } = require('../controllers/showtimeController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Public movie routes
router.get('/', getMovies);
router.get('/:id', getMovieById);
router.get('/:id/showtimes', getShowtimesByMovie);

// Admin-only movie routes
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
