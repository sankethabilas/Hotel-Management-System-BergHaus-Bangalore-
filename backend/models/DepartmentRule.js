const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'night']
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  requiredStaff: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  }
});

const departmentRuleSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    unique: true,
    enum: ['Reception', 'Housekeeping', 'Kitchen', 'Maintenance']
  },
  minStaff: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  maxStaff: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  timeSlots: [timeSlotSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: 200
  },
  specialRequirements: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
departmentRuleSchema.index({ department: 1, isActive: 1 });

// Method to get total required staff for a day
departmentRuleSchema.methods.getTotalRequiredStaff = function() {
  return this.timeSlots.reduce((sum, slot) => sum + slot.requiredStaff, 0);
};

// Method to validate time slots don't overlap
departmentRuleSchema.methods.validateTimeSlots = function() {
  const slots = this.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  for (let i = 0; i < slots.length - 1; i++) {
    if (slots[i].endTime > slots[i + 1].startTime) {
      return false; // Overlapping time slots
    }
  }
  return true;
};

// Pre-save validation
departmentRuleSchema.pre('save', function(next) {
  if (!this.validateTimeSlots()) {
    return next(new Error('Time slots cannot overlap'));
  }
  next();
});

module.exports = mongoose.model('DepartmentRule', departmentRuleSchema);
