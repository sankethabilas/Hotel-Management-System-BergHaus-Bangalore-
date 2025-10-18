const axios = require('axios');

class ChatbaseService {
  constructor() {
    this.apiKey = process.env.CHATBASE_API_KEY;
    this.chatbotId = process.env.CHATBASE_CHATBOT_ID;
    this.apiUrl = 'https://www.chatbase.co/api/v1/chat';
  }

  async sendMessage(message, conversationId, userId = null) {
    try {
      const response = await axios.post(this.apiUrl, {
        messages: [{ content: message, role: 'user' }],
        chatbotId: this.chatbotId,
        conversationId: conversationId,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: response.data.text,
        conversationId: response.data.conversationId
      };
    } catch (error) {
      console.error('Chatbase API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ChatbaseService();
