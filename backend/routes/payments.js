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

// All routes require authentication
router.use(protect);

// Admin/HR routes
router.get('/', authorize('admin', 'frontdesk'), getAllPayments);
router.get('/stats', authorize('admin', 'frontdesk'), getPaymentStats);
router.post('/', authorize('admin', 'frontdesk'), createPayment);
router.put('/:id', authorize('admin', 'frontdesk'), updatePayment);
router.patch('/:id/status', authorize('admin', 'frontdesk'), updatePaymentStatus);
router.delete('/:id', authorize('admin'), deletePayment);

// Staff can view their own payments, admin can view any
router.get('/staff/:staffId', getPaymentsByStaff);
router.get('/:id', getPaymentById);

module.exports = router;