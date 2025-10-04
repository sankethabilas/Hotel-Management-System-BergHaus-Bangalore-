const express = require('express');
const router = express.Router();
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  staffLogin,
  getStaffDashboard,
  changePassword,
  getStaffByEmployeeId
} = require('../controllers/staffController');

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes (no authentication required for admin functions)
router.post('/login', staffLogin);
router.get('/active', getAllStaff); // Public endpoint for attendance scanner
// Public routes for admin dashboard access
router.get('/', getAllStaff); // Get all staff (no auth required)
router.post('/', createStaff); // Create staff (no auth required)
router.get('/dashboard', getStaffDashboard); // Staff dashboard
router.post('/change-password', changePassword); // Change password
router.get('/employee/:employeeId', getStaffByEmployeeId); // Get staff by employee ID
router.get('/:id', getStaffById); // Get staff by ID
router.put('/:id', updateStaff); // Update staff
router.delete('/:id', deleteStaff); // Delete staff

module.exports = router;
