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
  googleSignup,
  getUserStats,
  createUser,
  updateUserStatus,
  sendNotification,
  getUserAnalytics
} = require('../controllers/userController');

const upload = require('../middleware/upload');

const {
  validateUserUpdate
} = require('../middleware/validation');

const { protect, authorize, checkOwnership } = require('../middleware/auth');

// @route   POST /api/users/google-signup
// @desc    Google signup/signin
// @access  Public
router.post('/google-signup', googleSignup);

// @route   GET /api/users
// @desc    Get all users (with pagination and filtering)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getAllUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), getUserStats);

// @route   GET /api/users/analytics
// @desc    Get user analytics
// @access  Private/Admin
router.get('/analytics', protect, authorize('admin'), getUserAnalytics);

// @route   POST /api/users/create
// @desc    Create new user (Admin only)
// @access  Private/Admin
router.post('/create', protect, authorize('admin'), createUser);

// @route   POST /api/users/notify
// @desc    Send notification to users
// @access  Private/Admin
router.post('/notify', protect, authorize('admin'), sendNotification);

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
router.post('/:id/upload', protect, upload.single('profileImage'), (err, req, res, next) => {
  if (err) {
    console.error('Multer error in route:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Expected "profileImage".'
      });
    }
    if (err.message.includes('Only image files')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  next();
}, uploadProfilePicture);

// @route   PATCH /api/users/:id/status
// @desc    Update user status (active/inactive, banned/unbanned)
// @access  Private/Admin
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;
