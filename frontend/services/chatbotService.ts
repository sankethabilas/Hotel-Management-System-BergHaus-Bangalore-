const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ChatMessage {
  _id?: string;
  sessionId: string;
  userId?: string;
  message: string;
  sender: 'user' | 'bot';
  intent?: string;
  metadata?: any;
  timestamp: string;
}

export interface BotResponse {
  intent: string;
  message: string;
  question?: string;
  answer?: string;
  checkIn?: string;
  checkOut?: string;
  roomType?: string;
  guestCount?: number;
  rooms?: Array<{
    id: string;
    roomNumber: string;
    roomType: string;
    price: number;
    amenities: string[];
    available: boolean;
  }>;
  requiresInfo?: boolean;
  quickReplies?: string[];
}

export interface FAQ {
  question: string;
  keywords: string[];
  answer: string;
}

class ChatbotService {
  private getSessionId(): string {
    if (typeof window === 'undefined') {
      return '';
    }
    
    let sessionId = localStorage.getItem('chatbot_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('chatbot_session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * Send message to chatbot
   */
  async sendMessage(message: string, userId?: string): Promise<{
    success: boolean;
    data: BotResponse;
  }> {
    const sessionId = this.getSessionId();
    
    // Get user ID from localStorage if not provided
    const currentUserId = userId || this.getCurrentUserId();
    
    const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        userId: currentUserId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get current user ID from localStorage
   */
  private getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user._id || null;
      }
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
    }
    return null;
  }

  /**
   * Get chat history for current session
   */
  async getChatHistory(limit: number = 50): Promise<{
    success: boolean;
    data: ChatMessage[];
  }> {
    const sessionId = this.getSessionId();
    
    const response = await fetch(`${API_BASE_URL}/chatbot/session/${sessionId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all FAQs
   */
  async getFAQs(): Promise<{
    success: boolean;
    data: FAQ[];
  }> {
    const response = await fetch(`${API_BASE_URL}/chatbot/faqs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create new chat session
   */
  async createSession(): Promise<{
    success: boolean;
    data: {
      sessionId: string;
      message: string;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/chatbot/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Update localStorage with new session ID
    if (result.success && result.data.sessionId) {
      localStorage.setItem('chatbot_session_id', result.data.sessionId);
    }
    
    return result;
  }

  /**
   * Check chatbot health
   */
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/chatbot/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatbot_session_id');
    }
  }
}

export const chatbotService = new ChatbotService();
