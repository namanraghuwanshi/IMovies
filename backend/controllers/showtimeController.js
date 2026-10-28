// Showtime Controller
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

// @desc    Get all showtimes for a specific movie
// @route   GET /api/movies/:id/showtimes
// @access  Public
const getShowtimesByMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Find showtimes for this movie, ordered by date and time
    const showtimes = await Showtime.find({ movie: movieId }).sort({ date: 1, time: 1 });
    return res.status(200).json(showtimes);
  } catch (error) {
    console.error('Get showtimes error:', error.message);
    return res.status(500).json({ message: 'Server error fetching showtimes', error: error.message });
  }
};

// @desc    Get a single showtime by ID (with populated movie info)
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie');

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    return res.status(200).json(showtime);
  } catch (error) {
    console.error('Get showtime details error:', error.message);
    return res.status(500).json({ message: 'Server error fetching showtime details', error: error.message });
  }
};

// @desc    Create a new showtime for a movie
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res) => {
  try {
    const { movie, theater, date, time, price, totalSeats } = req.body;

    // Validate required fields
    if (!movie || !theater || !date || !time || price === undefined) {
      return res.status(400).json({
        message: 'Please provide movie ID, theater name, date, time, and ticket price',
      });
    }

    // Verify the movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ message: 'Referenced movie does not exist' });
    }

    // Create showtime
    const showtime = await Showtime.create({
      movie,
      theater,
      date,
      time,
      price: Number(price),
      totalSeats: totalSeats ? Number(totalSeats) : 40,
      bookedSeats: [],
    });

    return res.status(201).json(showtime);
  } catch (error) {
    console.error('Create showtime error:', error.message);
    return res.status(500).json({ message: 'Server error creating showtime', error: error.message });
  }
};

// @desc    Delete a showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    await Showtime.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    console.error('Delete showtime error:', error.message);
    return res.status(500).json({ message: 'Server error deleting showtime', error: error.message });
  }
};

module.exports = {
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
  deleteShowtime,
};
