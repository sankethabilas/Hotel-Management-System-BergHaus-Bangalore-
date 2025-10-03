const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Security middleware - temporarily disabled for debugging
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       imgSrc: ["'self'", "data:", "http://localhost:5000"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//     },
//   },
// }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Import upload middleware
const upload = require('./middleware/upload');

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// Connect to Database
connectDB();

// Routes - Hotel Booking System
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/frontdesk', require('./routes/frontdesk'));
app.use('/api/bills', require('./routes/bills'));

// Routes - Staff Management System
app.use('/api/staff', require('./routes/staff'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/attendance', require('./routes/attendance'));

// Routes - Food & Beverage Management System
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/staff-requests', require('./routes/staffRequestRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Unified HMS Backend is running - Hotel Booking + Staff Management + Food & Beverage',
    systems: ['Hotel Booking', 'Staff Management', 'Food & Beverage', 'Reservations', 'Payments', 'Menu Management'],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Unified HMS Server running on port ${PORT}`);
  console.log(`🏨 Hotel Booking System: http://localhost:${PORT}/api/health`);
  console.log(`👥 Staff Management System: http://localhost:${PORT}/api/staff`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
