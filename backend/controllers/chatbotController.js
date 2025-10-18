const chatbotService = require('../services/chatbotService');
const { v4: uuidv4 } = require('uuid');

/**
 * Chatbot Controller
 * Handles HTTP requests for chatbot functionality
 */
class ChatbotController {
  
  /**
   * Process user message
   * POST /api/chatbot/message
   */
  async processMessage(req, res) {
    try {
      const { message, sessionId } = req.body;
      // Get userId from request body (sent by frontend) or from authenticated session
      const userId = req.body.userId || req.user?.id || null;
      
      if (!message || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Message and sessionId are required'
        });
      }
      
      console.log('🤖 Processing message:', message, 'Session:', sessionId);
      console.log('🤖 Chatbase API Key available:', !!process.env.CHATBASE_API_KEY);
      console.log('🤖 Chatbase Chatbot ID available:', !!process.env.CHATBASE_CHATBOT_ID);
      
      // Use AI-powered processing if Chatbase is configured
      const response = process.env.CHATBASE_API_KEY 
        ? await chatbotService.processMessageWithAI(message, sessionId, userId)
        : await chatbotService.processMessage(message, sessionId, userId);
      
      console.log('🤖 Bot response:', response);
      
      res.json({
        success: true,
        data: response
      });
      
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message'
      });
    }
  }
  
  /**
   * Get chat history for a session
   * GET /api/chatbot/session/:sessionId
   */
  async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;
      
      const messages = await chatbotService.getChatHistory(sessionId, parseInt(limit));
      
      res.json({
        success: true,
        data: messages
      });
      
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat history'
      });
    }
  }
  
  /**
   * Get all FAQs
   * GET /api/chatbot/faqs
   */
  async getFAQs(req, res) {
    try {
      const faqs = chatbotService.getFAQs();
      
      res.json({
        success: true,
        data: faqs
      });
      
    } catch (error) {
      console.error('Error getting FAQs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get FAQs'
      });
    }
  }
  
  /**
   * Create new chat session
   * POST /api/chatbot/session
   */
  async createSession(req, res) {
    try {
      const sessionId = uuidv4();
      
      res.json({
        success: true,
        data: {
          sessionId,
          message: 'New chat session created'
        }
      });
      
    } catch (error) {
      console.error('Error creating chat session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create chat session'
      });
    }
  }
  
  /**
   * Health check for chatbot
   * GET /api/chatbot/health
   */
  async healthCheck(req, res) {
    try {
      res.json({
        success: true,
        message: 'Chatbot service is running',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in chatbot health check:', error);
      res.status(500).json({
        success: false,
        message: 'Chatbot service is not responding'
      });
    }
  }
}

module.exports = new ChatbotController();
