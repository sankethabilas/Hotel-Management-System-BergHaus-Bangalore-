import api from './api';

export const loyaltyService = {
  // Get all loyalty members
  getAllMembers: async () => {
    try {
      const response = await api.get('/loyalty/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty members');
    }
  },

  // Get member by guestId (email)
  getMemberByGuestId: async (guestId) => {
    try {
      const response = await api.get(`/loyalty?guestId=${guestId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member');
    }
  },

  // Enroll guest in loyalty program
  enrollGuest: async (userId, initialPoints = 0) => {
    try {
      const response = await api.post('/loyalty', { userId, initialPoints });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enroll guest');
    }
  },

  // Add or subtract points
  updatePoints: async (guestId, points) => {
    try {
      const response = await api.put('/loyalty', { guestId, points });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update points');
    }
  },

  // Delete loyalty member
  deleteMember: async (guestId) => {
    try {
      const response = await api.delete(`/loyalty/${guestId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete loyalty member');
    }
  },

  // Get all users with role=guest
  getAvailableGuests: async () => {
    try {
      const response = await api.get('/users?role=guest');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch guests');
    }
  }
};