const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendanceModel');

// Simple test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Attendance routes working!' });
});

// Generate QR Code for attendance (simplified for now)
router.get('/qr/generate', async (req, res) => {
  try {
    const QRCode = require('qrcode');
    const crypto = require('crypto');
    
    const qrId = crypto.randomUUID();
    const qrData = {
      hotelId: 'berghaus-bangalore',
      qrId: qrId,
      timestamp: Date.now(),
      action: 'attendance'
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      color: { dark: '#006bb8', light: '#FFFFFF' }
    });

    res.json({
      success: true,
      qrCode: qrCodeImage,
      qrId: qrId,
      message: 'QR Code generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
});

// Get today's attendance
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.find({ date: today })
      .populate('staffId', 'fullName email department')
      .sort({ checkInTime: -1 });

    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      checkedOut: attendance.filter(a => a.checkOutTime).length,
      stillWorking: attendance.filter(a => !a.checkOutTime).length
    };

    res.json({
      success: true,
      date: today,
      summary: summary,
      attendance: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s attendance',
      error: error.message
    });
  }
});

module.exports = router;