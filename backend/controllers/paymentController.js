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
    
    // Validate calculations
    if (payment.netPay < 0) {
      return res.status(400).json({
        success: false,
        message: 'Net pay cannot be negative. Please check deductions.'
      });
    }
    
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
      
      // Validate calculations
      if (payment.netPay < 0) {
        return res.status(400).json({
          success: false,
          message: 'Net pay cannot be negative. Please check deductions.'
        });
      }
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
    
    console.log('Updating payment status:', { id, status, remarks });

    // First get the current payment to preserve existing remarks
    const currentPayment = await Payment.findById(id);
    if (!currentPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      id,
      { 
        status: status,
        remarks: remarks || currentPayment.remarks
      },
      { new: true }
    );

    if (!payment) {
      console.log('Payment not found after update');
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    console.log('Payment status updated successfully:', payment.status);
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
          totalPaidAmount: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'paid'] }, '$netPay', 0] 
            } 
          },
          avgPayment: { $avg: '$netPay' },
          maxPayment: { $max: '$netPay' },
          minPayment: { $min: '$netPay' },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
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

// Generate payment report (PDF/Excel)
const generatePaymentReport = async (req, res) => {
  try {
    const { format = 'pdf', year, month, status } = req.query;
    
    // Build filter for payments
    let filter = {};
    if (year) filter['paymentPeriod.year'] = parseInt(year);
    if (month) filter['paymentPeriod.month'] = parseInt(month);
    if (status) filter.status = status;
    
    // Get all payments matching the filter
    const payments = await Payment.find(filter)
      .populate('staffId', 'fullName employeeId email department')
      .sort({ paymentDate: -1 });

    if (format === 'excel') {
      // Generate Excel report
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Payment Report');

      // Add headers
      worksheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'Employee Name', key: 'staffName', width: 25 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Period', key: 'period', width: 15 },
        { header: 'Base Salary', key: 'baseSalary', width: 15 },
        { header: 'Overtime Pay', key: 'overtimePay', width: 15 },
        { header: 'Bonuses', key: 'bonuses', width: 15 },
        { header: 'Gross Pay', key: 'grossPay', width: 15 },
        { header: 'Total Deductions', key: 'totalDeductions', width: 18 },
        { header: 'Net Pay', key: 'netPay', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Payment Date', key: 'paymentDate', width: 15 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      // Add payment data
      payments.forEach(payment => {
        const period = `${new Date(0, payment.paymentPeriod.month - 1).toLocaleString('default', { month: 'long' })} ${payment.paymentPeriod.year}`;
        
        worksheet.addRow({
          employeeId: payment.employeeId,
          staffName: payment.staffName,
          department: payment.staffId?.department || 'N/A',
          period: period,
          baseSalary: payment.baseSalary || 0,
          overtimePay: payment.overtimePay || 0,
          bonuses: payment.bonuses || 0,
          grossPay: payment.grossPay || 0,
          totalDeductions: payment.totalDeductions || 0,
          netPay: payment.netPay || 0,
          status: payment.status?.toUpperCase() || 'N/A',
          paymentDate: new Date(payment.paymentDate).toLocaleDateString(),
          paymentMethod: payment.paymentMethod || 'N/A'
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width, 10);
      });

      // Generate Excel buffer
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="payment-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(buffer);

    } else {
      // Generate PDF report using PDFKit
      const PDFDocument = require('pdfkit');
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Collect PDF data
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="payment-report-${new Date().toISOString().split('T')[0]}.pdf"`);
          res.send(pdfData);
        });
        
        doc.on('error', reject);
        
        // Generate PDF content
        generatePaymentReportPDF(doc, payments);
        doc.end();
      });
    }

  } catch (error) {
    console.error('Payment report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment report',
      error: error.message
    });
  }
};

// Helper function to generate PDF content
const generatePaymentReportPDF = (doc, payments) => {
  // Header
  doc.fontSize(24)
     .fillColor('#2563eb')
     .text('BERGHAUS HOTEL', 50, 50, { align: 'center' });
  
  doc.fontSize(16)
     .fillColor('#555')
     .text('Payment Report', 50, 80, { align: 'center' });
  
  doc.fontSize(12)
     .fillColor('#000')
     .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 110)
     .text(`Total Payments: ${payments.length}`, 50, 130);

  let yPosition = 160;
  
  // Table header
  doc.fontSize(10)
     .fillColor('#000')
     .text('Employee', 50, yPosition)
     .text('Period', 150, yPosition)
     .text('Gross Pay', 220, yPosition)
     .text('Deductions', 300, yPosition)
     .text('Net Pay', 380, yPosition)
     .text('Status', 450, yPosition);
  
  // Draw line under header
  yPosition += 15;
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
  yPosition += 10;

  // Payment data
  payments.forEach((payment, index) => {
    if (yPosition > 700) {
      // New page
      doc.addPage();
      yPosition = 50;
    }

    const period = `${new Date(0, payment.paymentPeriod.month - 1).toLocaleString('default', { month: 'short' })} ${payment.paymentPeriod.year}`;
    
    doc.text(payment.staffName || 'N/A', 50, yPosition)
       .text(period, 150, yPosition)
       .text(`Rs. ${(payment.grossPay || 0).toFixed(2)}`, 220, yPosition)
       .text(`Rs. ${(payment.totalDeductions || 0).toFixed(2)}`, 300, yPosition)
       .text(`Rs. ${(payment.netPay || 0).toFixed(2)}`, 380, yPosition)
       .text((payment.status || 'N/A').toUpperCase(), 450, yPosition);
    
    yPosition += 20;
  });

  // Footer
  yPosition += 30;
  doc.fontSize(10)
     .fillColor('#777')
     .text('BergHaus Bungalow', 50, yPosition, { align: 'center' });
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByStaff,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  getPaymentStats,
  deletePayment,
  generatePaymentReport
};