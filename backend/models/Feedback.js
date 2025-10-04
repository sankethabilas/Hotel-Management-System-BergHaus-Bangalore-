const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Front Desk', 'Restaurant', 'Room Service', 'Facilities', 'Management'],
      message: 'Invalid feedback category'
    }
  },
  rating: {
    checkIn: {
      type: Number,
      required: [true, 'Check-in rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    roomQuality: {
      type: Number,
      required: [true, 'Room quality rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    cleanliness: {
      type: Number,
      required: [true, 'Cleanliness rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    dining: {
      type: Number,
      required: [true, 'Dining rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    amenities: {
      type: Number,
      required: [true, 'Amenities rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [2000, 'Comments cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  anonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Responded', 'Closed'],
    default: 'Pending'
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin response cannot exceed 1000 characters']
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  respondedAt: {
    type: Date
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
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ guestId: 1 });

// Virtual for overall rating
feedbackSchema.virtual('overallRating').get(function() {
  const ratings = [
    this.rating.checkIn,
    this.rating.roomQuality,
    this.rating.cleanliness,
    this.rating.dining,
    this.rating.amenities
  ];
  return Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10;
});

// Virtual for formatted date
feedbackSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Pre-save middleware to set anonymous flag
feedbackSchema.pre('save', function(next) {
  if (this.anonymous) {
    this.guestId = null;
  }
  next();
});

// Instance method to mark as reviewed
feedbackSchema.methods.markAsReviewed = function() {
  this.status = 'Reviewed';
  return this.save();
};

// Instance method to add admin response
feedbackSchema.methods.addAdminResponse = function(response, staffId) {
  this.adminResponse = response;
  this.respondedBy = staffId;
  this.respondedAt = new Date();
  this.status = 'Responded';
  return this.save();
};

// Static method to get average ratings
feedbackSchema.statics.getAverageRatings = function(filter = {}) {
  return this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        avgCheckIn: { $avg: '$rating.checkIn' },
        avgRoomQuality: { $avg: '$rating.roomQuality' },
        avgCleanliness: { $avg: '$rating.cleanliness' },
        avgDining: { $avg: '$rating.dining' },
        avgAmenities: { $avg: '$rating.amenities' },
        totalCount: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get feedback by category
feedbackSchema.statics.getFeedbackByCategory = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgRating: { $avg: '$overallRating' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Feedback', feedbackSchema);
