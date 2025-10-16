const express = require('express');
const router = express.Router();
const crmReportsController = require('../controllers/crmReportsController');
const excelExportService = require('../services/excelExportService');
const { protect, authorize } = require('../middleware/auth');

// TEMPORARILY DISABLED AUTH FOR TESTING - RE-ENABLE IN PRODUCTION!
// Protect all routes - admin only
// router.use(protect);
// router.use(authorize('admin'));

console.log('🔍 CRM Reports routes loaded successfully');

// Report endpoints
router.get('/loyalty', (req, res, next) => {
  console.log('📊 Loyalty report endpoint hit');
  next();
}, crmReportsController.getLoyaltyReport);

router.get('/feedback', (req, res, next) => {
  console.log('📊 Feedback report endpoint hit');
  next();
}, crmReportsController.getFeedbackReport);

router.get('/offers', (req, res, next) => {
  console.log('📊 Offers report endpoint hit');
  next();
}, crmReportsController.getOffersReport);

// Excel export endpoints
router.get('/loyalty/export', async (req, res) => {
  try {
    // Get the report data first
    const reportData = await getLoyaltyReportData(req.query);
    
    console.log(`📊 Loyalty export - Total members: ${reportData.members.length}, Total transactions: ${reportData.transactions.length}`);
    
    // Generate Excel file
    const buffer = await excelExportService.generateLoyaltyExcel(reportData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=loyalty-report-${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    console.error('Loyalty Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export loyalty report',
      error: error.message
    });
  }
});

router.get('/feedback/export', async (req, res) => {
  try {
    const reportData = await getFeedbackReportData(req.query);
    
    console.log(`📊 Feedback export - Total feedback: ${reportData.feedback.length}`);
    
    const buffer = await excelExportService.generateFeedbackExcel(reportData);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=feedback-report-${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    console.error('Feedback Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export feedback report',
      error: error.message
    });
  }
});

router.get('/offers/export', async (req, res) => {
  try {
    const reportData = await getOffersReportData(req.query);
    
    console.log(`📊 Offers export - Total offers: ${reportData.offers.length}`);
    
    const buffer = await excelExportService.generateOffersExcel(reportData);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=offers-report-${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    console.error('Offers Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export offers report',
      error: error.message
    });
  }
});

// Helper functions to get report data (reusing controller logic)
async function getLoyaltyReportData(query) {
  const Loyalty = require('../models/loyaltyModel');
  const PointTransaction = require('../models/pointTransactionModel');

  const {
    startDate,
    endDate,
    tier,
    minPoints,
    maxPoints,
    status,
    sortBy = 'points',
    sortOrder = 'desc',
    limit
  } = query;

  let filter = {};

  if (tier) filter.tier = tier;
  if (status) filter.status = status;
  if (minPoints || maxPoints) {
    filter.points = {};
    if (minPoints) filter.points.$gte = parseInt(minPoints);
    if (maxPoints) filter.points.$lte = parseInt(maxPoints);
  }
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const sortConfig = {};
  sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

  let query_obj = Loyalty.find(filter).sort(sortConfig);
  if (limit) query_obj = query_obj.limit(parseInt(limit));

  const loyaltyData = await query_obj.populate('userId', 'name email');
  const memberIds = loyaltyData.map(l => l._id);
  const transactions = await PointTransaction.find({
    loyaltyId: { $in: memberIds }
  }).sort({ createdAt: -1 });

  return {
    members: loyaltyData,
    transactions,
    filters: query
  };
}

async function getFeedbackReportData(query) {
  const Feedback = require('../models/Feedback');

  const {
    startDate,
    endDate,
    category,
    minRating,
    maxRating,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  let filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const sortConfig = {};
  sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

  let feedbackData = await Feedback.find(filter)
    .sort(sortConfig)
    .populate('guestId', 'name email');

  // Filter by rating if specified
  if (minRating || maxRating) {
    feedbackData = feedbackData.filter(feedback => {
      const avgRating = calculateAverageRating(feedback.rating);
      if (minRating && avgRating < parseFloat(minRating)) return false;
      if (maxRating && avgRating > parseFloat(maxRating)) return false;
      return true;
    });
  }

  return {
    feedback: feedbackData,
    filters: query
  };
}

async function getOffersReportData(query) {
  const Offer = require('../models/offerModel');

  const {
    startDate,
    endDate,
    offerStatus,
    discountType,
    minDiscount,
    maxDiscount,
    roomType,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  let filter = {};

  if (discountType) filter.discountType = discountType;
  if (roomType) filter.applicableRooms = roomType;
  if (minDiscount || maxDiscount) {
    filter.discountValue = {};
    if (minDiscount) filter.discountValue.$gte = parseFloat(minDiscount);
    if (maxDiscount) filter.discountValue.$lte = parseFloat(maxDiscount);
  }
  if (startDate && endDate) {
    filter.$or = [
      { validFrom: { $gte: new Date(startDate), $lte: new Date(endDate) } },
      { validUntil: { $gte: new Date(startDate), $lte: new Date(endDate) } }
    ];
  }

  const sortConfig = {};
  sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

  let offersData = await Offer.find(filter).sort(sortConfig);

  const currentDate = new Date();
  if (offerStatus) {
    offersData = offersData.filter(offer => {
      if (offerStatus === 'active') {
        return offer.validFrom <= currentDate && offer.validUntil >= currentDate && offer.status === 'active';
      } else if (offerStatus === 'expired') {
        return offer.validUntil < currentDate || offer.status === 'inactive';
      } else if (offerStatus === 'upcoming') {
        return offer.validFrom > currentDate;
      }
      return true;
    });
  }

  return {
    offers: offersData,
    filters: query
  };
}

function calculateAverageRating(rating) {
  const ratings = [
    rating.checkIn,
    rating.roomQuality,
    rating.cleanliness,
    rating.dining,
    rating.staff,
    rating.overall
  ];
  const sum = ratings.reduce((acc, val) => acc + (val || 0), 0);
  return parseFloat((sum / ratings.length).toFixed(2));
}

module.exports = router;
