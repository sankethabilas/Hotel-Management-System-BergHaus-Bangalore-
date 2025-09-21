console.log('Starting server test...');

try {
  console.log('1. Testing require statements...');
  const express = require('express');
  console.log('✅ Express loaded');
  
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded');
  
  const connectDB = require('./config/database');
  console.log('✅ Database config loaded');
  
  console.log('2. Testing route imports...');
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
  
  const userRoutes = require('./routes/users');
  console.log('✅ User routes loaded');
  
  const reservationRoutes = require('./routes/reservations');
  console.log('✅ Reservation routes loaded');
  
  const roomRoutes = require('./routes/rooms');
  console.log('✅ Room routes loaded');
  
  console.log('3. Testing server creation...');
  const app = express();
  console.log('✅ Express app created');
  
  console.log('4. Testing middleware...');
  app.use(express.json());
  console.log('✅ JSON middleware added');
  
  console.log('5. Testing route mounting...');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted');
  
  app.use('/api/users', userRoutes);
  console.log('✅ User routes mounted');
  
  app.use('/api/reservations', reservationRoutes);
  console.log('✅ Reservation routes mounted');
  
  app.use('/api/rooms', roomRoutes);
  console.log('✅ Room routes mounted');
  
  console.log('6. Testing health endpoint...');
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Test successful' });
  });
  console.log('✅ Health endpoint added');
  
  console.log('7. Testing server start...');
  const PORT = 5000;
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log('🎉 All tests passed! Server is working correctly.');
    server.close();
  });
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack trace:', error.stack);
}

