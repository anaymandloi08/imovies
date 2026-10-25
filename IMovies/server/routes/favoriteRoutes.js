const express = require("express");
const router = express.Router();
const Favorite = require("../models/favoriteModel");
const Movie = require("../models/movieModel");

// ROUTE 1: Add to favorites: POST "/api/favorite/add"
router.post("/add", async (req, res) => {
  try {
    const { userEmail, movieId, movieData } = req.body;
    if (!userEmail || !movieId) {
      return res.status(400).json({ success: false, error: "userEmail and movieId are required" });
    }

    const existing = await Favorite.findOne({
      userEmail: userEmail.toLowerCase(),
      movieId,
    });
    if (existing) {
      return res.json({ success: true, message: "Movie already in favorites", favorite: existing });
    }

    let mData = movieData;
    if (!mData) {
      const foundMovie = await Movie.findOne({
        $or: [{ _id: movieId.match(/^[0-9a-fA-F]{24}$/) ? movieId : null }, { movieName: movieId }],
      });
      mData = foundMovie || {};
    }

    const favorite = await Favorite.create({
      userEmail: userEmail.toLowerCase(),
      movieId,
      movieData: mData,
    });

    res.status(201).json({ success: true, favorite, message: "Added to favorites!" });
  } catch (error) {
    console.error("Add favorite error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 2: Remove from favorites: POST "/api/favorite/remove"
router.post("/remove", async (req, res) => {
  try {
    const { userEmail, movieId } = req.body;
    await Favorite.findOneAndDelete({
      userEmail: userEmail.toLowerCase(),
      movieId,
    });
    res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 3: Get user favorites: GET "/api/favorite/userfavorites/:userEmail"
router.get("/userfavorites/:userEmail", async (req, res) => {
  try {
    const userEmail = req.params.userEmail.toLowerCase();
    const favorites = await Favorite.find({ userEmail }).sort({ createdAt: -1 });

    // Ensure up-to-date movie details
    const enriched = await Promise.all(
      favorites.map(async (fav) => {
        let movie = await Movie.findOne({
          $or: [{ _id: fav.movieId.match(/^[0-9a-fA-F]{24}$/) ? fav.movieId : null }, { movieName: fav.movieId }],
        });
        return {
          ...fav.toObject(),
          movie: movie || fav.movieData,
        };
      })
    );

    res.json({ success: true, favorites: enriched });
  } catch (error) {
    console.error("Get user favorites error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
