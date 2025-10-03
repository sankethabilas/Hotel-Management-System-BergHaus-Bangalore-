const express = require('express');
const router = express.Router();
const {
  generateQRCode,
  scanQRCode,
  getAllAttendance,
  getTodayAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes for QR code generation and scanning
router.get('/qr/generate', generateQRCode);
router.post('/scan/:qrId', scanQRCode);

// Public routes for admin dashboard access
router.get('/', getAllAttendance);
router.get('/today', getTodayAttendance);
router.get('/stats', getAttendanceStats);

module.exports = router;