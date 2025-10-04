const { body, param } = require('express-validator');

/**
 * Staff Validation Middleware
 * Comprehensive validation for staff management operations
 */

// Staff creation validation
const validateStaffCreate = [
  // Full Name validation
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Full name can only contain letters, spaces, periods, apostrophes, and hyphens'),

  // Email validation
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const Staff = require('../models/Staff');
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        throw new Error('Email address is already registered');
      }
      return true;
    }),

  // Phone validation
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\s\-()]{7,15}$/)
    .withMessage('Phone number can only contain digits, +, spaces, hyphens, and parentheses (7-15 characters)'),

  // Date of Birth validation
  body('dob')
    .isISO8601()
    .withMessage('Please provide a valid date of birth (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      if (age < 16) {
        throw new Error('Staff member must be at least 16 years old');
      }
      
      if (age > 70) {
        throw new Error('Please verify the date of birth (age appears to be over 70)');
      }
      
      return true;
    }),

  // Gender validation
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  // NIC/Passport validation
  body('nicPassport')
    .trim()
    .notEmpty()
    .withMessage('NIC or Passport number is required')
    .isLength({ min: 8, max: 20 })
    .withMessage('NIC/Passport must be between 8 and 20 characters')
    .matches(/^[0-9]+$/)
    .withMessage('NIC/Passport can only contain numbers')
    .custom(async (value) => {
      const Staff = require('../models/Staff');
      const existingStaff = await Staff.findOne({ nicPassport: value });
      if (existingStaff) {
        throw new Error('NIC/Passport number is already registered');
      }
      return true;
    }),

  // Address validation
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),

  // Job Role validation
  body('jobRole')
    .trim()
    .notEmpty()
    .withMessage('Job role is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Job role must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-./()&]+$/)
    .withMessage('Job role can only contain letters, spaces, and common punctuation'),

  // Department validation
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isIn(['Reception', 'Housekeeping', 'Kitchen', 'Maintenance', 'Security', 'Management', 'HR', 'Accounts'])
    .withMessage('Please select a valid department'),

  // Join Date validation
  body('joinDate')
    .isISO8601()
    .withMessage('Please provide a valid join date (YYYY-MM-DD)')
    .custom((value) => {
      const joinDate = new Date(value);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (joinDate > today) {
        throw new Error('Join date cannot be in the future');
      }
      
      if (joinDate < oneYearAgo) {
        // Allow but warn for dates more than a year ago
        console.log(`Warning: Join date ${value} is more than a year ago`);
      }
      
      return true;
    }),

  // Salary validation
  body('salary')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('Salary must be greater than 0');
      }
      if (value < 15000) {
        throw new Error('Salary cannot be less than Rs. 15,000 (minimum wage)');
      }
      if (value > 1000000) {
        throw new Error('Please verify salary amount (exceeds Rs. 1,000,000)');
      }
      return true;
    }),

  // Overtime Rate validation
  body('overtimeRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Overtime rate must be a positive number')
    .custom((value) => {
      if (value && value > 5000) {
        throw new Error('Overtime rate seems unusually high, please verify');
      }
      return true;
    }),

  // Bank Account validation
  body('bankAccount')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('Bank account number must be between 8 and 20 digits')
    .matches(/^[0-9]+$/)
    .withMessage('Bank account number can only contain digits'),

  // Bank Name validation
  body('bankName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Bank name cannot exceed 50 characters'),

  // Branch validation
  body('branch')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Branch cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s,.-]+$/)
    .withMessage('Branch can only contain letters, spaces, commas, periods, and hyphens'),

  // Profile Picture URL validation
  body('profilePictureUrl')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Profile picture URL cannot exceed 500 characters')
    .custom((value) => {
      if (value) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const hasImageExtension = imageExtensions.some(ext => 
          value.toLowerCase().includes(ext)
        );
        if (!hasImageExtension) {
          throw new Error('Profile picture URL should point to an image file (.jpg, .png, .gif, etc.)');
        }
      }
      return true;
    }),

  // Active status validation
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be true or false')
];

// Staff update validation (similar to create but allows partial updates)
const validateStaffUpdate = [
  // Full Name validation (optional for updates)
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  // Email validation (check uniqueness excluding current record)
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const Staff = require('../models/Staff');
      const existingStaff = await Staff.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingStaff) {
        throw new Error('Email address is already registered to another staff member');
      }
      return true;
    }),

  // Phone validation
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s-()]{8,15}$/)
    .withMessage('Please provide a valid phone number (8-15 digits, may include +, spaces, -, ())'),

  // Date of Birth validation
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      if (age < 16 || age > 70) {
        throw new Error('Please verify the date of birth (age should be between 16-70)');
      }
      
      return true;
    }),

  // Gender validation
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  // NIC/Passport validation (check uniqueness excluding current record)
  body('nicPassport')
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('NIC/Passport must be between 8 and 20 characters')
    .custom(async (value, { req }) => {
      const Staff = require('../models/Staff');
      const existingStaff = await Staff.findOne({ 
        nicPassport: value, 
        _id: { $ne: req.params.id } 
      });
      if (existingStaff) {
        throw new Error('NIC/Passport number is already registered to another staff member');
      }
      return true;
    }),

  // Address validation
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),

  // Job Role validation
  body('jobRole')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Job role must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Job role can only contain letters and spaces'),

  // Department validation
  body('department')
    .optional()
    .isIn(['Reception', 'Housekeeping', 'Kitchen', 'Maintenance', 'Security', 'Management', 'HR', 'Accounts'])
    .withMessage('Please select a valid department'),

  // Salary validation
  body('salary')
    .optional()
    .isFloat({ min: 15000, max: 500000 })
    .withMessage('Salary must be between Rs. 15,000 and Rs. 500,000'),

  // Overtime Rate validation
  body('overtimeRate')
    .optional()
    .isFloat({ min: 0, max: 2000 })
    .withMessage('Overtime rate must be between 0 and Rs. 2,000'),

  // Bank Account validation
  body('bankAccount')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('Bank account number must be between 8 and 20 digits')
    .matches(/^[\d]+$/)
    .withMessage('Bank account number can only contain digits'),

  // Bank Name validation
  body('bankName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Bank name cannot exceed 50 characters'),

  // Branch validation
  body('branch')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Branch cannot exceed 100 characters')
    .matches(/^[a-zA-Z\s,.-]+$/)
    .withMessage('Branch can only contain letters, spaces, commas, periods, and hyphens'),

  // Active status validation
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be true or false')
];

// Staff login validation
const validateStaffLogin = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .matches(/^EMP\d{4}$/)
    .withMessage('Employee ID must be in format EMP0001'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long')
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 4 })
    .withMessage('New password must be at least 4 characters long'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// ID parameter validation
const validateStaffId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid staff ID format')
];

// Employee ID parameter validation
const validateEmployeeId = [
  param('employeeId')
    .matches(/^EMP\d{4}$/)
    .withMessage('Employee ID must be in format EMP0001')
];

module.exports = {
  validateStaffCreate,
  validateStaffUpdate,
  validateStaffLogin,
  validatePasswordChange,
  validateStaffId,
  validateEmployeeId
};