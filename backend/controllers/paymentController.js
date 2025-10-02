const Payment = require('../models/Payment');
const Staff = require('../models/Staff');

// Get all payments with filters
const getAllPayments = async (req, res) => {
  try {
    const { 
      month, 
      year, 
      status, 
      staffId, 
      page = 1, 
      limit = 50 
    } = req.query;
    
    let filter = {};
    if (month && year) {
      filter['paymentPeriod.month'] = parseInt(month);
      filter['paymentPeriod.year'] = parseInt(year);
    }
    if (status) filter.status = status;
    if (staffId) filter.staffId = staffId;

    const payments = await Payment.find(filter)
      .populate('staffId', 'fullName employeeId email department')
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments: payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id)
      .populate('staffId', 'fullName employeeId email department phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Get payments by staff ID
const getPaymentsByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, limit = 12 } = req.query;
    
    let filter = { staffId: staffId };
    if (year) {
      filter['paymentPeriod.year'] = parseInt(year);
    }

    const payments = await Payment.find(filter)
      .sort({ 'paymentPeriod.year': -1, 'paymentPeriod.month': -1 })
      .limit(parseInt(limit));

    const staff = await Staff.findById(staffId, 'fullName employeeId email department');

    res.json({
      success: true,
      staff: staff,
      payments: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff payments',
      error: error.message
    });
  }
};

// Create new payment
const createPayment = async (req, res) => {
  try {
    const {
      staffId,
      paymentPeriod,
      overtimeHours = 0,
      bonuses = 0,
      deductions = {},
      paymentMethod = 'bank_transfer',
      bankDetails = {},
      remarks = '',
      processedBy
    } = req.body;

    // Get staff details
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if payment already exists for this period
    const existingPayment = await Payment.findOne({
      staffId: staffId,
      'paymentPeriod.month': paymentPeriod.month,
      'paymentPeriod.year': paymentPeriod.year
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this period'
      });
    }

    // Create new payment
    const payment = new Payment({
      staffId: staffId,
      employeeId: staff.employeeId,
      staffName: staff.fullName,
      paymentPeriod: paymentPeriod,
      baseSalary: staff.salary,
      overtimeHours: overtimeHours,
      overtimeRate: staff.overtimeRate || 0,
      bonuses: bonuses,
      deductions: {
        epf: deductions.epf || 0,
        etf: deductions.etf || 0,
        tax: deductions.tax || 0,
        advances: deductions.advances || 0,
        other: deductions.other || 0
      },
      paymentDate: new Date(),
      paymentMethod: paymentMethod,
      bankDetails: bankDetails,
      remarks: remarks,
      processedBy: processedBy
    });

    // Calculate payment totals
    payment.calculatePayment();
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'staffId') {
        payment[key] = updateData[key];
      }
    });

    // Recalculate if monetary values changed
    if (updateData.baseSalary || updateData.overtimeHours || updateData.bonuses || updateData.deductions) {
      payment.calculatePayment();
    }

    await payment.save();

    res.json({
      success: true,
      message: 'Payment updated successfully',
      payment: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      { 
        status: status,
        remarks: remarks || payment.remarks
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const stats = await Payment.aggregate([
      {
        $match: {
          'paymentPeriod.year': parseInt(year)
        }
      },
      {
        $group: {
          _id: '$paymentPeriod.month',
          totalStaff: { $sum: 1 },
          totalGrossPay: { $sum: '$grossPay' },
          totalNetPay: { $sum: '$netPay' },
          totalDeductions: { $sum: '$totalDeductions' },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get overall stats
    const overallStats = await Payment.aggregate([
      {
        $match: {
          'paymentPeriod.year': parseInt(year)
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$netPay' },
          avgPayment: { $avg: '$netPay' },
          maxPayment: { $max: '$netPay' },
          minPayment: { $min: '$netPay' }
        }
      }
    ]);

    res.json({
      success: true,
      year: parseInt(year),
      monthlyStats: stats,
      overallStats: overallStats[0] || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByStaff,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  getPaymentStats,
  deletePayment
};