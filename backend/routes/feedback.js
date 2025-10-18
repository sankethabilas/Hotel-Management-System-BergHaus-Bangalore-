const express = require('express');
const Feedback = require('../models/Feedback');
const feedbackController = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for feedback submissions
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 feedback submissions per windowMs
  message: {
    success: false,
    message: 'Too many feedback submissions from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/', feedbackLimiter, feedbackController.createFeedback);
router.get('/public', feedbackController.getPublicReviewedFeedback);

// Protected routes (admin/frontdesk only) - Temporarily disabled auth for testing
router.get('/all', feedbackController.getAllFeedback); // Changed from '/' to '/all'
router.get('/analytics', feedbackController.getFeedbackAnalytics);
router.get('/guest/:guestId', feedbackController.getFeedbackByGuest);
router.get('/:id', feedbackController.getFeedbackById);
router.patch('/:id/status', feedbackController.updateFeedbackStatus);
router.patch('/:id/response', feedbackController.addAdminResponse);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
