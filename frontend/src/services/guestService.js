import api from './api';

export const guestService = {
  // Get all guests with history summary
  getAllGuestsHistory: async () => {
    try {
      const response = await api.get('/guests/history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch guests history');
    }
  },

  // Get detailed history for a specific guest
  getGuestHistory: async (guestId) => {
    try {
      const response = await api.get(`/guests/history/${guestId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch guest history');
    }
  },

  // Get bookings for a specific guest
  getGuestBookings: async (guestId) => {
    try {
      const response = await api.get(`/bookings/guest/${guestId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch guest bookings');
    }
  }
};
