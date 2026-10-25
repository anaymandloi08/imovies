const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const showRoutes = require("./routes/showRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const movieRoutes = require("./routes/movieRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
require("dotenv").config({ path: "./.env" });

// Prefer IPv4 results to avoid ::1 (IPv6) connections when providers expect IPv4 (Page 14)
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const { verifyTransport } = require("./utils/mailer");
const cron = require("node-cron");
const { sendReminderEmails } = require("./utils/reminderService");
const { cleanupOldBookings } = require("./utils/cleanupService");
const { seedDefaultData } = require("./seedData");

const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});

// Configure Mongoose (Page 16) with resilient auto-start
const mongoUri = process.env.MONGODB_CONNECTION_LINK || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imovies";
let isConnected = false;
let isConnecting = false;

const connectToMongo = async () => {
  if (isConnected || isConnecting) return;
  isConnecting = true;
  try {
    if (process.env.MONGODB_CONNECTION_LINK && process.env.MONGODB_CONNECTION_LINK.startsWith("mongodb+srv://")) {
      await mongoose.connect(process.env.MONGODB_CONNECTION_LINK);
      isConnected = true;
      console.log("Connected to MongoDB successfully");
      await seedDefaultData();
    } else {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 });
        isConnected = true;
        console.log("Connected to MongoDB successfully");
        await seedDefaultData();
      } catch (localError) {
        console.log("Local MongoDB not reachable, starting embedded in-memory MongoDB...");
        await mongoose.disconnect();
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create({
          instance: { launchTimeout: 60000 },
        });
        const inMemUri = mongod.getUri();
        await mongoose.connect(inMemUri);
        isConnected = true;
        console.log("Connected to Resilient In-Memory MongoDB successfully");
        await seedDefaultData();
      }
    }
  } catch (error) {
    console.error("X MongoDB connection error:", error.message);
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on("error", (err) => {
  if (isConnected) {
    console.error("MongoDB connection error:", err);
  }
});

connectToMongo();

// Verify mailer transport (Page 14)
verifyTransport();

// Setup scheduled cron jobs (Page 14)
cron.schedule("0 8 * * *", () => {
  sendReminderEmails();
});

cron.schedule("0 0 * * *", () => {
  cleanupOldBookings();
});

// Mount Routes as specified in Page 14
app.use("/api/auth", authRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/theatre", theatreRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

module.exports = app;
