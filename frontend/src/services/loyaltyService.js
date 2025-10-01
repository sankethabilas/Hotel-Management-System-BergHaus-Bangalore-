import api from './api';

export const loyaltyService = {
  // Get all loyalty members
  getAllMembers: async () => {
    try {
      const response = await api.get('/loyalty');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty members');
    }
  },

  // Get member by ID
  getMemberById: async (id) => {
    try {
      const response = await api.get(`/loyalty/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member');
    }
  },

  // Create new loyalty member
  createMember: async (memberData) => {
    try {
      const response = await api.post('/loyalty', memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create loyalty member');
    }
  },

  // Update loyalty member
  updateMember: async (id, memberData) => {
    try {
      const response = await api.put(`/loyalty/${id}`, memberData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update loyalty member');
    }
  },

  // Delete loyalty member
  deleteMember: async (id) => {
    try {
      const response = await api.delete(`/loyalty/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete loyalty member');
    }
  },

  // Add points to member
  addPoints: async (id, points) => {
    try {
      const response = await api.post(`/loyalty/${id}/points`, { points });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add points');
    }
  },

  // Redeem points
  redeemPoints: async (id, points) => {
    try {
      const response = await api.post(`/loyalty/${id}/redeem`, { points });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to redeem points');
    }
  }
};