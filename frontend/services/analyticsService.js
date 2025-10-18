import api from './api';

export const analyticsService = {
  /**
   * Get feedback analytics data
   * @param {string} timeframe - Time period: '1m', '3m', '6m', '1y', 'all'
   * @returns {Promise} Analytics data
   */
  async getFeedbackAnalytics(timeframe = '1m') {
    try {
      const response = await api.get(`/analytics/feedback?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch analytics data'
      );
    }
  }
};

export default analyticsService;
