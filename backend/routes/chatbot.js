const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/auth');

/**
 * Chatbot Routes
 * All routes are public (no authentication required)
 */

// Health check
router.get('/health', chatbotController.healthCheck);

// Get all FAQs
router.get('/faqs', chatbotController.getFAQs);

// Create new chat session
router.post('/session', chatbotController.createSession);

// Process user message
router.post('/message', chatbotController.processMessage);

// Get chat history for a session
router.get('/session/:sessionId', chatbotController.getChatHistory);

module.exports = router;
