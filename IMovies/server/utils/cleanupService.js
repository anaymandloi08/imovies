const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");

const cleanupOldBookings = async () => {
  try {
    // Optional maintenance: remove bookings older than 90 days or temporary holds
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    // Log routine run
    // console.log("[Cleanup] Routine check executed");
  } catch (error) {
    console.error("Cleanup service error:", error.message);
  }
};

module.exports = {
  cleanupOldBookings,
};
