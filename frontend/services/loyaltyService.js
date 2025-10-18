import api from './api';

export const loyaltyService = {
  // Get all loyalty members
  getAllMembers: async () => {
    try {
      const response = await api.get('/loyalty/members');
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty members');
    }
  },

  // Get member by guestId
  getMemberByGuestId: async (guestId) => {
    try {
      const response = await api.get(`/loyalty/details/${guestId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member');
    }
  },

  // Enroll guest in loyalty program
  enrollGuest: async (userId, initialPoints = 0) => {
    try {
      const response = await api.post('/loyalty/enroll', { userId, initialPoints });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to enroll guest');
    }
  },

  // Add or subtract points
  updatePoints: async (guestId, points) => {
    try {
      const response = await api.post('/loyalty/add-points', { guestId, points });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update points');
    }
  },

  // Delete loyalty member
  deleteMember: async (guestId) => {
    try {
      const response = await api.delete(`/loyalty/member/${guestId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete loyalty member');
    }
  },

  // Get all users with role=guest
  getAvailableGuests: async () => {
    try {
      const response = await api.get('/users?role=guest');
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch guests');
    }
  },

  // Get transaction history with filters
  getTransactionHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.guestId) params.append('guestId', filters.guestId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/loyalty/transactions/history?${params.toString()}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  },

  // Get member's transaction history
  getMemberTransactions: async (guestId, limit = 10) => {
    try {
      const response = await api.get(`/loyalty/transactions/member/${guestId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member transactions');
    }
  },

  // Get points statistics
  getPointsStats: async () => {
    try {
      const response = await api.get('/loyalty/points/stats');
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch points statistics');
    }
  },

  // Redeem reward (with stock management)
  redeemReward: async (guestId, rewardId) => {
    try {
      const response = await api.post('/loyalty/redeem-reward', { guestId, rewardId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to redeem reward');
    }
  }
};

export default loyaltyService;