import api from './api';

interface TransactionFilters {
  guestId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  limit?: string;
}

interface RedeemRewardResult {
  success: boolean;
  message: string;
  loyalty: {
    points: number;
    tier: string;
    pointsDeducted: number;
    previousPoints: number;
  };
  reward?: {
    id: string;
    name: string;
    stockRemaining: number | null;
  };
}

export const loyaltyService = {
  // Get all loyalty members
  getAllMembers: async (): Promise<any> => {
    try {
      const response = await api.get('/loyalty/members');
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loyalty members');
    }
  },

  // Get member by guestId
  getMemberByGuestId: async (guestId: string): Promise<any> => {
    try {
      const response = await api.get(`/loyalty/details/${guestId}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member');
    }
  },

  // Enroll guest in loyalty program
  enrollGuest: async (userId: string, initialPoints: number = 0): Promise<any> => {
    try {
      const response = await api.post('/loyalty/enroll', { userId, initialPoints });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enroll guest');
    }
  },

  // Add or subtract points
  updatePoints: async (guestId: string, points: number): Promise<any> => {
    try {
      const response = await api.post('/loyalty/add-points', { guestId, points });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update points');
    }
  },

  // Delete loyalty member
  deleteMember: async (guestId: string): Promise<any> => {
    try {
      const response = await api.delete(`/loyalty/member/${guestId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete loyalty member');
    }
  },

  // Get all users with role=guest
  getAvailableGuests: async (): Promise<any> => {
    try {
      const response = await api.get('/users?role=guest');
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch guests');
    }
  },

  // Get transaction history with filters
  getTransactionHistory: async (filters: TransactionFilters = {}): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (filters.guestId) params.append('guestId', filters.guestId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/loyalty/transactions/history?${params.toString()}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  },

  // Get member's transaction history
  getMemberTransactions: async (guestId: string, limit: number = 10): Promise<any> => {
    try {
      const response = await api.get(`/loyalty/transactions/member/${guestId}?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member transactions');
    }
  },

  // Get points statistics
  getPointsStats: async (): Promise<any> => {
    try {
      const response = await api.get('/loyalty/points/stats');
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch points statistics');
    }
  },

  // Redeem reward (with stock management)
  redeemReward: async (guestId: string, rewardId: string): Promise<RedeemRewardResult> => {
    try {
      console.log('🎯 Attempting to redeem reward:', { guestId, rewardId });
      const response = await api.post('/loyalty/redeem-reward', { guestId, rewardId });
      console.log('✅ Redemption API response:', response);
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      console.log('✅ Response data type:', typeof response.data);
      console.log('✅ Response data keys:', response.data ? Object.keys(response.data) : 'null');
      return response.data;
    } catch (error: any) {
      console.error('❌ Redemption failed - Full error object:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response headers:', error.response?.headers);
      console.error('❌ Error request:', error.request);
      console.error('❌ Error config:', error.config);
      
      // Provide detailed error message
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to redeem reward';
      
      console.error('❌ Final error message to throw:', errorMessage);
      
      // If it's a 500 error, add more context
      if (error.response?.status === 500) {
        throw new Error(`Server Error: ${errorMessage}. Backend error: ${error.response?.data?.error || 'Unknown'}`);
      }
      
      throw new Error(errorMessage);
    }
  }
};

export default loyaltyService;