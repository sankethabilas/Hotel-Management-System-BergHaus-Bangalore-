const Feedback = require('../models/Feedback');
const { sendEmail } = require('../services/emailService');

/**
 * Create new feedback
 * POST /api/feedback
 */
const createFeedback = async (req, res) => {
  try {
    const {
      name,
      email,
      category,
      rating,
      comments,
      images,
      anonymous
    } = req.body;

    // Parse rating if it's a string (from FormData)
    let parsedRating = rating;
    if (typeof rating === 'string') {
      try {
        parsedRating = JSON.parse(rating);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid rating format'
        });
      }
    }

    // Validate required fields
    if (!name || !email || !category || !parsedRating) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, category, and rating are required'
      });
    }

    // Validate rating object
    const requiredRatings = ['checkIn', 'roomQuality', 'cleanliness', 'dining', 'amenities'];
    for (const field of requiredRatings) {
      if (!parsedRating[field] || parsedRating[field] < 1 || parsedRating[field] > 5) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field} rating. Must be between 1 and 5`
        });
      }
    }

    // Create feedback
    const feedback = new Feedback({
      guestId: req.user?.id || null,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      category,
      rating: parsedRating,
      comments: comments?.trim() || '',
      images: images || [],
      anonymous: anonymous === 'true' || anonymous === true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

      await feedback.save();

      // Send confirmation email to guest
      try {
        await sendEmail({
          to: email,
          subject: 'Thank you for your feedback - Berghaus Bungalow HMS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #006bb8, #2fa0df); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🏨 Berghaus Bungalow HMS</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your valuable feedback!</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #006bb8; margin-top: 0;">Dear ${name},</h2>
                
                <p>Thank you for taking the time to share your feedback with us. Your input is incredibly valuable in helping us improve our services and ensure the best possible experience for all our guests.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #006bb8;">
                  <h3 style="color: #006bb8; margin-top: 0;">Your Feedback Summary:</h3>
                  <p><strong>Category:</strong> ${category}</p>
                  <p><strong>Overall Rating:</strong> ${feedback.overallRating}/5 ⭐</p>
                  ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
                </div>
                
                <p>We review all feedback carefully and use it to enhance our services. If you have any urgent concerns, please don't hesitate to contact us directly:</p>
                
                <div style="background: #006bb8; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">📞 +94 77 123 4567 (Front Desk)</p>
                  <p style="margin: 5px 0 0 0;">📧 info@berghausbungalow.com</p>
                </div>
                
                <p>We look forward to welcoming you back to Berghaus Bungalow!</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0;">
                    Berghaus Bungalow HMS | Ella, Sri Lanka<br>
                    <a href="https://berghausbungalow.com" style="color: #006bb8;">www.berghausbungalow.com</a>
                  </p>
                </div>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending feedback confirmation email:', emailError);
        // Don't fail the request if email fails
      }

      // Send notification email to hotel staff
      try {
        await sendEmail({
          to: 'feedback@berghausbungalow.com',
          subject: `New Guest Feedback - ${category} (${feedback.overallRating}/5)`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #ffc973, #fee3b3); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">⭐ New Guest Feedback</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Berghaus Bungalow HMS</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #006bb8;">
                  <h3 style="color: #006bb8; margin-top: 0;">Guest Details:</h3>
                  <p><strong>Name:</strong> ${anonymous === 'true' ? 'Anonymous' : name}</p>
                  <p><strong>Email:</strong> ${anonymous === 'true' ? 'Hidden' : email}</p>
                  <p><strong>Category:</strong> ${category}</p>
                  <p><strong>Overall Rating:</strong> ${feedback.overallRating}/5 ⭐</p>
                  <p><strong>Submitted:</strong> ${feedback.formattedDate}</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc973;">
                  <h3 style="color: #333; margin-top: 0;">Detailed Ratings:</h3>
                  <p><strong>Check-in Experience:</strong> ${parsedRating.checkIn}/5</p>
                  <p><strong>Room Quality:</strong> ${parsedRating.roomQuality}/5</p>
                  <p><strong>Cleanliness:</strong> ${parsedRating.cleanliness}/5</p>
                  <p><strong>Dining:</strong> ${parsedRating.dining}/5</p>
                  <p><strong>Amenities:</strong> ${parsedRating.amenities}/5</p>
                </div>
                
                ${comments ? `
                  <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                    <h3 style="color: #333; margin-top: 0;">Comments:</h3>
                    <p style="white-space: pre-wrap; line-height: 1.6;">${comments}</p>
                  </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://berghausbungalow.com/admin/feedback" 
                     style="background: #006bb8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    View in Admin Panel
                  </a>
                </div>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending feedback notification email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Thank you for your feedback! We truly appreciate your time.',
        data: {
          id: feedback._id,
          overallRating: feedback.overallRating,
          submittedAt: feedback.createdAt
        }
      });

  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again later.'
    });
  }
};

/**
 * Get all feedback (admin only)
 * GET /api/feedback
 */
const getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, rating, startDate, endDate } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (rating) {
      const ratingNum = parseInt(rating);
      query['rating.checkIn'] = { $gte: ratingNum };
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('guestId', 'fullName email')
      .populate('respondedBy', 'fullName email');

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

/**
 * Get feedback by guest ID
 * GET /api/feedback/guest/:guestId
 */
const getFeedbackByGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    
    const feedback = await Feedback.find({ guestId })
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'fullName email');

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching guest feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest feedback'
    });
  }
};

/**
 * Get single feedback
 * GET /api/feedback/:id
 */
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('guestId', 'fullName email')
      .populate('respondedBy', 'fullName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

/**
 * Update feedback status
 * PATCH /api/feedback/:id/status
 */
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.status = status;
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status'
    });
  }
};

/**
 * Add admin response to feedback
 * PATCH /api/feedback/:id/response
 */
const addAdminResponse = async (req, res) => {
  try {
    const { response } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.adminResponse = response;
    feedback.respondedBy = req.user?.id || null;
    feedback.respondedAt = new Date();
    feedback.status = 'Responded';
    
    await feedback.save();

    // Send response email to guest
    try {
      await sendEmail({
        to: feedback.email,
        subject: `Response to your feedback - Berghaus Bungalow HMS`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #006bb8, #2fa0df); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🏨 Berghaus Bungalow HMS</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Response to your feedback</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #006bb8; margin-top: 0;">Dear ${feedback.name},</h2>
              
              <p>Thank you for your recent feedback. We have reviewed your comments and would like to respond:</p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #28a745; margin-top: 0;">Our Response:</h3>
                <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  ${response.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <p>We appreciate your feedback and look forward to serving you better in the future.</p>
              
              <div style="background: #006bb8; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">📞 +94 77 123 4567 (Front Desk)</p>
                <p style="margin: 5px 0 0 0;">📧 info@berghausbungalow.com</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="color: #6c757d; font-size: 14px; margin: 0;">
                  Berghaus Bungalow HMS | Ella, Sri Lanka<br>
                  <a href="https://berghausbungalow.com" style="color: #006bb8;">www.berghausbungalow.com</a>
                </p>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending response email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Response added successfully and sent to guest',
      data: feedback
    });
  } catch (error) {
    console.error('Error adding admin response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
};

/**
 * Delete feedback
 * DELETE /api/feedback/:id
 */
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
};

/**
 * Get feedback analytics
 * GET /api/feedback/analytics
 */
const getFeedbackAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get basic metrics
    const totalFeedback = await Feedback.countDocuments();
    const pendingFeedback = await Feedback.countDocuments({ status: 'Pending' });
    const reviewedFeedback = await Feedback.countDocuments({ status: 'Reviewed' });
    const respondedFeedback = await Feedback.countDocuments({ status: 'Responded' });

    // Get average ratings
    const avgRatings = await Feedback.getAverageRatings({
      createdAt: { $gte: startDate }
    });

    // Get feedback by category
    const feedbackByCategory = await Feedback.getFeedbackByCategory();

    // Get feedback by status
    const feedbackByStatus = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Get daily feedback counts
    const feedbackByDay = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          avgRating: { $round: ['$avgRating', 1] },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalFeedback,
        pendingFeedback,
        reviewedFeedback,
        respondedFeedback,
        averageRatings: avgRatings[0] || {
          avgCheckIn: 0,
          avgRoomQuality: 0,
          avgCleanliness: 0,
          avgDining: 0,
          avgAmenities: 0,
          totalCount: 0
        },
        feedbackByCategory,
        feedbackByStatus,
        feedbackByDay
      }
    });
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback analytics'
    });
  }
};

/**
 * Get public reviewed feedback (no authentication required)
 * GET /api/feedback/public
 */
const getPublicReviewedFeedback = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Only fetch reviewed feedback for public display
    const feedback = await Feedback.find({ status: 'Reviewed' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name email category rating comments anonymous createdAt overallRating')
      .lean();

    // Hide sensitive information for anonymous feedback
    const publicFeedback = feedback.map(item => ({
      ...item,
      email: item.anonymous ? 'hidden@example.com' : item.email,
      name: item.anonymous ? 'Anonymous Guest' : item.name
    }));

    res.json({
      success: true,
      data: publicFeedback
    });
  } catch (error) {
    console.error('Error fetching public feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackByGuest,
  getFeedbackById,
  updateFeedbackStatus,
  addAdminResponse,
  deleteFeedback,
  getFeedbackAnalytics,
  getPublicReviewedFeedback
};
