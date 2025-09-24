const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { downloadBookingConfirmation, generateBookingPDF } = require('../controllers/pdfController');

// @route   GET /api/pdf/booking/:reservationId
// @desc    Download booking confirmation PDF
// @access  Private
router.get('/booking/:reservationId', protect, downloadBookingConfirmation);

// @route   POST /api/pdf/booking/generate
// @desc    Generate PDF from booking data
// @access  Private
router.post('/booking/generate', protect, generateBookingPDF);

module.exports = router;
