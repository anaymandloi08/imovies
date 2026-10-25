const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  movieName: {
    type: String,
    required: [true, "Movie name is required"],
    trim: true,
    minlength: [2, "Movie name must be at least 2 characters long"],
    maxlength: [200, "Movie name cannot exceed 200 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
  },
  genres: {
    type: [String],
    required: [true, "At least one genre is required"],
    validate: {
      validator: function (genres) {
        return Array.isArray(genres) && genres.length > 0;
      },
      message: "At least one genre is required",
    },
  },
  releaseDate: {
    type: Date,
    required: [true, "Release date is required"],
    validate: {
      validator: function (date) {
        return date instanceof Date && !isNaN(date);
      },
      message: "Invalid release date",
    },
  },
  media: {
    type: mongoose.Schema.Types.Mixed,
    default: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
  },
  runtime: {
    type: Number,
    default: 135,
  },
  certification: {
    type: String,
    default: "UA",
  },
  rating: {
    type: Number,
    default: 8.5,
  },
  language: {
    type: String,
    default: "English",
  },
  trailerUrl: {
    type: String,
    default: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
