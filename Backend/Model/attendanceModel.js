const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  staffEmail: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent', 'half-day'],
    default: 'present'
  },
  workingHours: {
    type: Number,
    default: 0 // In hours
  },
  location: {
    type: String,
    default: 'BergHaus Bangalore Hotel'
  },
  qrCodeId: {
    type: String,
    required: true // To track which QR code was used
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
attendanceSchema.index({ staffId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ qrCodeId: 1 });

// Method to calculate working hours
attendanceSchema.methods.calculateWorkingHours = function() {
  if (this.checkOutTime) {
    const timeDiff = this.checkOutTime - this.checkInTime;
    this.workingHours = Math.round((timeDiff / (1000 * 60 * 60)) * 100) / 100;
  }
  return this.workingHours;
};

// Static method to get today's attendance
attendanceSchema.statics.getTodayAttendance = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.find({ date: today }).populate('staffId', 'name email department');
};

module.exports = mongoose.model('Attendance', attendanceSchema);