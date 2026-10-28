// Movie Controller
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

// @desc    Get all movies (optional query search by title or genre)
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    // Filter by search keyword matching title
    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Case-insensitive
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      query.genre = { $regex: `^${genre}$`, $options: 'i' };
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    return res.status(200).json(movies);
  } catch (error) {
    console.error('Get movies error:', error.message);
    return res.status(500).json({ message: 'Server error fetching movies', error: error.message });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    return res.status(200).json(movie);
  } catch (error) {
    console.error('Get movie error:', error.message);
    return res.status(500).json({ message: 'Server error fetching movie details', error: error.message });
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      rating,
      posterUrl,
      releaseDate,
    } = req.body;

    // Validate inputs
    if (
      !title ||
      !description ||
      !genre ||
      !language ||
      !duration ||
      rating === undefined ||
      !posterUrl
    ) {
      return res.status(400).json({ message: 'Please provide all required movie fields' });
    }

    const movie = await Movie.create({
      title,
      description,
      genre,
      language,
      duration: Number(duration),
      rating: Number(rating),
      posterUrl,
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
    });

    return res.status(201).json(movie);
  } catch (error) {
    console.error('Create movie error:', error.message);
    return res.status(500).json({ message: 'Server error creating movie', error: error.message });
  }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Update fields if provided
    movie.title = req.body.title || movie.title;
    movie.description = req.body.description || movie.description;
    movie.genre = req.body.genre || movie.genre;
    movie.language = req.body.language || movie.language;
    if (req.body.duration !== undefined) movie.duration = Number(req.body.duration);
    if (req.body.rating !== undefined) movie.rating = Number(req.body.rating);
    movie.posterUrl = req.body.posterUrl || movie.posterUrl;
    if (req.body.releaseDate) movie.releaseDate = new Date(req.body.releaseDate);

    const updatedMovie = await movie.save();
    return res.status(200).json(updatedMovie);
  } catch (error) {
    console.error('Update movie error:', error.message);
    return res.status(500).json({ message: 'Server error updating movie', error: error.message });
  }
};

// @desc    Delete a movie and its showtimes
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Delete associated showtimes
    await Showtime.deleteMany({ movie: movie._id });

    // Delete movie
    await Movie.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Movie and its showtimes deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error.message);
    return res.status(500).json({ message: 'Server error deleting movie', error: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
