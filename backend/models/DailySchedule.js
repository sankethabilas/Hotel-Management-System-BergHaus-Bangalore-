const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  timeSlot: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'night']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  requiredCount: {
    type: Number,
    required: true,
    min: 1
  },
  actualCount: {
    type: Number,
    default: 0
  }
});

const dailyScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Reception', 'Housekeeping', 'Kitchen', 'Maintenance'],
    index: true
  },
  shifts: [shiftSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft'
  },
  totalAssigned: {
    type: Number,
    default: 0
  },
  coverageStatus: {
    type: String,
    enum: ['covered', 'understaffed', 'overstaffed'],
    default: 'covered'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
dailyScheduleSchema.index({ date: 1, department: 1 });
dailyScheduleSchema.index({ status: 1, date: 1 });

// Virtual for coverage percentage
dailyScheduleSchema.virtual('coveragePercentage').get(function() {
  if (this.shifts.length === 0) return 0;
  
  const totalRequired = this.shifts.reduce((sum, shift) => sum + shift.requiredCount, 0);
  const totalAssigned = this.shifts.reduce((sum, shift) => sum + shift.actualCount, 0);
  
  return totalRequired > 0 ? Math.round((totalAssigned / totalRequired) * 100) : 0;
});

// Method to check if schedule is fully covered
dailyScheduleSchema.methods.isFullyCovered = function() {
  return this.shifts.every(shift => shift.actualCount >= shift.requiredCount);
};

// Method to get understaffed shifts
dailyScheduleSchema.methods.getUnderstaffedShifts = function() {
  return this.shifts.filter(shift => shift.actualCount < shift.requiredCount);
};

// Method to get overstaffed shifts
dailyScheduleSchema.methods.getOverstaffedShifts = function() {
  return this.shifts.filter(shift => shift.actualCount > shift.requiredCount);
};

module.exports = mongoose.model('DailySchedule', dailyScheduleSchema);
