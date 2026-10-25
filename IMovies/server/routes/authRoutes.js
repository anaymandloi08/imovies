const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const fetchUser = require("../middlewares/fetchUser");

const JWT_SECRET = process.env.JWT_SECRET || "iMovies_secret_jwt_key_2026";

// ROUTE 1: Register a new user: POST "/api/auth/register"
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: "Please enter all required fields" });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ success: false, error: "Username must be between 3 and 20 characters" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User with this email or username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: secPassword,
    });

    const data = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: "user",
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      authToken,
      user: {
        username: user.username,
        email: user.email,
        role: "user",
      },
      message: "Registration successful!",
    });
  } catch (error) {
    console.error("User register error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 2: Authenticate a user: POST "/api/auth/login"
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please enter email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const data = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: "user",
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      authToken,
      user: {
        username: user.username,
        email: user.email,
        role: "user",
      },
      message: "Login successful!",
    });
  } catch (error) {
    console.error("User login error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 3: Get logged-in user details: GET "/api/auth/getuser"
router.get("/getuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ROUTE 4: Update user profile: PUT "/api/auth/updateuser"
router.put("/updateuser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (username) {
      user.username = username;
    }
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: "user",
      },
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Update user error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
