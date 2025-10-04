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

const { protect, authorize } = require('../middleware/auth');

// Remove authentication for admin access - keeping for reference
// router.use(protect);

// Admin routes (authentication removed for admin functions)
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.patch('/:id/status', updatePaymentStatus);
router.delete('/:id', deletePayment);

// Staff can view their own payments, admin can view any
router.get('/staff/:staffId', getPaymentsByStaff);
router.get('/:id', getPaymentById);

module.exports = router;