const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const ChatMessage = require('../models/ChatMessage');
const { extractDates, extractRoomType, extractGuestCount } = require('../utils/dateParser');
const faqs = require('../data/faqs');
const templates = require('../utils/chatbotTemplates');
const chatbaseService = require('./chatbaseService');

class ChatbotService {
  
  /**
   * Detect user intent from message
   */
  detectIntent(message) {
    const messageLower = message.toLowerCase();
    
    // Check for availability keywords
    const availabilityKeywords = ['available', 'availability', 'check', 'rooms', 'dates', 'booked'];
    if (availabilityKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'availability';
    }
    
    // Check for booking keywords
    const bookingKeywords = ['book', 'reserve', 'reservation', 'booking', 'stay', 'room'];
    if (bookingKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'booking';
    }
    
    // Check for FAQ keywords
    const faqKeywords = ['check-in', 'check-out', 'time', 'policy', 'wifi', 'parking', 'amenities', 'cancellation', 'pets', 'payment', 'restaurant'];
    if (faqKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'faq';
    }
    
    // Check for general info keywords
    const infoKeywords = ['location', 'address', 'contact', 'phone', 'email', 'where', 'hours'];
    if (infoKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'info';
    }
    
    // Check for greeting
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    if (greetingKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'greeting';
    }
    
    return 'fallback';
  }
  
  /**
   * Get FAQ answer based on message
   */
  getFAQAnswer(message) {
    const messageLower = message.toLowerCase();
    
    for (const faq of faqs) {
      for (const keyword of faq.keywords) {
        if (messageLower.includes(keyword)) {
          return {
            question: faq.question,
            answer: faq.answer
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Check room availability
   */
  async checkAvailability(message) {
    try {
      const dates = extractDates(message);
      const roomType = extractRoomType(message);
      
      if (!dates || dates.length === 0) {
        return {
          intent: 'availability',
          message: templates.availability.noDates,
          quickReplies: [
            'Check availability for next week',
            'Check availability for this weekend',
            'What dates are you looking for?'
          ]
        };
      }
      
      const dateRange = dates.find(d => d.type === 'range');
      if (!dateRange) {
        return {
          intent: 'availability',
          message: templates.availability.noDates,
          quickReplies: [
            'Check availability for next week',
            'Check availability for this weekend'
          ]
        };
      }
      
      const { checkIn, checkOut } = dateRange;
      
      // Build query for available rooms
      const query = {};
      if (roomType) {
        query.roomType = new RegExp(roomType, 'i');
      }
      
      // Get all rooms of the requested type
      const allRooms = await Room.find(query);
      
      // Check for conflicting reservations
      const conflictingReservations = await Reservation.find({
        $or: [
          {
            checkInDate: { $lt: checkOut },
            checkOutDate: { $gt: checkIn }
          }
        ],
        status: { $nin: ['cancelled', 'checked-out'] }
      });
      
      const bookedRoomIds = conflictingReservations.map(res => res.rooms.map(room => room.roomId)).flat();
      
      // Filter available rooms
      const availableRooms = allRooms.filter(room => !bookedRoomIds.includes(room._id));
      
      if (availableRooms.length === 0) {
        return {
          intent: 'availability',
          message: templates.availability.notFound,
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          quickReplies: [
            'Check different dates',
            'Check different room type',
            'Contact front desk'
          ]
        };
      }
      
      return {
        intent: 'availability',
        message: templates.availability.found.replace('{count}', availableRooms.length),
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        rooms: availableRooms.slice(0, 5).map(room => ({
          id: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          price: room.pricePerNight,
          amenities: room.amenities || [],
          available: true
        })),
        quickReplies: [
          'Book this room',
          'Check different dates',
          'View all rooms'
        ]
      };
      
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        intent: 'availability',
        message: templates.availability.error,
        quickReplies: [
          'Try again',
          'Contact front desk',
          'Check different dates'
        ]
      };
    }
  }
  
  /**
   * Handle booking request
   */
  async handleBooking(message, sessionId) {
    try {
      const dates = extractDates(message);
      const roomType = extractRoomType(message);
      const guestCount = extractGuestCount(message);
      
      if (!dates || dates.length === 0) {
        return {
          intent: 'booking',
          message: "I'd be happy to help you make a booking! Please tell me your check-in and check-out dates.",
          quickReplies: [
            'Book for next week',
            'Book for this weekend',
            'What dates do you need?'
          ]
        };
      }
      
      const dateRange = dates.find(d => d.type === 'range');
      if (!dateRange) {
        return {
          intent: 'booking',
          message: "Please provide both check-in and check-out dates for your booking.",
          quickReplies: [
            'Book for next week',
            'Book for this weekend'
          ]
        };
      }
      
      // Check availability first
      const availability = await this.checkAvailability(message);
      if (availability.rooms && availability.rooms.length === 0) {
        return {
          intent: 'booking',
          message: "I'm sorry, but no rooms are available for those dates. Would you like me to suggest alternative dates?",
          quickReplies: [
            'Check different dates',
            'Check different room type',
            'Contact front desk'
          ]
        };
      }
      
      return {
        intent: 'booking',
        message: "Great! I found available rooms for your dates. To complete your booking, I'll need some additional information:",
        checkIn: dateRange.checkIn.toISOString().split('T')[0],
        checkOut: dateRange.checkOut.toISOString().split('T')[0],
        roomType: roomType,
        guestCount: guestCount,
        rooms: availability.rooms,
        requiresInfo: true,
        quickReplies: [
          'Provide my details',
          'Check different dates',
          'Contact front desk'
        ]
      };
      
    } catch (error) {
      console.error('Error handling booking:', error);
      return {
        intent: 'booking',
        message: templates.booking.error,
        quickReplies: [
          'Try again',
          'Contact front desk'
        ]
      };
    }
  }
  
  /**
   * Get hotel information
   */
  getHotelInfo(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('location') || messageLower.includes('address') || messageLower.includes('where')) {
      return {
        intent: 'info',
        message: templates.info.location,
        quickReplies: [
          'Contact information',
          'Operating hours',
          'Check availability'
        ]
      };
    }
    
    if (messageLower.includes('contact') || messageLower.includes('phone') || messageLower.includes('email')) {
      return {
        intent: 'info',
        message: templates.info.contact,
        quickReplies: [
          'Location information',
          'Operating hours',
          'Make a booking'
        ]
      };
    }
    
    if (messageLower.includes('hours') || messageLower.includes('time') || messageLower.includes('operating')) {
      return {
        intent: 'info',
        message: templates.info.hours,
        quickReplies: [
          'Contact information',
          'Location information',
          'Check availability'
        ]
      };
    }
    
    if (messageLower.includes('price') || messageLower.includes('rate') || messageLower.includes('cost')) {
      return {
        intent: 'info',
        message: templates.info.rates,
        quickReplies: [
          'Check availability',
          'Make a booking',
          'Contact information'
        ]
      };
    }
    
    if (messageLower.includes('amenities') || messageLower.includes('facilities') || messageLower.includes('services')) {
      return {
        intent: 'info',
        message: templates.info.amenities,
        quickReplies: [
          'Check availability',
          'Make a booking',
          'Contact information'
        ]
      };
    }
    
    if (messageLower.includes('activities') || messageLower.includes('things to do') || messageLower.includes('tours')) {
      return {
        intent: 'info',
        message: templates.info.activities,
        quickReplies: [
          'Check availability',
          'Make a booking',
          'Contact information'
        ]
      };
    }
    
    return {
      intent: 'info',
      message: "I can provide information about our location, contact details, operating hours, rates, amenities, and activities. What would you like to know?",
      quickReplies: [
        'Location information',
        'Contact information',
        'Operating hours',
        'Room rates',
        'Amenities',
        'Activities',
        'Check availability'
      ]
    };
  }
  
  /**
   * Get user context for personalized responses
   */
  async getUserContext(userId) {
    if (!userId) return null;
    
    try {
      const User = require('../models/User');
      const user = await User.findById(userId).select('firstName lastName email phone role preferences');
      
      if (!user) return null;
      
      // Get user's booking history
      const bookings = await Reservation.find({ guestId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('rooms.roomId', 'roomType roomNumber');
      
      return {
        user,
        recentBookings: bookings,
        isReturningGuest: bookings.length > 0,
        preferredRoomTypes: this.extractPreferredRoomTypes(bookings),
        lastVisit: bookings.length > 0 ? bookings[0].checkInDate : null
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Extract preferred room types from booking history
   */
  extractPreferredRoomTypes(bookings) {
    const roomTypeCounts = {};
    bookings.forEach(booking => {
      booking.rooms.forEach(room => {
        const roomType = room.roomId?.roomType;
        if (roomType) {
          roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1;
        }
      });
    });
    
    return Object.keys(roomTypeCounts).sort((a, b) => roomTypeCounts[b] - roomTypeCounts[a]);
  }

  /**
   * Handle personalized greeting based on user context
   */
  async handlePersonalizedGreeting(userContext, userId) {
    if (!userContext) {
      return {
        intent: 'greeting',
        message: templates.greetings[Math.floor(Math.random() * templates.greetings.length)],
        quickReplies: [
          'Check room availability',
          'Make a booking',
          'View FAQs',
          'Contact information'
        ]
      };
    }

    const { user, isReturningGuest, lastVisit } = userContext;
    const firstName = user.firstName || 'Guest';
    
    let message;
    if (isReturningGuest) {
      const lastVisitDate = new Date(lastVisit).toLocaleDateString();
      message = `Welcome back, ${firstName}! It's great to see you again. Your last stay was on ${lastVisitDate}. How can I assist you today?`;
    } else {
      message = `Hello ${firstName}! Welcome to Berghaus Bungalow. I'm here to help make your stay exceptional. What can I do for you?`;
    }

    return {
      intent: 'greeting',
      message,
      quickReplies: [
        'Check room availability',
        'Make a booking',
        'View my bookings',
        'Hotel information'
      ]
    };
  }

  /**
   * Add personalized recommendations to availability response
   */
  async addPersonalizedRecommendations(response, userContext) {
    if (!userContext.preferredRoomTypes.length) return response;

    const preferredType = userContext.preferredRoomTypes[0];
    response.message += `\n\n💡 Based on your booking history, I notice you often prefer ${preferredType} rooms. Would you like me to show you available ${preferredType} rooms specifically?`;
    
    response.quickReplies = [
      `Show ${preferredType} rooms`,
      'Show all room types',
      'Make a booking',
      'View my bookings'
    ];

    return response;
  }

  /**
   * Add user-specific booking context
   */
  async addUserBookingContext(response, userContext) {
    const { user, recentBookings } = userContext;
    
    if (recentBookings.length > 0) {
      const lastBooking = recentBookings[0];
      response.message += `\n\n📋 I see you stayed with us recently (${new Date(lastBooking.checkInDate).toLocaleDateString()}). Would you like to book a similar room or try something different?`;
    }

    response.quickReplies = [
      'Book similar room',
      'Try different room type',
      'View my booking history',
      'Contact front desk'
    ];

    return response;
  }

  /**
   * Add user-specific information
   */
  async addUserSpecificInfo(response, userContext) {
    const { user, isReturningGuest } = userContext;
    
    if (isReturningGuest) {
      response.message += `\n\n👋 Welcome back, ${user.firstName}! As a returning guest, you're eligible for our loyalty benefits. Would you like to know more about our special offers?`;
    }

    return response;
  }

  /**
   * Get personalized quick replies based on user context
   */
  getPersonalizedQuickReplies(userContext, type) {
    if (!userContext) {
      return [
        'Check room availability',
        'Make a booking',
        'View FAQs',
        'Contact information'
      ];
    }

    const { isReturningGuest } = userContext;
    
    switch (type) {
      case 'faq':
        return isReturningGuest ? [
          'Check room availability',
          'View my bookings',
          'Make a booking',
          'Contact information'
        ] : [
          'Check room availability',
          'Make a booking',
          'View FAQs',
          'Contact information'
        ];
      
      case 'fallback':
        return isReturningGuest ? [
          'View my bookings',
          'Check room availability',
          'Make a booking',
          'Contact front desk'
        ] : [
          'Check room availability',
          'Make a booking',
          'View FAQs',
          'Contact front desk'
        ];
      
      default:
        return [
          'Check room availability',
          'Make a booking',
          'View FAQs',
          'Contact information'
        ];
    }
  }

  /**
   * Process message with AI (Chatbase) for complex queries
   */
  async processMessageWithAI(message, sessionId, userId = null) {
    try {
      // First, try to detect simple intents (greeting, FAQ, etc.)
      const intent = this.detectIntent(message);
      
      // Handle simple intents with existing logic
      if (intent === 'greeting' || intent === 'faq') {
        return this.processMessage(message, sessionId, userId);
      }
      
      // For complex queries, use Chatbase AI
      const chatbaseResponse = await chatbaseService.sendMessage(
        message,
        sessionId,
        userId
      );
      
      if (chatbaseResponse.success) {
        // Save messages to database
        await ChatMessage.create({
          sessionId,
          userId,
          message,
          sender: 'user',
          timestamp: new Date()
        });
        
        await ChatMessage.create({
          sessionId,
          userId,
          message: chatbaseResponse.message,
          sender: 'bot',
          intent: 'ai_response',
          timestamp: new Date()
        });
        
        return {
          intent: 'ai_response',
          message: chatbaseResponse.message,
          quickReplies: [
            'Check room availability',
            'Make a booking',
            'Contact information'
          ]
        };
      } else {
        // Fallback to existing logic if Chatbase fails
        return this.processMessage(message, sessionId, userId);
      }
    } catch (error) {
      console.error('Error in AI processing:', error);
      // Fallback to existing logic
      return this.processMessage(message, sessionId, userId);
    }
  }

  /**
   * Process user message and generate response
   */
  async processMessage(message, sessionId, userId = null) {
    try {
      // Save user message
      await ChatMessage.create({
        sessionId,
        userId,
        message,
        sender: 'user',
        timestamp: new Date()
      });
      
      const intent = this.detectIntent(message);
      let response;
      
      // Get user context for personalized responses
      const userContext = await this.getUserContext(userId);
      
      switch (intent) {
        case 'greeting':
          response = await this.handlePersonalizedGreeting(userContext, userId);
          break;
          
        case 'faq':
          const faqAnswer = this.getFAQAnswer(message);
          if (faqAnswer) {
            response = {
              intent: 'faq',
              question: faqAnswer.question,
              answer: faqAnswer.answer,
              quickReplies: this.getPersonalizedQuickReplies(userContext, 'faq')
            };
          } else {
            response = {
              intent: 'faq',
              message: templates.faq.notFound,
              quickReplies: this.getPersonalizedQuickReplies(userContext, 'fallback')
            };
          }
          break;
          
        case 'availability':
          response = await this.checkAvailability(message);
          // Add personalized recommendations if user is authenticated
          if (userContext) {
            response = await this.addPersonalizedRecommendations(response, userContext);
          }
          break;
          
        case 'booking':
          response = await this.handleBooking(message, sessionId);
          // Add user-specific booking assistance
          if (userContext) {
            response = await this.addUserBookingContext(response, userContext);
          }
          break;
          
        case 'info':
          response = this.getHotelInfo(message);
          // Add user-specific information
          if (userContext) {
            response = await this.addUserSpecificInfo(response, userContext);
          }
          break;
          
        default:
          response = {
            intent: 'fallback',
            message: templates.fallback[Math.floor(Math.random() * templates.fallback.length)],
            quickReplies: this.getPersonalizedQuickReplies(userContext, 'fallback')
          };
      }
      
      // Save bot response
      await ChatMessage.create({
        sessionId,
        userId,
        message: response.message,
        sender: 'bot',
        intent: response.intent,
        metadata: response,
        timestamp: new Date()
      });
      
      return response;
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Save error response
      await ChatMessage.create({
        sessionId,
        userId,
        message: templates.errors.general,
        sender: 'bot',
        intent: 'error',
        timestamp: new Date()
      });
      
      return {
        intent: 'error',
        message: templates.errors.general,
        quickReplies: [
          'Try again',
          'Contact front desk'
        ]
      };
    }
  }
  
  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId, limit = 50) {
    try {
      const messages = await ChatMessage.find({ sessionId })
        .sort({ timestamp: 1 })
        .limit(limit);
      
      return messages;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }
  
  /**
   * Get all FAQs
   */
  getFAQs() {
    return faqs;
  }
}

module.exports = new ChatbotService();
