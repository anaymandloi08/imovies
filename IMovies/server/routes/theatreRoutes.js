const express = require("express");
const router = express.Router();
const Theatre = require("../models/theatreModel");
const fetchUser = require("../middlewares/fetchUser");

// ROUTE 1: Get all theatres: GET "/api/theatre/getalltheatres"
router.get("/getalltheatres", async (req, res) => {
  try {
    const theatres = await Theatre.find().sort({ createdAt: -1 });
    res.json({ success: true, theatres });
  } catch (error) {
    console.error("Get all theatres error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 2: Get single theatre: GET "/api/theatre/gettheatre/:theatreId"
router.get("/gettheatre/:theatreId", async (req, res) => {
  try {
    const param = req.params.theatreId;
    let theatre = await Theatre.findOne({ theatreId: param });
    if (!theatre && param.match(/^[0-9a-fA-F]{24}$/)) {
      theatre = await Theatre.findById(param);
    }
    if (!theatre) {
      return res.status(404).json({ success: false, error: "Theatre not found" });
    }
    res.json({ success: true, theatre });
  } catch (error) {
    console.error("Get theatre error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 3: Add theatre: POST "/api/theatre/addtheatre"
router.post("/addtheatre", async (req, res) => {
  try {
    const {
      theatreName,
      theatreId,
      location,
      balconySeatPrice,
      middleSeatPrice,
      lowerSeatPrice,
      balconySeats,
      middleSeats,
      lowerSeats,
      adminName,
    } = req.body;

    if (!theatreName || !theatreId || !location) {
      return res.status(400).json({
        success: false,
        error: "Theatre name, ID, and location are required",
      });
    }

    const existing = await Theatre.findOne({ theatreId });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Theatre with this ID already exists",
      });
    }

    // Default seating grids if not explicitly provided
    const defaultBalcony = balconySeats || { rows: 2, cols: 8, seats: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"] };
    const defaultMiddle = middleSeats || { rows: 3, cols: 8, seats: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"] };
    const defaultLower = lowerSeats || { rows: 2, cols: 8, seats: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8"] };

    const theatre = await Theatre.create({
      theatreName,
      theatreId,
      location,
      balconySeatPrice: Number(balconySeatPrice) || 300,
      middleSeatPrice: Number(middleSeatPrice) || 200,
      lowerSeatPrice: Number(lowerSeatPrice) || 120,
      balconySeats: defaultBalcony,
      middleSeats: defaultMiddle,
      lowerSeats: defaultLower,
      adminName: adminName || "Admin",
    });

    res.status(201).json({
      success: true,
      theatre,
      message: "Theatre added successfully!",
    });
  } catch (error) {
    console.error("Add theatre error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// ROUTE 4: Delete theatre: DELETE "/api/theatre/deletetheatre/:id"
router.delete("/deletetheatre/:id", async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, error: "Theatre not found" });
    }
    res.json({ success: true, message: "Theatre deleted successfully!" });
  } catch (error) {
    console.error("Delete theatre error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
