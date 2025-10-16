const express = require('express');
const router = express.Router();
const crmReportsController = require('../controllers/crmReportsController');
const excelExportService = require('../services/excelExportService');

// Test routes WITHOUT authentication for verification
router.get('/test-loyalty', crmReportsController.getLoyaltyReport);
router.get('/test-feedback', crmReportsController.getFeedbackReport);
router.get('/test-offers', crmReportsController.getOffersReport);

console.log('✅ Test CRM routes loaded (no auth)');

module.exports = router;
