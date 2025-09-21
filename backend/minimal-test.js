console.log('Starting minimal test...');

// Test basic Node.js functionality
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test require functionality
try {
  const express = require('express');
  console.log('Express version:', express.version || 'loaded successfully');
} catch (error) {
  console.error('Express require error:', error.message);
}

try {
  const mongoose = require('mongoose');
  console.log('Mongoose loaded successfully');
} catch (error) {
  console.error('Mongoose require error:', error.message);
}

console.log('Minimal test completed');

