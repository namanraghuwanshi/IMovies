// Main entry point for the IMovies backend server
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

const app = express();

// Middleware to enable Cross-Origin Resource Sharing
app.use(cors());

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Base health check route
app.get('/', (req, res) => {
  res.json({ message: 'IMovies Backend API is running successfully' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

// Fallback 404 route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
