import { User } from '../models/userModel.js';
import { Feedback } from '../models/feedbackModel.js';
import { Loyalty } from '../models/loyaltyModel.js';
import { Offer } from '../models/offerModel.js';
import { Booking } from '../models/bookingModel.js';

// Get dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate previous period for comparison
    const periodLength = now.getTime() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);
    const previousPeriodEnd = startDate;

    // 1. Total Guests Statistics
    const totalGuestsCurrent = await User.countDocuments({
      role: 'guest',
      createdAt: { $gte: startDate }
    });

    const totalGuestsPrevious = await User.countDocuments({
      role: 'guest',
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
    });

    const totalGuestsAll = await User.countDocuments({ role: 'guest' });

    const totalGuestsChange = totalGuestsPrevious > 0
      ? ((totalGuestsCurrent - totalGuestsPrevious) / totalGuestsPrevious * 100).toFixed(1)
      : totalGuestsCurrent > 0 ? '100' : '0';

    // 2. Average Rating Statistics
    const ratingStatsCurrent = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const ratingStatsPrevious = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const avgRatingCurrent = ratingStatsCurrent[0]?.avgRating || 0;
    const avgRatingPrevious = ratingStatsPrevious[0]?.avgRating || 0;
    const avgRatingChange = avgRatingPrevious > 0
      ? (avgRatingCurrent - avgRatingPrevious).toFixed(1)
      : avgRatingCurrent > 0 ? avgRatingCurrent.toFixed(1) : '0';

    // 3. Loyalty Members Statistics
    const loyaltyMembersCurrent = await Loyalty.countDocuments({
      enrollmentDate: { $gte: startDate }
    });

    const loyaltyMembersPrevious = await Loyalty.countDocuments({
      enrollmentDate: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
    });

    const loyaltyMembersAll = await Loyalty.countDocuments();

    const loyaltyMembersChange = loyaltyMembersPrevious > 0
      ? ((loyaltyMembersCurrent - loyaltyMembersPrevious) / loyaltyMembersPrevious * 100).toFixed(1)
      : loyaltyMembersCurrent > 0 ? '100' : '0';

    // 4. Active Offers Statistics
    const activeOffersCurrent = await Offer.countDocuments({
      status: 'active',
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });

    const activeOffersPrevious = await Offer.countDocuments({
      status: 'active',
      validFrom: { $lte: previousPeriodEnd },
      validUntil: { $gte: previousPeriodStart }
    });

    const activeOffersChange = activeOffersPrevious > 0
      ? (activeOffersCurrent - activeOffersPrevious).toString()
      : activeOffersCurrent > 0 ? `+${activeOffersCurrent}` : '0';

    // 5. Satisfaction Trend (Monthly)
    const satisfactionTrend = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          satisfaction: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const satisfactionData = satisfactionTrend.map(item => ({
      month: monthNames[item._id.month - 1],
      satisfaction: parseFloat(item.satisfaction.toFixed(1))
    }));

    // 6. Loyalty Enrollment by Tier
    const loyaltyEnrollment = await Loyalty.aggregate([
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const loyaltyData = tierOrder.map(tier => {
      const found = loyaltyEnrollment.find(item => item._id === tier);
      return {
        tier,
        count: found ? found.count : 0
      };
    });

    // 7. Recent Feedback (Last 5)
    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('guestName email rating comment managerResponse createdAt')
      .lean();

    const recentFeedbackFormatted = recentFeedback.map(feedback => ({
      id: feedback._id,
      guest: feedback.guestName || feedback.email,
      rating: feedback.rating,
      comment: feedback.comment,
      date: feedback.createdAt,
      status: feedback.managerResponse ? 'responded' : 'pending'
    }));

    // 8. Top Guests by Booking Count
    const topGuests = await Booking.aggregate([
      {
        $group: {
          _id: '$guestId',
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $lookup: {
          from: 'loyalties',
          localField: '_id',
          foreignField: 'userId',
          as: 'loyaltyInfo'
        }
      },
      {
        $project: {
          guestId: '$_id',
          name: { $arrayElemAt: ['$userInfo.name', 0] },
          email: { $arrayElemAt: ['$userInfo.email', 0] },
          visits: '$bookingCount',
          loyaltyTier: { $arrayElemAt: ['$loyaltyInfo.tier', 0] },
          points: { $arrayElemAt: ['$loyaltyInfo.points', 0] }
        }
      }
    ]);

    const topGuestsFormatted = topGuests.map(guest => ({
      id: guest.guestId,
      name: guest.name || guest.email || 'Unknown Guest',
      visits: guest.visits,
      loyaltyTier: guest.loyaltyTier || 'N/A',
      points: guest.points || 0
    }));

    // Build response
    const response = {
      stats: {
        totalGuests: {
          value: totalGuestsAll,
          change: totalGuestsChange >= 0 ? `+${totalGuestsChange}%` : `${totalGuestsChange}%`,
          trend: totalGuestsChange >= 0 ? 'up' : 'down'
        },
        averageRating: {
          value: avgRatingCurrent.toFixed(1),
          change: avgRatingChange >= 0 ? `+${avgRatingChange}` : avgRatingChange,
          trend: avgRatingChange >= 0 ? 'up' : 'down'
        },
        loyaltyMembers: {
          value: loyaltyMembersAll,
          change: loyaltyMembersChange >= 0 ? `+${loyaltyMembersChange}%` : `${loyaltyMembersChange}%`,
          trend: loyaltyMembersChange >= 0 ? 'up' : 'down'
        },
        activeOffers: {
          value: activeOffersCurrent,
          change: activeOffersChange.startsWith('+') || activeOffersChange.startsWith('-') 
            ? activeOffersChange 
            : `+${activeOffersChange}`,
          trend: activeOffersChange.startsWith('-') ? 'down' : 'up'
        }
      },
      charts: {
        satisfactionTrend: satisfactionData,
        loyaltyEnrollment: loyaltyData
      },
      recentFeedback: recentFeedbackFormatted,
      topGuests: topGuestsFormatted,
      timeframe,
      generatedAt: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({
      message: 'Error generating dashboard statistics',
      error: error.message
    });
  }
}
