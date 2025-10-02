const express = require('express');
const router = express.Router();
const {
  generateQRCode,
  scanQRCode,
  getAllAttendance,
  getTodayAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

const { protect, authorize } = require('../middleware/auth');

// Public routes for QR code generation and scanning
router.get('/qr/generate', generateQRCode);
router.post('/scan/:qrId', scanQRCode);

// Protected routes
router.use(protect);
router.get('/', authorize('admin', 'frontdesk'), getAllAttendance);
router.get('/today', authorize('admin', 'frontdesk'), getTodayAttendance);
router.get('/stats', authorize('admin', 'frontdesk'), getAttendanceStats);

module.exports = router;