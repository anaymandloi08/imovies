const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");
const Booking = require("../models/bookingModel");
const fetchUser = require("../middlewares/fetchUser");

const JWT_SECRET = process.env.JWT_SECRET || "iMovies_secret_jwt_key_2026";

// ROUTE 1: Register Admin: POST "/api/auth/admin/register"
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: "Please enter all required fields" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: "Admin with this email or username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      username,
      email: email.toLowerCase(),
      password: secPassword,
      role: "admin",
    });

    const data = {
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: "admin",
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      authToken,
      admin: {
        username: admin.username,
        email: admin.email,
        role: "admin",
      },
      message: "Admin registered successfully!",
    });
  } catch (error) {
    console.error("Admin register error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 2: Admin Login: POST "/api/auth/admin/login"
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please enter email and password" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({ success: false, error: "Invalid admin credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, admin.password);
    if (!passwordCompare) {
      return res.status(400).json({ success: false, error: "Invalid admin credentials" });
    }

    const data = {
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: "admin",
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      authToken,
      admin: {
        username: admin.username,
        email: admin.email,
        role: "admin",
      },
      message: "Admin login successful!",
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 3: Get logged-in Admin: GET "/api/auth/admin/getadmin"
router.get("/getadmin", fetchUser, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }
    res.json({ success: true, admin });
  } catch (error) {
    console.error("Get admin error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 4: Dashboard stats: GET "/api/auth/admin/stats"
router.get("/stats", fetchUser, async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();

    const bookings = await Booking.find();
    let totalRevenue = 0;
    bookings.forEach((b) => {
      if (b.ticketsData && b.ticketsData.totalPrice) {
        totalRevenue += Number(b.ticketsData.totalPrice) || 0;
      }
    });

    res.json({
      success: true,
      stats: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        totalUsers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
