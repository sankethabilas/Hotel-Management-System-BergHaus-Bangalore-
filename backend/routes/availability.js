const express = require('express');
const router = express.Router();
const { checkAvailability, getAvailabilityCalendar, bookRoom } = require('../controllers/availabilityController');
const { protect } = require('../middleware/auth');

// @route   GET /api/availability
// @desc    Check room availability for date range
// @access  Public
router.get('/', checkAvailability);

// @route   GET /api/availability/calendar
// @desc    Get room availability calendar data
// @access  Public
router.get('/calendar', getAvailabilityCalendar);

// @route   POST /api/availability/book
// @desc    Book a room
// @access  Private
router.post('/book', protect, bookRoom);

module.exports = router;
