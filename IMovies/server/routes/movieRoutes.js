const express = require("express");
const router = express.Router();
const Movie = require("../models/movieModel");
const fetchUser = require("../middlewares/fetchUser");

// ROUTE 1: Get all movies: GET "/api/movie/getallmovies"
router.get("/getallmovies", async (req, res) => {
  try {
    const { genre, search } = req.query;
    let query = {};

    if (genre && genre !== "All") {
      query.genres = { $in: [new RegExp(genre, "i")] };
    }
    if (search) {
      query.$or = [
        { movieName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });
    res.json({ success: true, movies });
  } catch (error) {
    console.error("Get all movies error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 2: Get single movie: GET "/api/movie/getmovie/:movieName"
router.get("/getmovie/:movieName", async (req, res) => {
  try {
    const param = decodeURIComponent(req.params.movieName);
    let movie = await Movie.findOne({
      movieName: { $regex: new RegExp(`^${param}$`, "i") },
    });

    if (!movie && param.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(param);
    }

    if (!movie) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }

    res.json({ success: true, movie });
  } catch (error) {
    console.error("Get single movie error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 3: Add a new movie: POST "/api/movie/addmovie"
router.post("/addmovie", async (req, res) => {
  try {
    const {
      movieName,
      description,
      genres,
      releaseDate,
      runtime,
      certification,
      media,
      rating,
      trailerUrl,
      language,
    } = req.body;

    if (!movieName || !description || !genres || !releaseDate) {
      return res.status(400).json({
        success: false,
        error: "Movie name, description, genres, and release date are required",
      });
    }

    const parsedGenres = Array.isArray(genres)
      ? genres
      : typeof genres === "string"
      ? genres.split(",").map((g) => g.trim())
      : [];

    const movie = await Movie.create({
      movieName,
      description,
      genres: parsedGenres,
      releaseDate: new Date(releaseDate),
      runtime: Number(runtime) || 120,
      certification: certification || "UA",
      media: media || "/default-movie.png",
      rating: Number(rating) || 8.0,
      trailerUrl: trailerUrl || "",
      language: language || "English",
    });

    res.status(201).json({
      success: true,
      movie,
      message: "Movie added successfully!",
    });
  } catch (error) {
    console.error("Add movie error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// ROUTE 4: Update movie: PUT "/api/movie/updatemovie/:id"
router.put("/updatemovie/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }
    res.json({ success: true, movie, message: "Movie updated successfully!" });
  } catch (error) {
    console.error("Update movie error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// ROUTE 5: Delete movie: DELETE "/api/movie/deletemovie/:id"
router.delete("/deletemovie/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: "Movie not found" });
    }
    res.json({ success: true, message: "Movie deleted successfully!" });
  } catch (error) {
    console.error("Delete movie error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
