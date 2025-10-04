const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  type: {
    type: String,
    enum: ['percentage', 'seasonal', 'category', 'time-based'],
    required: true
  },
  categories: [{
    type: String,
    enum: ['starters', 'mains', 'desserts', 'beverages', 'specials', 'breakfast', 'lunch', 'dinner']
  }],
  timeRanges: [{
    startTime: {
      type: String, // Format: "HH:MM" (24-hour)
      required: function() {
        return this.type === 'time-based';
      }
    },
    endTime: {
      type: String, // Format: "HH:MM" (24-hour)
      required: function() {
        return this.type === 'time-based';
      }
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  }],
  seasonalDates: {
    startDate: {
      type: Date,
      required: function() {
        return this.type === 'seasonal';
      }
    },
    endDate: {
      type: Date,
      required: function() {
        return this.type === 'seasonal';
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null // No limit if null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: null // No limit if null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
promotionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if promotion is currently valid
promotionSchema.methods.isCurrentlyValid = function() {
  if (!this.isActive) return false;
  
  if (this.type === 'seasonal') {
    const now = new Date();
    return now >= this.seasonalDates.startDate && now <= this.seasonalDates.endDate;
  }
  
  if (this.type === 'time-based') {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    return this.timeRanges.some(timeRange => {
      const dayMatch = timeRange.days.includes(currentDay);
      const timeMatch = currentTime >= timeRange.startTime && currentTime <= timeRange.endTime;
      return dayMatch && timeMatch;
    });
  }
  
  return true; // For percentage and category types
};

// Method to check if promotion applies to a specific category
promotionSchema.methods.appliesToCategory = function(category) {
  if (this.type === 'category') {
    return this.categories.includes(category);
  }
  return true; // For other types, applies to all categories
};

// Method to calculate discount amount
promotionSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isCurrentlyValid()) return 0;
  if (orderAmount < this.minOrderAmount) return 0;
  
  const discountAmount = (orderAmount * this.discountPercentage) / 100;
  
  if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
    return this.maxDiscountAmount;
  }
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Promotion', promotionSchema);
