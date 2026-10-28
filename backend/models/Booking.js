// Booking Model
const mongoose = require('mongoose');

// Define Booking Schema
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: [true, 'Booking must be for a showtime'],
    },
    seats: {
      type: [String],
      required: [true, 'Please provide at least one seat to book'],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'A booking must have at least one seat selected',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total booking amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
