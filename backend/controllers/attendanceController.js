const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Generate QR Code for attendance
const generateQRCode = async (req, res) => {
  try {
    // Generate unique QR code ID with timestamp
    const qrId = crypto.randomUUID();
    const timestamp = Date.now();
    const hotelLocation = 'BergHaus Bangalore Hotel';
    
    // QR Code data - contains hotel info and unique ID
    const qrData = {
      hotelId: 'berghaus-bangalore',
      qrId: qrId,
      location: hotelLocation,
      timestamp: timestamp,
      action: 'attendance',
      url: `${req.protocol}://${req.get('host')}/api/attendance/scan/${qrId}`
    };

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#006bb8', // Your primary blue color
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeImage,
      qrId: qrId,
      message: 'QR Code generated successfully',
      expiresIn: '24 hours'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

// Handle QR code scan for attendance
const scanQRCode = async (req, res) => {
  try {
    const { qrId } = req.params;
    const { staffId, action = 'checkin' } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      });
    }

    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date();

    // Check if already checked in today
    let attendance = await Attendance.findOne({ 
      staffId: staffId, 
      date: today 
    });

    if (action === 'checkin') {
      if (attendance && attendance.checkInTime) {
        return res.status(400).json({
          success: false,
          message: 'Already checked in today',
          attendance: attendance
        });
      }

      // Determine status based on time (assuming 9 AM is start time)
      const startTime = new Date();
      startTime.setHours(9, 0, 0, 0);
      const status = currentTime > startTime ? 'late' : 'present';

      // Create new attendance record
      attendance = new Attendance({
        staffId: staffId,
        staffName: staff.fullName,
        staffEmail: staff.email,
        department: staff.department,
        checkInTime: currentTime,
        date: today,
        status: status,
        qrCodeId: qrId,
        ipAddress: req.ip,
        deviceInfo: req.get('User-Agent') || 'Unknown device'
      });

      await attendance.save();

      res.json({
        success: true,
        message: `Check-in successful! Welcome ${staff.fullName}`,
        attendance: attendance,
        status: status
      });

    } else if (action === 'checkout') {
      if (!attendance) {
        return res.status(400).json({
          success: false,
          message: 'No check-in record found for today'
        });
      }

      if (attendance.checkOutTime) {
        return res.status(400).json({
          success: false,
          message: 'Already checked out today'
        });
      }

      // Update checkout time and calculate working hours
      attendance.checkOutTime = currentTime;
      attendance.calculateWorkingHours();
      await attendance.save();

      res.json({
        success: true,
        message: `Check-out successful! Goodbye ${staff.fullName}`,
        attendance: attendance,
        workingHours: attendance.workingHours
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process attendance',
      error: error.message
    });
  }
};

// Get all attendance records
const getAllAttendance = async (req, res) => {
  try {
    const { date, staffId, page = 1, limit = 50 } = req.query;
    
    let filter = {};
    if (date) filter.date = date;
    if (staffId) filter.staffId = staffId;

    const attendance = await Attendance.find(filter)
      .populate('staffId', 'fullName email department phone')
      .sort({ checkInTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      attendance: attendance,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Get today's attendance summary
const getTodayAttendance = async (req, res) => {
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
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let filter = {};
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$staffId',
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalHours: { $sum: '$workingHours' },
          avgHours: { $avg: '$workingHours' }
        }
      },
      {
        $lookup: {
          from: 'staffs',
          localField: '_id',
          foreignField: '_id',
          as: 'staff'
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance statistics',
      error: error.message
    });
  }
};

module.exports = {
  generateQRCode,
  scanQRCode,
  getAllAttendance,
  getTodayAttendance,
  getAttendanceStats
};