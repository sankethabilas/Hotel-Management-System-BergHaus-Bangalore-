const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Connect to database
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HMS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Simple booking test endpoint
app.post('/api/booking/test', (req, res) => {
  console.log('Test booking request:', req.body);
  res.json({
    success: true,
    message: 'Test booking endpoint working',
    data: req.body
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test booking: http://localhost:${PORT}/api/booking/test`);
});
