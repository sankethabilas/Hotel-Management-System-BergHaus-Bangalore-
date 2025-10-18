const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String, // Changed from ObjectId to String to support both ObjectId and string IDs
    required: false
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  intent: {
    type: String,
    enum: ['availability', 'booking', 'faq', 'info', 'greeting', 'fallback', 'error', 'ai_response'],
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatMessageSchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
