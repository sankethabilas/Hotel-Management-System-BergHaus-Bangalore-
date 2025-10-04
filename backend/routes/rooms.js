const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  validateCreateRoom,
  validateUpdateRoom,
  validateMongoId
} = require('../middleware/reservationValidation');

/**
 * Room Routes
 * Public routes for viewing rooms, protected routes for management
 */

// Public routes (no authentication required)
router.get('/', roomController.getAllRooms);
router.get('/available', roomController.getAvailableRooms);
router.get('/type/:roomType', roomController.getRoomsByType);
router.get('/search', roomController.searchRooms);
router.get('/:id', ...validateMongoId('id'), roomController.getRoomById);
router.get('/number/:roomNumber', roomController.getRoomByNumber);

// Protected routes (authentication required)
router.use(protect);

// Admin-only routes
router.post('/', validateCreateRoom, roomController.createRoom);
router.put('/:id', ...validateMongoId('id'), validateUpdateRoom, roomController.updateRoom);
router.delete('/:id', ...validateMongoId('id'), roomController.deleteRoom);
router.put('/:id/status', ...validateMongoId('id'), roomController.updateRoomStatus);
router.post('/:id/upload-image', ...validateMongoId('id'), upload.single('image'), roomController.uploadRoomImage);
router.delete('/:id/images/:imageIndex', ...validateMongoId('id'), roomController.removeRoomImage);
router.get('/stats', roomController.getRoomStats);

module.exports = router;
