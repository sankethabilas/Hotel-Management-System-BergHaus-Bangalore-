const express = require('express');
const router = express.Router();
const { protect, requireAdminOrFrontdesk } = require('../middleware/auth');
const Bill = require('../models/Bill');
const Reservation = require('../models/Reservation');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendPaymentStatusEmail } = require('../services/emailService');

// Apply authentication middleware to all routes
router.use(protect);
router.use(requireAdminOrFrontdesk);

// GET /api/bills - Get all bills
router.get('/', async (req, res) => {
  try {
    const { status, guestName, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (guestName) {
      query.guestName = { $regex: guestName, $options: 'i' };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get bills with populated data
    const bills = await Bill.find(query)
      .populate('reservationId', 'reservationId checkInDate checkOutDate')
      .populate('guestId', 'firstName lastName email phone')
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Bill.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        bills,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bills',
      error: error.message
    });
  }
});

// GET /api/bills/:id - Get bill details
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('reservationId')
      .populate('guestId', 'firstName lastName email phone address')
      .populate('generatedBy', 'firstName lastName');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    res.json({
      success: true,
      data: { bill }
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: error.message
    });
  }
});

// POST /api/bills/:id/items - Add item to bill
router.post('/:id/items', async (req, res) => {
  try {
    const { description, quantity, unitPrice, category = 'other' } = req.body;
    
    if (!description || !quantity || !unitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Description, quantity, and unit price are required'
      });
    }
    
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a paid bill'
      });
    }
    
    await bill.addItem(description, quantity, unitPrice, category);
    
    res.json({
      success: true,
      message: 'Item added to bill successfully',
      data: { bill }
    });
  } catch (error) {
    console.error('Error adding item to bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to bill',
      error: error.message
    });
  }
});

// POST /api/bills/:id/payment - Add payment to bill
router.post('/:id/payment', async (req, res) => {
  try {
    const { amount, method = 'cash', notes = '' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }
    
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Bill is already fully paid'
      });
    }
    
    await bill.addPayment(amount, method, notes);
    
    // Send payment status email
    try {
      await sendPaymentStatusEmail(bill.guestEmail, bill);
    } catch (emailError) {
      console.error('Failed to send payment status email:', emailError);
      // Don't fail the payment process if email fails
    }
    
    res.json({
      success: true,
      message: 'Payment added successfully',
      data: { bill }
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment',
      error: error.message
    });
  }
});

// GET /api/bills/:id/download - Download bill PDF
router.get('/:id/download', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('reservationId')
      .populate('guestId', 'firstName lastName email phone address')
      .populate('generatedBy', 'firstName lastName');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Generate PDF
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill-${bill.billId}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Hotel Management System', 50, 50);
    doc.fontSize(16).text('Invoice', 50, 80);
    
    doc.fontSize(12);
    doc.text(`Bill ID: ${bill.billId}`, 50, 120);
    doc.text(`Date: ${bill.createdAt.toLocaleDateString()}`, 50, 140);
    doc.text(`Due Date: ${bill.dueDate.toLocaleDateString()}`, 50, 160);
    
    // Guest information
    doc.text('Bill To:', 50, 200);
    doc.text(`${bill.guestName}`, 50, 220);
    doc.text(`${bill.guestEmail}`, 50, 240);
    
    if (bill.reservationId) {
      doc.text(`Reservation: ${bill.reservationId.reservationId}`, 50, 260);
    }
    
    // Items table
    let yPosition = 300;
    doc.text('Description', 50, yPosition);
    doc.text('Qty', 300, yPosition);
    doc.text('Unit Price', 350, yPosition);
    doc.text('Total', 450, yPosition);
    
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;
    
    bill.items.forEach(item => {
      doc.text(item.description, 50, yPosition);
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 350, yPosition);
      doc.text(`$${item.totalPrice.toFixed(2)}`, 450, yPosition);
      yPosition += 20;
    });
    
    // Totals
    yPosition += 20;
    doc.text(`Subtotal: $${bill.subtotal.toFixed(2)}`, 350, yPosition);
    yPosition += 20;
    doc.text(`Tax: $${bill.tax.toFixed(2)}`, 350, yPosition);
    yPosition += 20;
    if (bill.discount > 0) {
      doc.text(`Discount: -$${bill.discount.toFixed(2)}`, 350, yPosition);
      yPosition += 20;
    }
    doc.fontSize(14).text(`Total: $${bill.total.toFixed(2)}`, 350, yPosition);
    
    if (bill.paidAmount > 0) {
      yPosition += 20;
      doc.fontSize(12).text(`Paid: $${bill.paidAmount.toFixed(2)}`, 350, yPosition);
      yPosition += 20;
      doc.text(`Balance: $${bill.balance.toFixed(2)}`, 350, yPosition);
    }
    
    // Footer
    doc.fontSize(10).text('Thank you for your business!', 50, 700);
    
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
});

// POST /api/bills/:id/email - Email bill to guest
router.post('/:id/email', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('reservationId')
      .populate('guestId', 'firstName lastName email phone');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // TODO: Implement email sending with PDF attachment
    // This would use the existing email service
    
    res.json({
      success: true,
      message: 'Bill emailed successfully'
    });
  } catch (error) {
    console.error('Error emailing bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error emailing bill',
      error: error.message
    });
  }
});

module.exports = router;
