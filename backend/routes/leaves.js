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

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes for admin dashboard access
router.post('/', createLeaveRequest); // Staff can create leave requests
router.get('/my-requests', getMyLeaveRequests); // Staff can view their own requests
router.put('/:id/cancel', cancelLeaveRequest); // Staff can cancel their pending requests
router.get('/', getAllLeaveRequests);
router.put('/:id/status', updateLeaveStatus);
router.get('/statistics', getLeaveStatistics);

module.exports = router;
