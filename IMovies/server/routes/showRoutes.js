const express = require('express');
const router = express.Router();
const { getShowById } = require('../controllers/showController');

router.get('/:id', getShowById);

module.exports = router;
