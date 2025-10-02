const express = require('express');
const router = express.Router();
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  staffLogin,
  getStaffDashboard
} = require('../controllers/staffController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', staffLogin);
router.get('/active', getAllStaff); // Public endpoint for attendance scanner

// Protected routes - Admin only
router.use(protect);
router.post('/', authorize('admin', 'frontdesk'), createStaff);
router.get('/', authorize('admin', 'frontdesk'), getAllStaff);
router.get('/dashboard', getStaffDashboard); // Staff can access their own dashboard
router.get('/:id', authorize('admin', 'frontdesk'), getStaffById);
router.put('/:id', authorize('admin', 'frontdesk'), updateStaff);
router.delete('/:id', authorize('admin'), deleteStaff);

module.exports = router;
