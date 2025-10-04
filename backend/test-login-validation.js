const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());
app.use(cors());

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Staff login validation (same as in your middleware)
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
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

// Test login endpoint
app.post('/test-login', validateStaffLogin, handleValidationErrors, (req, res) => {
  console.log('Login attempt with:', req.body);
  res.json({
    success: true,
    message: 'Validation passed',
    data: req.body
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test with: POST http://localhost:5001/test-login');
  console.log('Body: {"employeeId": "EMP0001", "password": "EMP0001"}');
});