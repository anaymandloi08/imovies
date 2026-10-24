const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with optional title search & genre filter
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res, next) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shows for a specific movie (grouped by theatre & date)
// @route   GET /api/movies/:id/shows
// @access  Public
exports.getMovieShows = async (req, res, next) => {
  try {
    const { date } = req.query;
    let query = { movie: req.params.id };

    if (date) {
      query.date = date;
    }

    const shows = await Show.find(query)
      .populate('theatre', 'name city location screens')
      .populate('movie', 'title duration rating posterUrl')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      shows
    });
  } catch (error) {
    next(error);
  }
};
