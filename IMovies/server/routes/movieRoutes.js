const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getMovieShows } = require('../controllers/movieController');

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.get('/:id/shows', getMovieShows);

module.exports = router;
