const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['deal', 'promotion', 'announcement', 'feature'],
    default: 'deal'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  buttonText: {
    type: String,
    default: 'Learn More'
  },
  buttonLink: {
    type: String,
    default: '/guest/menu'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Index for active banners with priority sorting
bannerSchema.index({ isActive: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('Banner', bannerSchema);
