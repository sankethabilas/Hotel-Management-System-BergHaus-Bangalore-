const express = require('express');
const router = express.Router();
const { getFeedbackAnalytics } = require('../controllers/analyticsController');

// Get feedback analytics
router.get('/feedback', getFeedbackAnalytics);

module.exports = router;
