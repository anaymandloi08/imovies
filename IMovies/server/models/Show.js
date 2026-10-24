const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    screenName: {
      type: String,
      default: 'Screen 1'
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    time: {
      type: String, // e.g. "07:30 PM"
      required: true
    },
    standardPrice: {
      type: Number,
      default: 250
    },
    vipPrice: {
      type: Number,
      default: 450
    },
    rows: {
      type: [String],
      default: ['A', 'B', 'C', 'D', 'E', 'F']
    },
    seatsPerRow: {
      type: Number,
      default: 10
    },
    bookedSeats: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly query shows by movie and date
showSchema.index({ movie: 1, date: 1 });

module.exports = mongoose.model('Show', showSchema);
