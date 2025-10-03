const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getAllLeaveRequests,
  getMyLeaveRequests,
  updateLeaveStatus,
  cancelLeaveRequest,
  getLeaveStatistics
} = require('../controllers/leaveController');

const { protect, authorize } = require('../middleware/auth');

// Remove authentication requirements for now
router.get('/', getAllLeaveRequests); // Get all leave requests
router.post('/', createLeaveRequest); // Create leave requests
router.get('/my-requests', getMyLeaveRequests); // Get user's own requests
router.put('/:id/cancel', cancelLeaveRequest); // Cancel requests
router.put('/:id/status', updateLeaveStatus); // Update status
router.get('/statistics', getLeaveStatistics); // Get statistics

module.exports = router;
