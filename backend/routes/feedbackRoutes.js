const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  createFeedback,
  addAdminResponse,
  deleteFeedback
} = require('../controllers/feedbackController');

// Feedback routes
router.get('/', getAllFeedback);
router.post('/', createFeedback);
router.post('/:id/response', addAdminResponse);
router.delete('/:id', deleteFeedback);

module.exports = router;
