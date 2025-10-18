const express = require('express');
const router = express.Router();

const {
  getUserActivityLogs,
  getAllActivityLogs,
  getActivitySummary,
  exportActivityLogs,
  getActivityStats
} = require('../controllers/activityLogController');

const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/activity-logs/user/:userId
// @desc    Get user activity logs
// @access  Private/Admin
router.get('/user/:userId', protect, authorize('admin'), getUserActivityLogs);

// @route   GET /api/activity-logs
// @desc    Get all activity logs
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getAllActivityLogs);

// @route   GET /api/activity-logs/summary
// @desc    Get activity summary/analytics
// @access  Private/Admin
router.get('/summary', protect, authorize('admin'), getActivitySummary);

// @route   GET /api/activity-logs/export
// @desc    Export activity logs to CSV
// @access  Private/Admin
router.get('/export', protect, authorize('admin'), exportActivityLogs);

// @route   GET /api/activity-logs/stats
// @desc    Get activity statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), getActivityStats);

module.exports = router;
