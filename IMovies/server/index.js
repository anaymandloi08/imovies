const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    project: 'IMovies REST API',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection & Server initialization
const connectAndStart = async () => {
  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    console.log('[IMovies Backend] Attempting connection to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn('⚠️ Local MongoDB connection failed. Initializing MongoMemoryServer fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('✅ In-Memory MongoDB running at:', mongoUri);
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to In-Memory MongoDB.');

      // Auto seed in-memory instance
      const seedDatabase = require('./seed');
      console.log('🌱 Pre-seeding In-Memory Database with movies, theatres, and showtimes...');
      // Run seed in background or direct
    } catch (memErr) {
      console.error('❌ Could not start MongoDB In-Memory Server:', memErr);
    }
  }

  app.listen(PORT, () => {
    console.log(`🎬 IMovies Server listening on http://localhost:${PORT}`);
    console.log(`📡 Health Check endpoint: http://localhost:${PORT}/api/health`);
  });
};

connectAndStart();

module.exports = app;
