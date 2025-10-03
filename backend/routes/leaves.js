const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getAllLeaveRequests,
  getMyLeaveRequests,
  updateLeaveStatus,
  cancelLeaveRequest,
  getLeaveStatistics,
  deleteLeaveRequest
} = require('../controllers/leaveController');

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes (no authentication required for admin functions)
router.get('/statistics', getLeaveStatistics); // Get statistics (must be before /:id routes)
router.get('/my-requests', getMyLeaveRequests); // Get user's own requests  
router.get('/', getAllLeaveRequests); // Get all leave requests
router.post('/', createLeaveRequest); // Create leave requests (handled in controller)
router.put('/:id/cancel', cancelLeaveRequest); // Cancel requests
router.put('/:id/status', updateLeaveStatus); // Update status
router.delete('/:id', deleteLeaveRequest); // Delete requests

module.exports = router;
