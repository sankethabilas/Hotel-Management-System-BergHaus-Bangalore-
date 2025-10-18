import { Feedback } from '../models/feedbackModel.js';

// Get feedback analytics
export async function getFeedbackAnalytics(req, res) {
  try {
    const { timeframe = '1m' } = req.query;

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '1m':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '3m':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '6m':
        startDate = new Date(now.setDate(now.getDate() - 180));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Calculate previous period for comparison
    const periodLength = Date.now() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);
    const previousPeriodEnd = startDate;

    // Main aggregation pipeline using $facet for parallel processing
    const analytics = await Feedback.aggregate([
      {
        $facet: {
          // Current period data
          currentPeriod: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: null,
                totalFeedback: { $sum: 1 },
                avgRating: { $avg: '$rating' },
                totalResponded: {
                  $sum: {
                    $cond: [
                      { $and: [{ $ne: ['$managerResponse', ''] }, { $ne: ['$managerResponse', null] }] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],

          // Previous period data for comparison
          previousPeriod: [
            {
              $match: {
                createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
              }
            },
            {
              $group: {
                _id: null,
                totalFeedback: { $sum: 1 },
                avgRating: { $avg: '$rating' }
              }
            }
          ],

          // Monthly trend data
          monthlyTrend: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                average: { $avg: '$rating' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ],

          // Rating distribution
          ratingDistribution: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: '$rating',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: -1 } }
          ],

          // Category ratings
          categoryRatings: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: '$category',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
              }
            },
            { $sort: { avgRating: -1 } }
          ],

          // Response time calculation
          responseTime: [
            {
              $match: {
                createdAt: { $gte: startDate },
                responseDate: { $exists: true, $ne: null }
              }
            },
            {
              $project: {
                responseTimeHours: {
                  $divide: [
                    { $subtract: ['$responseDate', '$createdAt'] },
                    1000 * 60 * 60 // Convert to hours
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgResponseTime: { $avg: '$responseTimeHours' }
              }
            }
          ]
        }
      }
    ]);

    const data = analytics[0];

    // Process current period data
    const currentPeriodData = data.currentPeriod[0] || {
      totalFeedback: 0,
      avgRating: 0,
      totalResponded: 0
    };

    const previousPeriodData = data.previousPeriod[0] || {
      totalFeedback: 0,
      avgRating: 0
    };

    // Calculate metrics
    const overallRating = currentPeriodData.avgRating || 0;
    const totalFeedback = currentPeriodData.totalFeedback;
    const responseRate = totalFeedback > 0 
      ? (currentPeriodData.totalResponded / totalFeedback * 100) 
      : 0;
    const avgResponseTime = data.responseTime[0]?.avgResponseTime || 0;

    // Calculate trends (comparison with previous period)
    const ratingChange = previousPeriodData.avgRating 
      ? overallRating - previousPeriodData.avgRating 
      : 0;
    
    const feedbackChange = previousPeriodData.totalFeedback 
      ? ((totalFeedback - previousPeriodData.totalFeedback) / previousPeriodData.totalFeedback * 100) 
      : 0;

    // Format monthly trend data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = data.monthlyTrend.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      average: parseFloat(item.average.toFixed(1)),
      count: item.count
    }));

    // Format rating distribution
    const ratingLabels = {
      5: '5 Stars',
      4: '4 Stars',
      3: '3 Stars',
      2: '2 Stars',
      1: '1 Star'
    };

    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
      const found = data.ratingDistribution.find(r => r._id === rating);
      return {
        name: ratingLabels[rating],
        value: found ? found.count : 0,
        rating: rating
      };
    }).reverse(); // 5 stars first

    // Format category ratings
    const categoryRatings = data.categoryRatings.map(item => ({
      category: item._id || 'Other',
      rating: parseFloat(item.avgRating.toFixed(1)),
      count: item.count
    }));

    // Build response
    const response = {
      summary: {
        overallRating: parseFloat(overallRating.toFixed(1)),
        totalFeedback,
        responseRate: parseFloat(responseRate.toFixed(0)),
        avgResponseTime: parseFloat(avgResponseTime.toFixed(1))
      },
      trends: {
        ratingChange: parseFloat(ratingChange.toFixed(1)),
        feedbackChange: parseFloat(feedbackChange.toFixed(0)),
        // Response rate and time trends would need more complex calculation
        responseRateChange: 0, // Placeholder
        responseTimeChange: 0  // Placeholder
      },
      charts: {
        monthlyData,
        ratingDistribution,
        categoryRatings
      },
      timeframe,
      generatedAt: new Date()
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ 
      message: 'Error generating analytics', 
      error: error.message 
    });
  }
}
