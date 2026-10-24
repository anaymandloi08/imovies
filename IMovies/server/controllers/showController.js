const Show = require('../models/Show');

// @desc    Get show details by ID (including bookedSeats & seat map configuration)
// @route   GET /api/shows/:id
// @access  Public
exports.getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title genre duration rating posterUrl bannerUrl')
      .populate('theatre', 'name city location');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    res.status(200).json({
      success: true,
      show
    });
  } catch (error) {
    next(error);
  }
};
