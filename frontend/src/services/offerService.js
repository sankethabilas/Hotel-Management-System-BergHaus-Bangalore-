import api from './api';

export const offerService = {
  // Get all offers
  getAllOffers: async () => {
    try {
      const response = await api.get('/offers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch offers');
    }
  },

  // Get offer by ID
  getOfferById: async (id) => {
    try {
      const response = await api.get(`/offers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch offer');
    }
  },

  // Create new offer
  createOffer: async (offerData) => {
    try {
      const response = await api.post('/offers', offerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create offer');
    }
  },

  // Update offer
  updateOffer: async (id, offerData) => {
    try {
      const response = await api.put(`/offers/${id}`, offerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update offer');
    }
  },

  // Delete offer
  deleteOffer: async (id) => {
    try {
      const response = await api.delete(`/offers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete offer');
    }
  },

  // Assign offer to guest
  assignOfferToGuest: async (offerId, guestId) => {
    try {
      const response = await api.post(`/offers/${offerId}/assign`, { guestId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign offer');
    }
  }
};