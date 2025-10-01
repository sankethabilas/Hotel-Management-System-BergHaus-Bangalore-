const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['breakfast', 'lunch', 'dinner', 'beverages', 'desserts', 'snacks', 'appetizers', 'specials'],
      message: 'Category must be one of: breakfast, lunch, dinner, beverages, desserts, snacks, appetizers, specials'
    }
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'anytime'],
    default: 'anytime'
  },
  availableHours: {
    start: {
      type: String, // Format: "HH:MM" (24-hour)
      default: "00:00"
    },
    end: {
      type: String, // Format: "HH:MM" (24-hour)  
      default: "23:59"
    }
  },
  image: {
    type: String, // URL to the uploaded image
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'very-hot'],
    default: 'none'
  },
  preparationTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [300, 'Preparation time cannot exceed 300 minutes']
  },
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
    default: null
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    // Customization fields
    dietaryInfo: {
      vegetarian: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      glutenFree: { type: Boolean, default: false },
      nutFree: { type: Boolean, default: false },
      dairyFree: { type: Boolean, default: false },
      halal: { type: Boolean, default: false },
      kosher: { type: Boolean, default: false }
    },
    customizationOptions: {
      allowPortionSize: { type: Boolean, default: true },
      allowModifications: { type: Boolean, default: true },
      allowSpecialInstructions: { type: Boolean, default: true },
      commonModifications: { type: [String], default: [] }
    },
    portionPricing: {
      small: { type: Number, default: 0 }, // Discount for small
      regular: { type: Number, default: 0 }, // Base price
      large: { type: Number, default: 0 } // Extra charge for large
    }
}, {
  timestamps: true
});

// Index for better query performance
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ isPopular: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

// Virtual for discounted price
menuItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Method to check if item is available at current time
menuItemSchema.methods.isAvailableNow = function() {
  if (!this.isAvailable) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  // Check if current time is within available hours
  return currentTime >= this.availableHours.start && currentTime <= this.availableHours.end;
};

// Method to get appropriate meal type based on current time
menuItemSchema.statics.getCurrentMealType = function() {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (currentHour >= 6 && currentHour < 11) {
    return 'breakfast';
  } else if (currentHour >= 11 && currentHour < 15) {
    return 'lunch';
  } else if (currentHour >= 15 && currentHour < 22) {
    return 'dinner';
  } else {
    return 'anytime';
  }
};

// Ensure virtual fields are serialized
menuItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
