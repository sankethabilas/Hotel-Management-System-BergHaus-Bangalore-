import api from './api';

export const dashboardService = {
  /**
   * Get dashboard statistics
   * @param {string} timeframe - Time period: '7d', '30d', '90d', '1y'
   * @returns {Promise} Dashboard data
   */
  async getDashboardStats(timeframe = '30d') {
    try {
      const response = await api.get(`/dashboard/stats?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch dashboard statistics'
      );
    }
  }
};

export default dashboardService;
