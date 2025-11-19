const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const { generateToken } = require('../config/jwt');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

const VERIFICATION_CODE_TTL_MINUTES = parseInt(process.env.VERIFICATION_CODE_TTL_MINUTES || '10', 10);
const VERIFICATION_RESEND_COOLDOWN_SECONDS = parseInt(process.env.VERIFICATION_RESEND_COOLDOWN_SECONDS || '60', 10);
const MAX_VERIFICATION_ATTEMPTS = parseInt(process.env.MAX_VERIFICATION_ATTEMPTS || '5', 10);

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const ensureVerificationRecordIsUsable = (record) => {
  if (!record) {
    return 'Verification record not found. Please restart verification.';
  }
  if (!record.verified) {
    return 'Email has not been verified yet. Please verify the code sent to your email.';
  }
  if (record.used) {
    return 'Verification code already used. Please request a new code.';
  }
  if (record.expiresAt < new Date()) {
    return 'Verification code expired. Please request a new code.';
  }
  return null;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, role, phone, address, verificationId } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!verificationId) {
      return res.status(400).json({
        success: false,
        message: 'Email verification is required before creating an account',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const verificationRecord = await EmailVerification.findOne({ _id: verificationId, email: normalizedEmail });
    const unusableReason = ensureVerificationRecordIsUsable(verificationRecord);
    if (unusableReason) {
      return res.status(400).json({
        success: false,
        message: unusableReason,
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      role: role || 'guest',
      phone,
      address
    });

    // Generate JWT token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail(user).catch(error => {
      console.error('Failed to send welcome email:', error);
      // Don't fail the registration if email fails
    });

    verificationRecord.used = true;
    verificationRecord.usedAt = new Date();
    await verificationRecord.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          profileImage: user.profileImage,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Send welcome email for first-time login (if not sent before)
    if (!user.welcomeEmailSent) {
      emailService.sendWelcomeEmail(user).then(() => {
        // Mark welcome email as sent
        user.welcomeEmailSent = true;
        user.save().catch(error => {
          console.error('Failed to update welcome email status:', error);
        });
      }).catch(error => {
        console.error('Failed to send welcome email:', error);
      });
    }

    // Generate JWT token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Request email verification code
// @route   POST /api/auth/request-email-verification
// @access  Public
const requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    let verification = await EmailVerification.findOne({ email: normalizedEmail });

    if (
      verification &&
      verification.lastSentAt &&
      Date.now() - verification.lastSentAt.getTime() < VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000
    ) {
      const waitTime = Math.ceil(
        (VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - verification.lastSentAt.getTime())) / 1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitTime} seconds before requesting another code`,
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);

    if (!verification) {
      verification = new EmailVerification({ email: normalizedEmail });
    }

    verification.codeHash = codeHash;
    verification.expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);
    verification.attempts = 0;
    verification.verified = false;
    verification.used = false;
    verification.lastSentAt = new Date();
    verification.maxAttempts = MAX_VERIFICATION_ATTEMPTS;

    await verification.save();
    await emailService.sendVerificationCodeEmail(normalizedEmail, code);

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      data: {
        verificationId: verification._id,
        expiresIn: VERIFICATION_CODE_TTL_MINUTES * 60,
      },
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending verification code',
    });
  }
};

// @desc    Verify email code
// @route   POST /api/auth/verify-email-code
// @access  Public
const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required',
      });
    }

    const verification = await EmailVerification.findOne({ email: normalizedEmail });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'No verification request found for this email',
      });
    }

    if (verification.used) {
      return res.status(400).json({
        success: false,
        message: 'Verification code already used. Please request a new code.',
      });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please request a new code.',
      });
    }

    if (verification.attempts >= verification.maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many invalid attempts. Please request a new code.',
      });
    }

    const isMatch = await bcrypt.compare(code, verification.codeHash);
    if (!isMatch) {
      verification.attempts += 1;
      await verification.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.',
      });
    }

    verification.verified = true;
    verification.verifiedAt = new Date();
    verification.attempts = 0;
    await verification.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        verificationId: verification._id,
      },
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying code',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          emergencyContact: user.emergencyContact,
          profileImage: user.profileImage,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request received:', req.body);
    console.log('User from token:', req.user);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      
      // Create detailed error messages
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
        details: `Please fix the following issues: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`
      });
    }

    const { firstName, lastName, phone, address, dateOfBirth, emergencyContact } = req.body;
    const userId = req.user.userId;
    console.log('Updating user ID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    
    // Update address fields
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }
    
    // Update emergency contact fields
    if (emergencyContact) {
      user.emergencyContact = {
        ...user.emergencyContact,
        ...emergencyContact
      };
    }

    await user.save();
    console.log('User saved successfully:', user);

    const responseData = {
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          emergencyContact: user.emergencyContact,
          profileImage: user.profileImage,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    };
    
    console.log('Sending response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  requestEmailVerification,
  verifyEmailCode
};
