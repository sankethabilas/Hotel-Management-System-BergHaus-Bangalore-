const express = require('express');
const router = express.Router();
const { getAllGuestsHistory, getGuestHistory } = require('../controllers/guestHistoryController');

// Get all guests history
router.get('/', getAllGuestsHistory);

// Get specific guest history
router.get('/:guestId', getGuestHistory);

module.exports = router;
