const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const { sendEmail } = require("./mailer");

const sendReminderEmails = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const upcomingShows = await Show.find({ showdate: today });
    if (!upcomingShows || upcomingShows.length === 0) return;

    for (const show of upcomingShows) {
      const bookings = await Booking.find({ showId: show.showId });
      for (const b of bookings) {
        if (b.userEmail) {
          await sendEmail({
            to: b.userEmail,
            subject: `Reminder: Your iMovies show is today! (${show.showtime})`,
            text: `Hello! This is a reminder for your movie booking (Booking ID: ${b.bookingId}) at ${show.theatreName} today at ${show.showtime}. Enjoy the show!`,
            html: `
              <div style="font-family: Arial, sans-serif; background: #141414; color: #fff; padding: 20px; border-radius: 8px;">
                <h2 style="color: #e50914;">iMovies Show Reminder</h2>
                <p>Hello movie lover! Your scheduled show is today:</p>
                <ul>
                  <li><strong>Theatre:</strong> ${show.theatreName}</li>
                  <li><strong>Time:</strong> ${show.showtime}</li>
                  <li><strong>Booking ID:</strong> ${b.bookingId}</li>
                </ul>
                <p>Enjoy your cinema experience!</p>
              </div>
            `,
          });
        }
      }
    }
  } catch (error) {
    console.error("Reminder service error:", error.message);
  }
};

module.exports = {
  sendReminderEmails,
};
