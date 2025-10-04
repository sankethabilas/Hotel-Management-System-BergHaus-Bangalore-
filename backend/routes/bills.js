const express = require('express');
const router = express.Router();
const { protect, requireAdminOrFrontdesk } = require('../middleware/auth');
const Bill = require('../models/Bill');
const Reservation = require('../models/Reservation');
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendPaymentStatusEmail } = require('../services/emailService');
const { generatePDF } = require('../services/billGenerator');

// ===== FOOD & BEVERAGE BILL ROUTES (no auth required for guests) =====

// POST /api/bills/generate/:orderId - Generate bill for food order (no auth required for guests)
router.post('/generate/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { 
      serviceChargePercentage = 10, 
      vatPercentage = 15, 
      discount = 0, 
      discountReason = '', 
      notes = '' 
    } = req.body;

    // Find the order
    const order = await Order.findById(orderId).populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if bill already exists for this order
    const existingBill = await Bill.findOne({ orderId });
    if (existingBill) {
      return res.json({
        success: true,
        message: 'Bill already exists for this order',
        data: {
          billId: existingBill._id,
          billNumber: existingBill.billNumber,
          orderNumber: existingBill.orderNumber,
          total: existingBill.pricing.total,
          status: existingBill.status
        }
      });
    }

    // Prepare bill data
    const billNumber = Bill.generateBillNumber();
    const items = order.items.map(item => ({
      menuItemId: item.menuItem._id || item.menuItem,
      name: item.menuItem.name || 'Unknown Item',
      quantity: item.quantity,
      unitPrice: item.menuItem.price || 0,
      totalPrice: (item.menuItem.price || 0) * item.quantity
    }));

    const billData = {
      billNumber,
      orderId,
      orderNumber: order.orderNumber,
      customerInfo: order.customerInfo,
      items,
      pricing: {
        subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
        serviceChargePercentage,
        vatPercentage,
        discount,
        discountReason
      },
      paymentMethod: order.paymentMethod,
      status: 'generated',
      generatedBy: null, // Guest-generated bill
      notes
    };

    // Calculate totals
    const bill = new Bill(billData);
    bill.calculateTotals();

    const savedBill = await bill.save();

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: {
        billId: savedBill._id,
        billNumber: savedBill.billNumber,
        orderNumber: savedBill.orderNumber,
        total: savedBill.pricing.total,
        status: savedBill.status
      }
    });

  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bill',
      error: error.message
    });
  }
});

// GET /api/bills/pdf/:billId - Get bill PDF (no auth required for guests)
router.get('/pdf/:billId', async (req, res) => {
  try {
    console.log('PDF request for bill ID:', req.params.billId);
    const { billId } = req.params;

    const bill = await Bill.findById(billId).populate('orderId');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Generate PDF using puppeteer
    const pdfBuffer = await generatePDF(bill);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill-${bill.billNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

// GET /api/bills/order/:orderId - Get bill by order ID (no auth required for guests)
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const bill = await Bill.findOne({ orderId })
      .populate('orderId', 'orderNumber status items')
      .populate('generatedBy', 'username')
      .populate('items.menuItemId', 'name price');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found for this order'
      });
    }

    res.json({
      success: true,
      data: bill
    });

  } catch (error) {
    console.error('Get bill by order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill',
      error: error.message
    });
  }
});

// ===== HOTEL BILL ROUTES (require authentication) =====

// GET /api/bills - Get all bills
router.get('/', protect, requireAdminOrFrontdesk, async (req, res) => {
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
router.get('/:id', protect, requireAdminOrFrontdesk, async (req, res) => {
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
router.post('/:id/items', protect, requireAdminOrFrontdesk, async (req, res) => {
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
router.post('/:id/payment', protect, requireAdminOrFrontdesk, async (req, res) => {
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
router.get('/:id/download', protect, requireAdminOrFrontdesk, async (req, res) => {
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
      doc.text(`Rs ${item.unitPrice.toFixed(2)}`, 350, yPosition);
      doc.text(`Rs ${item.totalPrice.toFixed(2)}`, 450, yPosition);
      yPosition += 20;
    });
    
    // Totals
    yPosition += 20;
    doc.text(`Subtotal: Rs ${bill.subtotal.toFixed(2)}`, 350, yPosition);
    yPosition += 20;
    doc.text(`Tax: Rs ${bill.tax.toFixed(2)}`, 350, yPosition);
    yPosition += 20;
    if (bill.discount > 0) {
      doc.text(`Discount: -Rs ${bill.discount.toFixed(2)}`, 350, yPosition);
      yPosition += 20;
    }
    doc.fontSize(14).text(`Total: Rs ${bill.total.toFixed(2)}`, 350, yPosition);
    
    if (bill.paidAmount > 0) {
      yPosition += 20;
      doc.fontSize(12).text(`Paid: Rs ${bill.paidAmount.toFixed(2)}`, 350, yPosition);
      yPosition += 20;
      doc.text(`Balance: Rs ${bill.balance.toFixed(2)}`, 350, yPosition);
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
router.post('/:id/email', protect, requireAdminOrFrontdesk, async (req, res) => {
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
