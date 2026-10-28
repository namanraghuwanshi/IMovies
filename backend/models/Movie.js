// Movie Model
const mongoose = require('mongoose');

// Define Movie Schema
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a movie description'],
    },
    genre: {
      type: String,
      required: [true, 'Please provide a movie genre'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Please provide a movie language'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 0,
      max: 10,
      default: 0,
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide a poster image URL'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please provide a release date'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
