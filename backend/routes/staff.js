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
  getStaffByEmployeeId
} = require('../controllers/staffController');

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes
router.post('/login', staffLogin);
router.get('/active', getAllStaff); // Public endpoint for attendance scanner

// Public routes for admin dashboard access
router.post('/', createStaff);
router.get('/', getAllStaff);
router.get('/dashboard', getStaffDashboard); // Staff can access their own dashboard
router.get('/employee/:employeeId', getStaffByEmployeeId); // Staff can get their own info by employee ID
router.get('/:id', getStaffById);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
