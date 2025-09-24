const express = require('express');
const router = express.Router();
const { createBooking, getBooking, getUserBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// @route   POST /api/booking/create
// @desc    Create a new booking
// @access  Private
router.post('/create', protect, createBooking);

// @route   GET /api/booking/:id
// @desc    Get booking details
// @access  Private
router.get('/:id', protect, getBooking);

// @route   GET /api/booking/user/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/user/bookings', protect, getUserBookings);

module.exports = router;
