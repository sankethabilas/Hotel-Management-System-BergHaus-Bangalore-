const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  getPaymentsByStaff,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  getPaymentStats,
  deletePayment
} = require('../controllers/paymentController');

// Get all payments with filters
router.get('/', getAllPayments);

// Get payment statistics
router.get('/stats', getPaymentStats);

// Get payments by staff ID
router.get('/staff/:staffId', getPaymentsByStaff);

// Get payment by ID
router.get('/:id', getPaymentById);

// Create new payment
router.post('/', createPayment);

// Update payment
router.put('/:id', updatePayment);

// Update payment status
router.patch('/:id/status', updatePaymentStatus);

// Delete payment
router.delete('/:id', deletePayment);

module.exports = router;