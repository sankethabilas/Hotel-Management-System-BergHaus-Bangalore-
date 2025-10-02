const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
    required: true
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: [true, 'Reservation ID is required']
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  guestEmail: {
    type: String,
    required: [true, 'Guest email is required'],
    trim: true,
    lowercase: true
  },
  items: [{
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    category: {
      type: String,
      enum: ['room', 'food', 'service', 'tax', 'other'],
      default: 'other'
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate cannot be negative'],
    max: [1, 'Tax rate cannot exceed 100%'],
    default: 0.1 // 10% default tax rate
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', 'other'],
    default: null
  },
  paidAmount: {
    type: Number,
    min: [0, 'Paid amount cannot be negative'],
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pdfPath: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Generate bill ID before saving
billSchema.pre('save', function(next) {
  if (!this.billId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.billId = `BILL${timestamp}${random}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.tax = this.subtotal * this.taxRate;
  this.total = this.subtotal + this.tax - this.discount;
  
  next();
});

// Indexes for efficient queries
billSchema.index({ reservationId: 1 });
billSchema.index({ guestId: 1 });
billSchema.index({ billId: 1 });
billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ createdAt: -1 });

// Virtual for remaining balance
billSchema.virtual('balance').get(function() {
  return this.total - this.paidAmount;
});

// Virtual for payment status
billSchema.virtual('paymentStatus').get(function() {
  if (this.paidAmount === 0) return 'unpaid';
  if (this.paidAmount >= this.total) return 'paid';
  return 'partial';
});

// Method to add payment
billSchema.methods.addPayment = function(amount, method = 'cash', notes = '') {
  this.paidAmount += amount;
  this.paymentMethod = method;
  
  if (this.paidAmount >= this.total) {
    this.status = 'paid';
    this.paidDate = new Date();
  } else {
    this.status = 'partial';
  }
  
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n${notes}` : notes;
  }
  
  return this.save();
};

// Method to add item
billSchema.methods.addItem = function(description, quantity, unitPrice, category = 'other') {
  const totalPrice = quantity * unitPrice;
  this.items.push({
    description,
    quantity,
    unitPrice,
    totalPrice,
    category
  });
  
  return this.save();
};

// Static method to find bills by reservation
billSchema.statics.findByReservation = function(reservationId) {
  return this.find({ reservationId }).populate('reservationId guestId generatedBy');
};

// Transform output
billSchema.methods.toJSON = function() {
  const billObject = this.toObject({ virtuals: true });
  delete billObject.__v;
  return billObject;
};

module.exports = mongoose.model('Bill', billSchema);
