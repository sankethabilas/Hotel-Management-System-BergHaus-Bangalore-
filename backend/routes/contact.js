const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { sendEmail } = require('../services/emailService');
const HtmlPdfService = require('../services/htmlPdfService');
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for contact form submissions
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many contact form submissions from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Submit contact form (with rate limiting)
router.post('/submit', contactFormLimiter, async (req, res) => {
  try {
    const { fullName, email, phone, subject, message, reasonForContact } = req.body;

    // Validate required fields
    if (!fullName || !email || !subject || !message || !reasonForContact) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate reason for contact
    const validReasons = ['booking', 'complaint', 'corporate', 'event', 'other'];
    if (!validReasons.includes(reasonForContact)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reason for contact'
      });
    }

    // Create contact message
    const contactMessage = new ContactMessage({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      subject: subject.trim(),
      message: message.trim(),
      reasonForContact,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await contactMessage.save();

    // Send confirmation email to guest
    try {
      await sendEmail({
        to: email,
        subject: 'Thanks for contacting Berghaus Bungalow HMS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #006bb8, #2fa0df); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🏨 Berghaus Bungalow HMS</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for contacting us!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #006bb8; margin-top: 0;">Dear ${fullName},</h2>
              
              <p>Thank you for reaching out to Berghaus Bungalow HMS. We have received your message and our team will get back to you shortly.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #006bb8;">
                <h3 style="color: #006bb8; margin-top: 0;">Your Message Details:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Reason:</strong> ${reasonForContact.charAt(0).toUpperCase() + reasonForContact.slice(1)}</p>
                <p><strong>Message:</strong> ${message}</p>
              </div>
              
              <p>We typically respond within 24 hours during business days. For urgent matters, please call us directly at:</p>
              
              <div style="background: #006bb8; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">📞 +94 77 123 4567 (Front Desk)</p>
                <p style="margin: 5px 0 0 0;">📧 info@berghausbungalow.com</p>
              </div>
              
              <p>We look forward to assisting you!</p>
              
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
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to hotel staff
    try {
      await sendEmail({
        to: 'bookings@berghausbungalow.com',
        subject: `New Contact Form Submission - ${reasonForContact.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ffc973, #fee3b3); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🔔 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Berghaus Bungalow HMS</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #006bb8;">
                <h3 style="color: #006bb8; margin-top: 0;">Contact Details:</h3>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Reason:</strong> ${reasonForContact.charAt(0).toUpperCase() + reasonForContact.slice(1)}</p>
                <p><strong>Priority:</strong> ${contactMessage.priority.toUpperCase()}</p>
                <p><strong>Submitted:</strong> ${contactMessage.formattedCreatedAt}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc973;">
                <h3 style="color: #333; margin-top: 0;">Message:</h3>
                <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://berghausbungalow.com/admin/contact-messages" 
                   style="background: #006bb8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you shortly.',
      data: {
        id: contactMessage._id,
        submittedAt: contactMessage.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again later.'
    });
  }
});

// Get all contact messages (admin only)
router.get('/messages', protect, authorize('admin', 'frontdesk'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, reason } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (reason) query.reasonForContact = reason;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'fullName email')
      .populate('respondedBy', 'fullName email');

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
});

// Get user's own contact messages
router.get('/user/messages', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, reason } = req.query;
    
    const query = { email: req.user.email };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (reason) query.reasonForContact = reason;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'fullName email')
      .populate('respondedBy', 'fullName email');

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      data: {
        docs: messages,
        totalDocs: total,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        nextPage: page < Math.ceil(total / limit) ? parseInt(page) + 1 : null,
        prevPage: page > 1 ? parseInt(page) - 1 : null
      }
    });
  } catch (error) {
    console.error('Error fetching user contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your messages'
    });
  }
});

// Get single contact message
router.get('/messages/:id', protect, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('respondedBy', 'fullName email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message'
    });
  }
});

// Update contact message status
router.patch('/messages/:id/status', protect, async (req, res) => {
  try {
    const { status, assignedTo, isRead } = req.body;
    
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    if (status) message.status = status;
    if (assignedTo) message.assignedTo = assignedTo;
    if (typeof isRead === 'boolean') message.isRead = isRead;

    await message.save();

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact message'
    });
  }
});

// Add response to contact message
router.patch('/messages/:id/response', protect, async (req, res) => {
  try {
    const { response, respondedBy } = req.body;
    
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Add response to the message
    message.response = response;
    message.respondedBy = null; // Set to null since we don't have a valid ObjectId
    message.respondedAt = new Date();
    message.status = 'resolved';
    message.isRead = true;
    
    await message.save();

    // Send email reply to guest
    try {
      await sendEmail({
        to: message.email,
        subject: `Re: ${message.subject} - Berghaus Bungalow HMS`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #006bb8, #2fa0df); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🏨 Berghaus Bungalow HMS</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Response to your inquiry</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #006bb8; margin-top: 0;">Dear ${message.fullName},</h2>
              
              <p>Thank you for contacting Berghaus Bungalow HMS. We have received your message and our team has responded as follows:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #006bb8;">
                <h3 style="color: #006bb8; margin-top: 0;">Your Original Message:</h3>
                <p><strong>Subject:</strong> ${message.subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  ${message.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #28a745; margin-top: 0;">Our Response:</h3>
                <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  ${response.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <p>If you have any further questions or need additional assistance, please don't hesitate to contact us:</p>
              
              <div style="background: #006bb8; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">📞 +94 77 123 4567 (Front Desk)</p>
                <p style="margin: 5px 0 0 0;">📧 info@berghausbungalow.com</p>
              </div>
              
              <p>We look forward to serving you!</p>
              
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
      console.error('Error sending reply email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Response added successfully and sent to guest',
      data: message
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
});

// Get CRM analytics
router.get('/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get basic metrics
    const totalMessages = await ContactMessage.countDocuments();
    const unreadMessages = await ContactMessage.countDocuments({ isRead: false });
    const resolvedMessages = await ContactMessage.countDocuments({ status: 'resolved' });
    const urgentMessages = await ContactMessage.countDocuments({ priority: 'urgent' });

    // Get messages by status
    const messagesByStatus = await ContactMessage.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Get messages by priority
    const messagesByPriority = await ContactMessage.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $project: { priority: '$_id', count: 1, _id: 0 } }
    ]);

    // Get messages by reason
    const messagesByReason = await ContactMessage.aggregate([
      { $group: { _id: '$reasonForContact', count: { $sum: 1 } } },
      { $project: { reason: '$_id', count: 1, _id: 0 } }
    ]);

    // Get daily message counts
    const messagesByDay = await ContactMessage.aggregate([
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
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Calculate average response time (in hours)
    const responseTimeData = await ContactMessage.aggregate([
      {
        $match: {
          respondedAt: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$respondedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const averageResponseTime = responseTimeData.length > 0 ? responseTimeData[0].avgResponseTime : 0;

    // Get response time trend
    const responseTimeTrend = await ContactMessage.aggregate([
      {
        $match: {
          respondedAt: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          avgTime: {
            $avg: {
              $divide: [
                { $subtract: ['$respondedAt', '$createdAt'] },
                1000 * 60 * 60
              ]
            }
          }
        }
      },
      {
        $project: {
          date: '$_id',
          avgTime: { $round: ['$avgTime', 1] },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalMessages,
        unreadMessages,
        resolvedMessages,
        urgentMessages,
        averageResponseTime: Math.round(averageResponseTime * 10) / 10,
        messagesByStatus,
        messagesByPriority,
        messagesByReason,
        messagesByDay,
        responseTimeTrend
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Export contact messages as PDF
router.get('/export/messages/pdf', async (req, res) => {
  try {
    const { status, priority, reason, startDate, endDate } = req.query;
    
    // Build filter query
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (reason && reason !== 'all') filter.reasonForContact = reason;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Get messages
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    
    // Generate HTML report
    const pdfService = new HtmlPdfService();
    const result = pdfService.generateContactMessagesPDF(messages, { status, priority, reason, startDate, endDate });
    
    // Set response headers for HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="contact-messages-${new Date().toISOString().split('T')[0]}.html"`);
    
    // Send HTML
    res.send(result.html);
    
  } catch (error) {
    console.error('Error generating contact messages PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
});

// Export reply history as PDF
router.get('/export/replies/pdf', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Build filter query for messages with replies
    let filter = { response: { $exists: true, $ne: null } };
    if (status && status !== 'all') filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Get messages with replies
    const replies = await ContactMessage.find(filter).sort({ createdAt: -1 });
    
    // Generate HTML report
    const pdfService = new HtmlPdfService();
    const result = pdfService.generateReplyHistoryPDF(replies, { status, startDate, endDate });
    
    // Set response headers for HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="reply-history-${new Date().toISOString().split('T')[0]}.html"`);
    
    // Send HTML
    res.send(result.html);
    
  } catch (error) {
    console.error('Error generating reply history PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
});

// Export CRM analytics as PDF
router.get('/export/analytics/pdf', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get analytics data (reuse the existing analytics logic)
    const totalMessages = await ContactMessage.countDocuments();
    const unreadMessages = await ContactMessage.countDocuments({ isRead: false });
    const resolvedMessages = await ContactMessage.countDocuments({ status: 'resolved' });
    const urgentMessages = await ContactMessage.countDocuments({ priority: 'urgent' });

    const messagesByStatus = await ContactMessage.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    const messagesByPriority = await ContactMessage.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $project: { priority: '$_id', count: 1, _id: 0 } }
    ]);

    const messagesByReason = await ContactMessage.aggregate([
      { $group: { _id: '$reasonForContact', count: { $sum: 1 } } },
      { $project: { reason: '$_id', count: 1, _id: 0 } }
    ]);

    const responseTimeData = await ContactMessage.aggregate([
      {
        $match: {
          respondedAt: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$respondedAt', '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const averageResponseTime = responseTimeData.length > 0 ? responseTimeData[0].avgResponseTime : 0;

    const analytics = {
      totalMessages,
      unreadMessages,
      resolvedMessages,
      urgentMessages,
      averageResponseTime: Math.round(averageResponseTime * 10) / 10,
      messagesByStatus,
      messagesByPriority,
      messagesByReason
    };
    
    // Generate HTML report
    const pdfService = new HtmlPdfService();
    const result = pdfService.generateAnalyticsPDF(analytics, `${days} days`);
    
    // Set response headers for HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="crm-analytics-${new Date().toISOString().split('T')[0]}.html"`);
    
    // Send HTML
    res.send(result.html);
    
  } catch (error) {
    console.error('Error generating analytics PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
});

module.exports = router;
