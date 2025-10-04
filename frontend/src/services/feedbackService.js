import api from './api';

export const feedbackService = {
  // Get all feedback
  getAllFeedback: async () => {
    try {
      const response = await api.get('/feedback');
      return response.data;
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
      const response = await api.post(`/feedback/${id}/response`, responseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to respond to feedback');
    }
  }
};