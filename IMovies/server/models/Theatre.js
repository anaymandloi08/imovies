const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theatre name'],
      trim: true
    },
    city: {
      type: String,
      required: true,
      default: 'Metropolis'
    },
    location: {
      type: String,
      required: true
    },
    screens: {
      type: Number,
      default: 4
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Theatre', theatreSchema);
