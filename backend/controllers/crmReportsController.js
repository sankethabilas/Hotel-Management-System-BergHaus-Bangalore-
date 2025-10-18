const Loyalty = require('../models/loyaltyModel');
const Feedback = require('../models/Feedback');
const Offer = require('../models/offerModel');
const PointTransaction = require('../models/pointTransactionModel');
const User = require('../models/User');

// Get Loyalty & Points Report
exports.getLoyaltyReport = async (req, res) => {
  try {
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
    } = req.query;

    // Build filter query
    let filter = {};

    if (tier) {
      filter.tier = tier;
    }

    if (status) {
      filter.status = status;
    }

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

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Query with limit if provided
    let query = Loyalty.find(filter).sort(sortConfig);
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const loyaltyData = await query.populate('userId', 'name email');

    // Get point transactions for the filtered members
    const memberIds = loyaltyData.map(l => l._id);
    const transactions = await PointTransaction.find({
      loyaltyId: { $in: memberIds }
    }).sort({ createdAt: -1 });

    // Calculate statistics
    const totalMembers = loyaltyData.length;
    const totalPoints = loyaltyData.reduce((sum, member) => sum + member.points, 0);
    const avgPoints = totalMembers > 0 ? totalPoints / totalMembers : 0;

    // Tier distribution
    const tierDistribution = {
      Silver: loyaltyData.filter(m => m.tier === 'Silver').length,
      Gold: loyaltyData.filter(m => m.tier === 'Gold').length,
      Platinum: loyaltyData.filter(m => m.tier === 'Platinum').length
    };

    // Status distribution
    const statusDistribution = {
      active: loyaltyData.filter(m => m.status === 'active').length,
      inactive: loyaltyData.filter(m => m.status === 'inactive').length
    };

    // Top 10 members by points
    const topMembers = loyaltyData.slice(0, 10);

    // Points trend (last 12 months)
    const pointsTrend = await getPointsTrend();

    res.status(200).json({
      success: true,
      data: {
        members: loyaltyData,
        transactions,
        statistics: {
          totalMembers,
          totalPoints,
          avgPoints: parseFloat(avgPoints.toFixed(2)),
          tierDistribution,
          statusDistribution
        },
        topMembers,
        pointsTrend
      }
    });
  } catch (error) {
    console.error('Loyalty report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate loyalty report',
      error: error.message
    });
  }
};

// Get Feedback Report
exports.getFeedbackReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      minRating,
      maxRating,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const feedbackData = await Feedback.find(filter)
      .sort(sortConfig)
      .populate('guestId', 'name email');

    // Filter by rating if specified (calculate average rating first)
    let filteredFeedback = feedbackData;
    if (minRating || maxRating) {
      filteredFeedback = feedbackData.filter(feedback => {
        const avgRating = calculateAverageRating(feedback.rating);
        if (minRating && avgRating < parseFloat(minRating)) return false;
        if (maxRating && avgRating > parseFloat(maxRating)) return false;
        return true;
      });
    }

    // Calculate statistics
    const totalFeedback = filteredFeedback.length;
    
    // Category distribution
    const categoryDistribution = {};
    const categories = ['Front Desk', 'Restaurant', 'Room Service', 'Facilities', 'Management'];
    categories.forEach(cat => {
      categoryDistribution[cat] = filteredFeedback.filter(f => f.category === cat).length;
    });

    // Status distribution
    const statusDistribution = {
      pending: filteredFeedback.filter(f => f.status === 'pending').length,
      'in-progress': filteredFeedback.filter(f => f.status === 'in-progress').length,
      resolved: filteredFeedback.filter(f => f.status === 'resolved').length
    };

    // Rating analysis
    const ratingAnalysis = {
      checkIn: calculateCategoryAverage(filteredFeedback, 'checkIn'),
      roomQuality: calculateCategoryAverage(filteredFeedback, 'roomQuality'),
      cleanliness: calculateCategoryAverage(filteredFeedback, 'cleanliness'),
      dining: calculateCategoryAverage(filteredFeedback, 'dining'),
      staff: calculateCategoryAverage(filteredFeedback, 'staff'),
      overall: calculateCategoryAverage(filteredFeedback, 'overall')
    };

    // Sentiment distribution
    const sentimentDistribution = {
      positive: filteredFeedback.filter(f => {
        const avg = calculateAverageRating(f.rating);
        return avg >= 4;
      }).length,
      neutral: filteredFeedback.filter(f => {
        const avg = calculateAverageRating(f.rating);
        return avg >= 2.5 && avg < 4;
      }).length,
      negative: filteredFeedback.filter(f => {
        const avg = calculateAverageRating(f.rating);
        return avg < 2.5;
      }).length
    };

    // Feedback trend (last 12 months)
    const feedbackTrend = await getFeedbackTrend();

    res.status(200).json({
      success: true,
      data: {
        feedback: filteredFeedback,
        statistics: {
          totalFeedback,
          categoryDistribution,
          statusDistribution,
          ratingAnalysis,
          sentimentDistribution
        },
        feedbackTrend
      }
    });
  } catch (error) {
    console.error('Feedback report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate feedback report',
      error: error.message
    });
  }
};

// Get Offers Report
exports.getOffersReport = async (req, res) => {
  try {
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
    } = req.query;

    // Build filter query
    let filter = {};

    if (discountType) {
      filter.discountType = discountType;
    }

    if (roomType) {
      filter.applicableRooms = roomType;
    }

    if (minDiscount || maxDiscount) {
      filter.discountValue = {};
      if (minDiscount) filter.discountValue.$gte = parseFloat(minDiscount);
      if (maxDiscount) filter.discountValue.$lte = parseFloat(maxDiscount);
    }

    // Date range for offer validity
    if (startDate && endDate) {
      filter.$or = [
        {
          validFrom: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          validUntil: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let offersData = await Offer.find(filter).sort(sortConfig);

    // Filter by status (active, expired, upcoming)
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

    // Calculate statistics
    const totalOffers = offersData.length;
    const activeOffers = offersData.filter(o => 
      o.validFrom <= currentDate && o.validUntil >= currentDate && o.status === 'active'
    ).length;
    const expiredOffers = offersData.filter(o => 
      o.validUntil < currentDate || o.status === 'inactive'
    ).length;
    const upcomingOffers = offersData.filter(o => 
      o.validFrom > currentDate
    ).length;

    // Discount type distribution
    const discountTypeDistribution = {
      percentage: offersData.filter(o => o.discountType === 'percentage').length,
      fixed: offersData.filter(o => o.discountType === 'fixed').length,
      special: offersData.filter(o => o.discountType === 'special').length
    };

    // Usage statistics (mock data - you can enhance this with actual booking data)
    const usageStats = offersData.map(offer => ({
      offerId: offer._id,
      title: offer.title,
      timesUsed: offer.usageCount || 0,
      totalRevenue: offer.totalRevenue || 0
    })).sort((a, b) => b.timesUsed - a.timesUsed);

    // Top performing offers
    const topOffers = usageStats.slice(0, 10);

    // Average discount by type
    const avgDiscounts = {
      percentage: calculateAvgDiscount(offersData.filter(o => o.discountType === 'percentage')),
      fixed: calculateAvgDiscount(offersData.filter(o => o.discountType === 'fixed'))
    };

    // Offers trend (last 12 months)
    const offersTrend = await getOffersTrend();

    res.status(200).json({
      success: true,
      data: {
        offers: offersData,
        statistics: {
          totalOffers,
          activeOffers,
          expiredOffers,
          upcomingOffers,
          discountTypeDistribution,
          avgDiscounts
        },
        usageStats: topOffers,
        offersTrend
      }
    });
  } catch (error) {
    console.error('Offers report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate offers report',
      error: error.message
    });
  }
};

// Helper Functions
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

function calculateCategoryAverage(feedbackArray, category) {
  if (feedbackArray.length === 0) return 0;
  const sum = feedbackArray.reduce((acc, feedback) => {
    return acc + (feedback.rating[category] || 0);
  }, 0);
  return parseFloat((sum / feedbackArray.length).toFixed(2));
}

function calculateAvgDiscount(offers) {
  if (offers.length === 0) return 0;
  const sum = offers.reduce((acc, offer) => acc + (offer.discountValue || 0), 0);
  return parseFloat((sum / offers.length).toFixed(2));
}

async function getPointsTrend() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
    
    const monthlyPoints = await PointTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: date, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalEarned: {
            $sum: {
              $cond: [{ $eq: ['$type', 'earn'] }, '$points', 0]
            }
          },
          totalRedeemed: {
            $sum: {
              $cond: [{ $eq: ['$type', 'redeem'] }, '$points', 0]
            }
          }
        }
      }
    ]);

    months.push({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      earned: monthlyPoints[0]?.totalEarned || 0,
      redeemed: monthlyPoints[0]?.totalRedeemed || 0
    });
  }

  return months;
}

async function getFeedbackTrend() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
    
    const monthlyFeedback = await Feedback.countDocuments({
      createdAt: { $gte: date, $lt: nextMonth }
    });

    const avgRating = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: date, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$rating.overall' }
        }
      }
    ]);

    months.push({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count: monthlyFeedback,
      avgRating: avgRating[0]?.avgOverall ? parseFloat(avgRating[0].avgOverall.toFixed(2)) : 0
    });
  }

  return months;
}

async function getOffersTrend() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
    
    const monthlyOffers = await Offer.countDocuments({
      createdAt: { $gte: date, $lt: nextMonth }
    });

    const activeOffers = await Offer.countDocuments({
      validFrom: { $lte: nextMonth },
      validUntil: { $gte: date },
      status: 'active'
    });

    months.push({
      month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      created: monthlyOffers,
      active: activeOffers
    });
  }

  return months;
}
