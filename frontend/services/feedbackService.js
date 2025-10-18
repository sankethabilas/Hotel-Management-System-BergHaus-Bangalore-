import api from './api';

export const feedbackService = {
  // Get all feedback
  getAllFeedback: async () => {
    try {
      const response = await api.get('/feedback/all');
      // Backend returns { success: true, data: { feedback: [...], pagination: {...} } }
      const feedbackArray = response.data?.data?.feedback || [];
      
      // Transform backend data to match frontend expectations
      return feedbackArray.map(fb => {
        // Calculate average rating from nested rating object
        let avgRating = 0;
        if (fb.rating && typeof fb.rating === 'object') {
          const ratings = [
            fb.rating.checkIn,
            fb.rating.roomQuality,
            fb.rating.cleanliness,
            fb.rating.dining,
            fb.rating.amenities
          ].filter(r => r != null);
          avgRating = ratings.length > 0 
            ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
            : 0;
        } else if (typeof fb.rating === 'number') {
          avgRating = fb.rating;
        }
        
        return {
          ...fb,
          rating: avgRating, // Add calculated average rating
          guestName: fb.guestId?.fullName || fb.name || 'Unknown Guest',
          email: fb.guestId?.email || fb.email || 'no-email@example.com'
        };
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch feedback');
    }
  },

  // Get feedback by ID
  getFeedbackById: async (id) => {
    try {
      const response = await api.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch feedback');
    }
  },

  // Create new feedback
  createFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create feedback');
    }
  },

  // Update feedback
  updateFeedback: async (id, feedbackData) => {
    try {
      const response = await api.put(`/feedback/${id}`, feedbackData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update feedback');
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      const response = await api.delete(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete feedback');
    }
  },

  // Respond to feedback
  respondToFeedback: async (id, responseData) => {
    try {
      const response = await api.patch(`/feedback/${id}/response`, responseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to respond to feedback');
    }
  },

  // Add response to feedback (alias for respondToFeedback)
  addResponse: async (id, responseData) => {
    try {
      const response = await api.patch(`/feedback/${id}/response`, responseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add response');
    }
  }
};

export default feedbackService;