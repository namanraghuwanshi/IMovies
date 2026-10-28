// Showtime Model
const mongoose = require('mongoose');

// Define Showtime Schema
const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Please link this showtime to a movie'],
    },
    theater: {
      type: String,
      required: [true, 'Please provide the theater name'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Please provide a date (YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Please provide a showtime (e.g. 06:30 PM)'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a ticket price'],
      min: 0,
    },
    totalSeats: {
      type: Number,
      default: 40,
    },
    bookedSeats: {
      type: [String],
      default: [], // Array of seat labels, e.g. ["A1", "B4"]
    },
  },
  {
    timestamps: true,
  }
);

const Showtime = mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;
