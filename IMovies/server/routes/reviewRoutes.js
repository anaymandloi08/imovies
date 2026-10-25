const express = require("express");
const router = express.Router();
const Review = require("../models/reviewModel");

// ROUTE 1: Add review: POST "/api/reviews/add"
router.post("/add", async (req, res) => {
  try {
    const { movieId, userEmail, username, rating, comment } = req.body;
    if (!movieId || !userEmail || !rating || !comment) {
      return res.status(400).json({ success: false, error: "Missing required review fields" });
    }

    const review = await Review.create({
      movieId,
      userEmail,
      username: username || userEmail.split("@")[0],
      rating: Number(rating),
      comment,
    });

    res.status(201).json({ success: true, review, message: "Review posted successfully!" });
  } catch (error) {
    console.error("Add review error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 2: Get reviews for movie: GET "/api/reviews/:movieId"
router.get("/:movieId", async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Get reviews error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
