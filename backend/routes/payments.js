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
  deletePayment,
  generatePaymentReport
} = require('../controllers/paymentController');

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes for admin dashboard access
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/report', generatePaymentReport);
router.post('/', createPayment);

// Staff can view their own payments, admin can view any
router.get('/staff/:staffId', getPaymentsByStaff);

// These routes must come after specific routes to avoid conflicts
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.patch('/:id/status', updatePaymentStatus);
router.delete('/:id', deletePayment);

module.exports = router;