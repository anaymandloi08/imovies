const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true
    },
    genre: {
      type: [String],
      required: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a movie description']
    },
    duration: {
      type: Number, // In minutes
      required: true
    },
    rating: {
      type: Number, // Out of 10
      default: 8.0
    },
    language: {
      type: String,
      default: 'English'
    },
    releaseDate: {
      type: String,
      required: true
    },
    posterUrl: {
      type: String,
      required: true
    },
    bannerUrl: {
      type: String,
      required: true
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    director: {
      type: String,
      default: ''
    },
    cast: {
      type: [String],
      default: []
    },
    isNowShowing: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Movie', movieSchema);
