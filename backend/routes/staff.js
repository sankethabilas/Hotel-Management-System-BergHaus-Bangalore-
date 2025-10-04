const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
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

const {
  validateStaffCreate,
  validateStaffUpdate,
  validateStaffLogin,
  validatePasswordChange,
  validateStaffId,
  validateEmployeeId
} = require('../middleware/staffValidation');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes (no authentication required for admin functions)
router.post('/login', validateStaffLogin, handleValidationErrors, staffLogin);
router.get('/active', getAllStaff); // Public endpoint for attendance scanner
// Public routes for admin dashboard access
router.get('/', getAllStaff); // Get all staff (no auth required)
router.post('/', validateStaffCreate, handleValidationErrors, createStaff); // Create staff with validation
router.get('/dashboard', getStaffDashboard); // Staff dashboard
router.post('/change-password', validatePasswordChange, handleValidationErrors, changePassword); // Change password with validation
router.get('/employee/:employeeId', validateEmployeeId, handleValidationErrors, getStaffByEmployeeId); // Get staff by employee ID with validation
router.get('/:id', validateStaffId, handleValidationErrors, getStaffById); // Get staff by ID with validation
router.put('/:id', validateStaffId, validateStaffUpdate, handleValidationErrors, updateStaff); // Update staff with validation
router.delete('/:id', validateStaffId, handleValidationErrors, deleteStaff); // Delete staff with validation

module.exports = router;
