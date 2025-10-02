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

// All routes require authentication
router.use(protect);

// Staff routes
router.post('/', createLeaveRequest); // Staff can create leave requests
router.get('/my-requests', getMyLeaveRequests); // Staff can view their own requests
router.put('/:id/cancel', cancelLeaveRequest); // Staff can cancel their pending requests

// Admin/HR routes
router.get('/', authorize('admin', 'frontdesk'), getAllLeaveRequests);
router.put('/:id/status', authorize('admin', 'frontdesk'), updateLeaveStatus);
router.get('/statistics', authorize('admin', 'frontdesk'), getLeaveStatistics);

module.exports = router;
