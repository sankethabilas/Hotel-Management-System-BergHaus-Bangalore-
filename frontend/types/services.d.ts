// Type declarations for JavaScript service files

declare module '@/services/dashboardService' {
  interface DashboardService {
    getDashboardStats(timeframe?: string): Promise<any>;
  }
  const dashboardService: DashboardService;
  export default dashboardService;
}

declare module '@/services/api' {
  import { AxiosInstance } from 'axios';
  const api: AxiosInstance;
  export default api;
}

declare module '@/services/analyticsService' {
  interface AnalyticsService {
    getFeedbackAnalytics(timeframe?: string): Promise<any>;
  }
  const analyticsService: AnalyticsService;
  export default analyticsService;
}

declare module '@/services/feedbackService' {
  interface FeedbackService {
    getAllFeedback(): Promise<any>;
    createFeedback(data: any): Promise<any>;
    addResponse(id: string, response: string | { response: string }): Promise<any>;
    respondToFeedback(id: string, response: string | { response: string }): Promise<any>;
    deleteFeedback(id: string): Promise<any>;
  }
  const feedbackService: FeedbackService;
  export default feedbackService;
}

declare module '@/services/guestService' {
  interface GuestService {
    getAllGuestsHistory(): Promise<any>;
    getGuestHistory(guestId: string): Promise<any>;
  }
  const guestService: GuestService;
  export default guestService;
}

declare module '@/services/loyaltyService' {
  interface LoyaltyService {
    getAllMembers(): Promise<any>;
    getMemberByGuestId(guestId: string): Promise<any>;
    enrollGuest(userId: string, initialPoints?: number): Promise<any>;
    updatePoints(guestId: string, points: number): Promise<any>;
    deleteMember(guestId: string): Promise<any>;
    getAvailableGuests(): Promise<any>;
  }
  const loyaltyService: LoyaltyService;
  export default loyaltyService;
}

declare module '@/services/notificationService' {
  interface NotificationService {
    getNotifications(page?: number, limit?: number, unreadOnly?: boolean): Promise<any>;
    getUnreadCount(): Promise<number>;
    getAllNotifications(params?: any): Promise<any>;
    markAsRead(id: string, isRead: boolean): Promise<any>;
    markAllAsRead(): Promise<any>;
    deleteNotification(id: string): Promise<any>;
    deleteAllRead(): Promise<any>;
    checkPendingFeedback(): Promise<any>;
  }
  const notificationService: NotificationService;
  export default notificationService;
}

declare module '@/services/offerService' {
  interface OfferService {
    getAllOffers(): Promise<any>;
    getOfferById(id: string): Promise<any>;
    createOffer(offerData: any): Promise<any>;
    updateOffer(id: string, offerData: any): Promise<any>;
    deleteOffer(id: string): Promise<any>;
    assignOfferToGuest(guestId: string, offerId: string): Promise<any>;
    unassignOfferFromGuest(guestId: string, offerId: string): Promise<any>;
  }
  const offerService: OfferService;
  export { offerService };
  export default offerService;
}
