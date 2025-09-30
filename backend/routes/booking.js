const express = require('express');
const router = express.Router();
const { createBooking, getBookingByReference, getUserBookings, cancelBooking, updateArrivalTime } = require('../controllers/bookingController');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   POST /api/booking/create
// @desc    Create a new booking
// @access  Public (guests can book, but authenticated users get better experience)
router.post('/create', optionalAuth, createBooking);

// @route   GET /api/booking/:reference
// @desc    Get booking details by reference
// @access  Private
router.get('/:reference', protect, getBookingByReference);

// @route   GET /api/booking/user/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/user/bookings', protect, getUserBookings);

// @route   POST /api/booking/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.post('/:id/cancel', protect, cancelBooking);

// @route   PUT /api/booking/:id/arrival-time
// @desc    Update booking arrival time
// @access  Private
router.put('/:id/arrival-time', protect, updateArrivalTime);

module.exports = router;
