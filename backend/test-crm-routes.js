// Quick test to verify CRM reports routes are loaded
const express = require('express');
const app = express();

// Try to require the routes to check for syntax errors
try {
  const crmReportsRoutes = require('./routes/crmReports');
  console.log('✅ CRM Reports routes loaded successfully');
  
  // Check controller
  const crmReportsController = require('./controllers/crmReportsController');
  console.log('✅ CRM Reports controller loaded successfully');
  
  // Check service
  const excelExportService = require('./services/excelExportService');
  console.log('✅ Excel Export service loaded successfully');
  
  console.log('\n📋 Available functions:');
  console.log('Controller:', Object.keys(crmReportsController));
  
  console.log('\n✅ All CRM Reports modules are ready!');
  console.log('\n🔄 Please restart your backend server with: npm run dev');
  
} catch (error) {
  console.error('❌ Error loading CRM Reports modules:', error.message);
  console.error('Stack:', error.stack);
}
