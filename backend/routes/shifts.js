const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  generateSmartSchedule,
  getDailyCoverage,
  updateScheduleAssignments,
  publishSchedule
} = require('../controllers/shiftController');

// const { protect, authorize } = require('../middleware/auth'); // Disabled for admin dashboard access

// Public routes for admin dashboard access
router.get('/', getAllSchedules);
router.get('/coverage', getDailyCoverage);
router.get('/:id', getScheduleById);
router.post('/generate', generateSmartSchedule);
router.put('/:id/assignments', updateScheduleAssignments);
router.put('/:id/publish', publishSchedule);

module.exports = router;
