const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  uploadProfilePicture,
  upload
} = require('../controllers/userController');

const {
  validateUserUpdate
} = require('../middleware/validation');

const { protect, authorize, checkOwnership } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (with pagination and filtering)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (own profile or admin)
router.get('/:id', protect, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (own profile or admin)
router.put('/:id', protect, validateUserUpdate, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteUser);

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user
// @access  Private/Admin
router.put('/:id/deactivate', protect, authorize('admin'), deactivateUser);

// @route   PUT /api/users/:id/activate
// @desc    Activate user
// @access  Private/Admin
router.put('/:id/activate', protect, authorize('admin'), activateUser);

// @route   POST /api/users/:id/upload
// @desc    Upload profile picture
// @access  Private (own profile or admin)
router.post('/:id/upload', protect, upload.single('profileImage'), uploadProfilePicture);

module.exports = router;
