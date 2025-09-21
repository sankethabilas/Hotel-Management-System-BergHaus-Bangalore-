console.log('=== DEBUGGING SERVER STARTUP ===');

// Test 1: Basic requires
console.log('1. Testing basic requires...');
try {
  const express = require('express');
  console.log('✅ Express loaded');
} catch (e) {
  console.error('❌ Express error:', e.message);
  process.exit(1);
}

// Test 2: Database connection
console.log('2. Testing database connection...');
try {
  const connectDB = require('./config/database');
  console.log('✅ Database config loaded');
} catch (e) {
  console.error('❌ Database error:', e.message);
}

// Test 3: Auth middleware
console.log('3. Testing auth middleware...');
try {
  const { protect } = require('./middleware/auth');
  console.log('✅ Auth middleware loaded');
} catch (e) {
  console.error('❌ Auth middleware error:', e.message);
}

// Test 4: Validation middleware
console.log('4. Testing validation middleware...');
try {
  const { validateMongoId } = require('./middleware/reservationValidation');
  console.log('✅ Validation middleware loaded');
} catch (e) {
  console.error('❌ Validation middleware error:', e.message);
}

// Test 5: Controllers
console.log('5. Testing controllers...');
try {
  const reservationController = require('./controllers/reservationController');
  console.log('✅ Reservation controller loaded');
} catch (e) {
  console.error('❌ Reservation controller error:', e.message);
}

try {
  const roomController = require('./controllers/roomController');
  console.log('✅ Room controller loaded');
} catch (e) {
  console.error('❌ Room controller error:', e.message);
}

// Test 6: Routes
console.log('6. Testing routes...');
try {
  const reservationRoutes = require('./routes/reservations');
  console.log('✅ Reservation routes loaded');
} catch (e) {
  console.error('❌ Reservation routes error:', e.message);
}

try {
  const roomRoutes = require('./routes/rooms');
  console.log('✅ Room routes loaded');
} catch (e) {
  console.error('❌ Room routes error:', e.message);
}

console.log('=== DEBUG COMPLETE ===');
