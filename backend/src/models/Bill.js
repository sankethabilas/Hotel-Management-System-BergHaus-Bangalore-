const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    index: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    roomNumber: {
      type: String,
      required: true
    }
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: 0
    },
    serviceChargePercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    vat: {
      type: Number,
      default: 0,
      min: 0
    },
    vatPercentage: {
      type: Number,
      default: 15,
      min: 0,
      max: 100
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    discountReason: {
      type: String,
      default: ''
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'online', 'room_charge']
  },
  status: {
    type: String,
    required: true,
    enum: ['generated', 'paid', 'refunded', 'cancelled'],
    default: 'generated'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false // Allow guest-generated bills
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  refundReason: {
    type: String
  },
  notes: {
    type: String,
    default: ''
  },
  pdfPath: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted bill number
billSchema.virtual('formattedBillNumber').get(function() {
  return `BILL-${this.billNumber}`;
});

// Virtual for formatted date
billSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time
billSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

// Static method to generate bill number
billSchema.statics.generateBillNumber = function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `${year}${month}${day}${timestamp}`;
};

// Method to calculate totals
billSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  this.pricing.subtotal = subtotal;
  this.pricing.serviceCharge = Math.round((subtotal * this.pricing.serviceChargePercentage) / 100);
  this.pricing.vat = Math.round(((subtotal + this.pricing.serviceCharge) * this.pricing.vatPercentage) / 100);
  
  this.pricing.total = subtotal + this.pricing.serviceCharge + this.pricing.vat - this.pricing.discount;
  
  return this.pricing;
};

// Method to mark as paid
billSchema.methods.markAsPaid = function() {
  this.status = 'paid';
  this.paidAt = new Date();
  return this.save();
};

// Method to process refund
billSchema.methods.processRefund = function(reason) {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundReason = reason;
  return this.save();
};

// Indexes for better query performance (billNumber and orderId already indexed above)
billSchema.index({ 'customerInfo.email': 1 });
billSchema.index({ 'customerInfo.roomNumber': 1 });
billSchema.index({ status: 1, createdAt: -1 });
billSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bill', billSchema);
