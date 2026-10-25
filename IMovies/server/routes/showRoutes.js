const express = require("express");
const router = express.Router();
const Show = require("../models/showModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const fetchUser = require("../middlewares/fetchUser");

// ROUTE 1: Get all shows: GET "/api/shows/getallshows"
router.get("/getallshows", async (req, res) => {
  try {
    const shows = await Show.find().sort({ showdate: 1, showtime: 1 });
    res.json({ success: true, shows });
  } catch (error) {
    console.error("Get all shows error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 2: Get movie shows by movie name: GET "/api/shows/getmovieshows/:movieName"
// Matches Page 30: resData?.data?.showData
router.get("/getmovieshows/:movieName", async (req, res) => {
  try {
    const movieName = decodeURIComponent(req.params.movieName);
    
    // Find movie first to get its ID or name
    let movie = await Movie.findOne({
      movieName: { $regex: new RegExp(`^${movieName}$`, "i") },
    });
    
    let query = {};
    if (movie) {
      query.$or = [{ movieId: movie._id.toString() }, { movieId: movie.movieName }];
    } else {
      query.$or = [{ movieId: movieName }];
    }

    const shows = await Show.find(query);

    // Attach theatre information (pricing, seat maps) for convenience
    const enrichedShows = await Promise.all(
      shows.map(async (show) => {
        const theatre = await Theatre.findOne({ theatreName: show.theatreName });
        return {
          ...show.toObject(),
          theatreDetails: theatre || null,
        };
      })
    );

    res.json({
      success: true,
      data: {
        showData: enrichedShows,
      },
    });
  } catch (error) {
    console.error("Get movie shows error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 3: Get single show by showId: GET "/api/shows/getshow/:showId"
router.get("/getshow/:showId", async (req, res) => {
  try {
    const param = req.params.showId;
    let show = await Show.findOne({ showId: param });
    if (!show && param.match(/^[0-9a-fA-F]{24}$/)) {
      show = await Show.findById(param);
    }
    if (!show) {
      return res.status(404).json({ success: false, error: "Show not found" });
    }

    // Also fetch movie and theatre details for the show
    let movie = null;
    if (show.movieId.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(show.movieId);
    }
    if (!movie) {
      movie = await Movie.findOne({ movieName: show.movieId });
    }

    const theatre = await Theatre.findOne({ theatreName: show.theatreName });

    res.json({
      success: true,
      show,
      movie,
      theatre,
    });
  } catch (error) {
    console.error("Get show details error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 4: Add show: POST "/api/shows/addshow"
router.post("/addshow", async (req, res) => {
  try {
    const { adminEmail, showId, movieId, theatreName, showdate, showtime, tickets } = req.body;

    if (!adminEmail || !showId || !movieId || !theatreName || !showdate || !showtime) {
      return res.status(400).json({
        success: false,
        error: "All fields (adminEmail, showId, movieId, theatreName, showdate, showtime) are required",
      });
    }

    const existing = await Show.findOne({ showId });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Show with this showId already exists",
      });
    }

    // Initialize tickets data from theatre if not provided
    let initialTickets = tickets;
    if (!initialTickets || Object.keys(initialTickets).length === 0) {
      const theatre = await Theatre.findOne({ theatreName });
      initialTickets = {
        bookedSeats: [],
        lockedSeats: [],
        balconySeatPrice: theatre?.balconySeatPrice || 300,
        middleSeatPrice: theatre?.middleSeatPrice || 200,
        lowerSeatPrice: theatre?.lowerSeatPrice || 120,
      };
    }

    const show = await Show.create({
      adminEmail,
      showId,
      movieId,
      theatreName,
      showdate,
      showtime,
      tickets: initialTickets,
    });

    res.status(201).json({
      success: true,
      show,
      message: "Show added successfully!",
    });
  } catch (error) {
    console.error("Add show error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// ROUTE 5: Delete show: DELETE "/api/shows/deleteshow/:showId"
router.delete("/deleteshow/:showId", async (req, res) => {
  try {
    const param = req.params.showId;
    let show = await Show.findOneAndDelete({ showId: param });
    if (!show && param.match(/^[0-9a-fA-F]{24}$/)) {
      show = await Show.findByIdAndDelete(param);
    }
    if (!show) {
      return res.status(404).json({ success: false, error: "Show not found" });
    }
    res.json({ success: true, message: "Show deleted successfully!" });
  } catch (error) {
    console.error("Delete show error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
