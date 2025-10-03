const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  reasonForContact: {
    type: String,
    required: [true, 'Reason for contact is required'],
    enum: {
      values: ['booking', 'complaint', 'corporate', 'event', 'other'],
      message: 'Invalid reason for contact'
    }
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  response: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'phone', 'email', 'walk-in', 'other']
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
contactMessageSchema.index({ email: 1, createdAt: -1 });
contactMessageSchema.index({ status: 1, priority: 1 });
contactMessageSchema.index({ reasonForContact: 1 });

// Virtual for formatted creation date
contactMessageSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Pre-save middleware to set priority based on reason
contactMessageSchema.pre('save', function(next) {
  if (this.reasonForContact === 'complaint') {
    this.priority = 'high';
  } else if (this.reasonForContact === 'booking') {
    this.priority = 'medium';
  } else if (this.reasonForContact === 'event') {
    this.priority = 'medium';
  } else if (this.reasonForContact === 'corporate') {
    this.priority = 'low';
  } else {
    this.priority = 'low';
  }
  next();
});

// Instance method to mark as read
contactMessageSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Instance method to assign to staff
contactMessageSchema.methods.assignToStaff = function(staffId) {
  this.assignedTo = staffId;
  this.status = 'in-progress';
  return this.save();
};

// Instance method to add response
contactMessageSchema.methods.addResponse = function(response, staffId) {
  this.response = response;
  this.respondedBy = staffId;
  this.respondedAt = new Date();
  this.status = 'resolved';
  return this.save();
};

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
