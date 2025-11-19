const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  requestEmailVerification,
  verifyEmailCode
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateEmailVerificationRequest,
  validateVerifyEmailCode
} = require('../middleware/validation');

const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/request-email-verification
// @desc    Send verification code to email
// @access  Public
router.post('/request-email-verification', validateEmailVerificationRequest, requestEmailVerification);

// @route   POST /api/auth/verify-email-code
// @desc    Verify email via code
// @access  Public
router.post('/verify-email-code', validateVerifyEmailCode, verifyEmailCode);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, validatePasswordChange, changePassword);

module.exports = router;
