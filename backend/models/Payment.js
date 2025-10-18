const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  staffName: {
    type: String,
    required: true
  },
  paymentPeriod: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  baseSalary: {
    type: Number,
    required: true,
    min: 0
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: 0
  },
  overtimeRate: {
    type: Number,
    default: 0,
    min: 0
  },
  overtimePay: {
    type: Number,
    default: 0,
    min: 0
  },
  bonuses: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    epf: {
      type: Number,
      default: 0
    },
    etf: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    advances: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  grossPay: {
    type: Number,
    required: true,
    min: 0
  },
  totalDeductions: {
    type: Number,
    required: true,
    min: 0
  },
  netPay: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash_on_property'],
    default: 'bank_transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branchName: String
  },
  remarks: {
    type: String,
    default: ''
  },
  processedBy: {
    type: String,
    required: true
  },
  payslipGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ staffId: 1, 'paymentPeriod.year': 1, 'paymentPeriod.month': 1 });
paymentSchema.index({ employeeId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: 1 });

// Virtual for payment period string
paymentSchema.virtual('paymentPeriodString').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[this.paymentPeriod.month - 1]} ${this.paymentPeriod.year}`;
});

// Method to calculate payment totals
paymentSchema.methods.calculatePayment = function() {
  // Calculate overtime pay
  this.overtimePay = this.overtimeHours * this.overtimeRate;
  
  // Calculate gross pay
  this.grossPay = this.baseSalary + this.overtimePay + this.bonuses;
  
  // Calculate total deductions
  this.totalDeductions = (this.deductions.epf || 0) + 
                        (this.deductions.etf || 0) + 
                        (this.deductions.tax || 0) + 
                        (this.deductions.advances || 0) + 
                        (this.deductions.other || 0);
  
  // Calculate net pay
  this.netPay = this.grossPay - this.totalDeductions;
  
  return this;
};

// Static method to get monthly payment summary
paymentSchema.statics.getMonthlySummary = function(month, year) {
  return this.aggregate([
    {
      $match: {
        'paymentPeriod.month': month,
        'paymentPeriod.year': year
      }
    },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        totalGrossPay: { $sum: '$grossPay' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalNetPay: { $sum: '$netPay' },
        paidPayments: { 
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } 
        },
        pendingPayments: { 
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);