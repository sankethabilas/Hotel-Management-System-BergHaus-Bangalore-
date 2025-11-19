const { body } = require('express-validator');

// User registration validation
const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['guest', 'employee', 'admin'])
    .withMessage('Role must be guest, employee, or admin'),
  
  body('phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty phone
      // Phone validation: must start with + or 0, 8-15 digits total
      const phoneRegex = /^[+0][\d]{7,14}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Phone number must start with + or 0 and have 8-15 digits total (e.g., +1234567890 or 0123456789)');
      }
      return true;
    }),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Zip code cannot exceed 10 characters'),

  body('verificationId')
    .notEmpty()
    .withMessage('Verification ID is required. Please verify your email before signing up.')
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length < 2) {
        throw new Error('First name must be at least 2 characters long');
      }
      if (value.trim().length > 50) {
        throw new Error('First name cannot exceed 50 characters');
      }
      return true;
    }),
  
  body('lastName')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length < 2) {
        throw new Error('Last name must be at least 2 characters long');
      }
      if (value.trim().length > 50) {
        throw new Error('Last name cannot exceed 50 characters');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty phone
      // Phone validation: must start with + or 0, 8-15 digits total
      const phoneRegex = /^[+0][\d]{7,14}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Phone number must start with + or 0 and have 8-15 digits total (e.g., +1234567890 or 0123456789)');
      }
      return true;
    }),
  
  body('address.street')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length > 100) {
        throw new Error('Street address cannot exceed 100 characters');
      }
      return true;
    }),
  
  body('address.city')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length > 50) {
        throw new Error('City cannot exceed 50 characters');
      }
      return true;
    }),
  
  body('address.state')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length > 50) {
        throw new Error('State cannot exceed 50 characters');
      }
      return true;
    }),
  
  body('address.zipCode')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length > 10) {
        throw new Error('Zip code cannot exceed 10 characters');
      }
      return true;
    }),
  
  body('address.country')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length > 50) {
        throw new Error('Country cannot exceed 50 characters');
      }
      return true;
    }),
  
  body('dateOfBirth')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      // Check if it's a valid date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        throw new Error('Date of birth must be in YYYY-MM-DD format (e.g., 1990-01-15)');
      }
      // Check if it's a valid date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Please provide a valid date of birth');
      }
      // Check if date is not in the future
      if (date > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  
  body('emergencyContact.name')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length > 100) {
        throw new Error('Emergency contact name cannot exceed 100 characters');
      }
      return true;
    }),
  
  body('emergencyContact.phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty phone
      // Phone validation: must start with + or 0, 8-15 digits total
      const phoneRegex = /^[+0][\d]{7,14}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Emergency contact phone must start with + or 0 and have 8-15 digits total (e.g., +1234567890 or 0123456789)');
      }
      return true;
    }),
  
  body('emergencyContact.relationship')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty
      if (value.trim().length > 50) {
        throw new Error('Emergency contact relationship cannot exceed 50 characters');
      }
      return true;
    })
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// User update validation (for admin)
const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['guest', 'employee', 'admin'])
    .withMessage('Role must be guest, employee, or admin'),
  
  body('phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Allow empty phone
      // Phone validation: must start with + or 0, 8-15 digits total
      const phoneRegex = /^[+0][\d]{7,14}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Phone number must start with + or 0 and have 8-15 digits total (e.g., +1234567890 or 0123456789)');
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Email verification request validation
const validateEmailVerificationRequest = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

// Email code verification validation
const validateVerifyEmailCode = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('code')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateUserUpdate,
  validateEmailVerificationRequest,
  validateVerifyEmailCode
};
