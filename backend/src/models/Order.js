const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    // Customization fields
    customization: {
      dietaryRestrictions: { type: [String], default: [] },
      portionSize: { 
        type: String, 
        enum: ['small', 'regular', 'large'], 
        default: 'regular' 
      },
      modifications: { type: [String], default: [] },
      specialInstructions: { type: String, default: '' },
      cookingPreferences: { type: [String], default: [] }
    }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true
    },
    roomNumber: {
      type: String,
      trim: true
    },
    specialInstructions: {
      type: String,
      maxlength: [500, 'Special instructions cannot exceed 500 characters']
    }
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  serviceCharge: {
    type: Number,
    default: 0,
    min: [0, 'Service charge cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'room-charge'],
    default: 'cash'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get count of orders for today
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    this.orderNumber = `BH${dateStr}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Index for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order age
orderSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for isDelayed
orderSchema.virtual('isDelayed').get(function() {
  if (this.estimatedDelivery && this.status !== 'delivered') {
    return new Date() > this.estimatedDelivery;
  }
  return false;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
