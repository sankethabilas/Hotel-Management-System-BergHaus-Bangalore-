const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Reservation {
  _id: string;
  reservationId: string;
  guestId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  rooms: Array<{
    roomId: string;
    roomNumber: string;
    roomType: string;
  }>;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  guestCount: {
    adults: number;
    children: number;
  };
  specialRequests?: string;
  cancellationReason?: string;
  paymentMethod?: 'bank_transfer' | 'cash_on_property';
  paidAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationStats {
  totalReservations: number;
  totalRevenue: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  paidReservations: number;
  upcomingCheckIns: number;
  ongoingStays: number;
  checkedOutGuests: number;
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  roomType?: string;
  search?: string;
  createdBy?: string;
}

export interface ReservationAnalytics {
  bookings: Array<{
    _id: string;
    bookings: number;
    revenue: number;
    cancellations: number;
  }>;
  period: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

class ReservationService {
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') {
      return {};
    }
    
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Get all reservations with filters
   */
  async getAllReservations(filters: ReservationFilters = {}): Promise<{
    success: boolean;
    data: {
      reservations: Reservation[];
      total: number;
      page: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/reservations?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get reservation statistics
   */
  async getReservationStats(): Promise<{
    success: boolean;
    data: ReservationStats;
  }> {
    const response = await fetch(`${API_BASE_URL}/reservations/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id: string): Promise<{
    success: boolean;
    data: Reservation;
  }> {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create new reservation
   */
  async createReservation(data: Partial<Reservation>): Promise<{
    success: boolean;
    data: Reservation;
    message: string;
  }> {
    // Use the frontdesk manual reservation endpoint for manual reservations
    const response = await fetch(`${API_BASE_URL}/frontdesk/create-reservation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update reservation
   */
  async updateReservation(id: string, data: Partial<Reservation>): Promise<{
    success: boolean;
    data: Reservation;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(id: string, reason: string): Promise<{
    success: boolean;
    data: Reservation;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete reservation
   */
  async deleteReservation(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get reservation analytics
   */
  async getAnalytics(options: {
    period?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    success: boolean;
    data: ReservationAnalytics;
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/reservations/analytics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check room availability
   */
  async checkRoomAvailability(roomId: string, checkIn: string, checkOut: string): Promise<{
    success: boolean;
    data: {
      available: boolean;
      conflictingReservations?: any[];
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/reservations/rooms/availability`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const reservationService = new ReservationService();
