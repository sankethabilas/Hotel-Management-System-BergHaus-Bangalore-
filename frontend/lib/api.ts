import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { 
  AuthResponse, 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  LoginCredentials, 
  RegisterData, 
  UpdateUserData, 
  ChangePasswordData,
  UserQueryParams,
  EmailVerificationResponse 
} from '@/types/index';
import { safeJsonParse, getErrorMessage } from './safeJsonParse';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check multiple sources for auth token
    const token = Cookies.get('token') || 
                  (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null) ||
                  (typeof window !== 'undefined' ? localStorage.getItem('staffToken') : null) ||
                  (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
    
    console.log('API Request interceptor - Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response interceptor - Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('API Response interceptor - Error:', error.response?.status, error.config?.url, error.message);
    
    // Handle JSON parsing errors
    if (error.response && error.response.data) {
      try {
        // Try to parse the response data as JSON
        if (typeof error.response.data === 'string') {
          const parsedData = JSON.parse(error.response.data);
          error.response.data = parsedData;
        }
      } catch (parseError) {
        console.warn('Non-JSON error response received:', error.response.data);
        // Convert non-JSON error to a proper error format
        error.response.data = {
          success: false,
          message: error.response.data || 'Server error occurred',
          rawResponse: error.response.data
        };
      }
    }
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - removing token and redirecting');
      // Token expired or invalid
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData: UpdateUserData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordData): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Request email verification code
  requestEmailVerification: async (email: string): Promise<ApiResponse<EmailVerificationResponse>> => {
    const response: AxiosResponse<ApiResponse<EmailVerificationResponse>> = await api.post('/auth/request-email-verification', { email });
    return response.data;
  },

  // Verify email code
  verifyEmailCode: async (payload: { email: string; code: string }): Promise<ApiResponse<EmailVerificationResponse>> => {
    const response: AxiosResponse<ApiResponse<EmailVerificationResponse>> = await api.post('/auth/verify-email-code', payload);
    return response.data;
  },
};

// Users API functions
export const usersAPI = {
  // Get all users (admin only)
  getAllUsers: async (params: UserQueryParams = {}): Promise<PaginatedResponse<User>> => {
    const response: AxiosResponse<PaginatedResponse<User>> = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: UpdateUserData): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Deactivate user (admin only)
  deactivateUser: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put(`/users/${userId}/deactivate`);
    return response.data;
  },

  // Activate user (admin only)
  activateUser: async (userId: string): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put(`/users/${userId}/activate`);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (userId: string, file: File): Promise<ApiResponse<{ user: User }>> => {
    console.log('API uploadProfilePicture called with userId:', userId);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const formData = new FormData();
    formData.append('profileImage', file);
    
    console.log('FormData created, making API call to:', `/users/${userId}/upload`);
    
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.post(`/users/${userId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('API response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API upload error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
};

// Room API functions
export const roomAPI = {
  // Get all rooms
  getAllRooms: async () => {
    try {
      const response = await api.get('/rooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Get room by ID
  getRoomById: async (roomId: string) => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // Upload room image
  uploadRoomImage: async (roomId: string, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`/rooms/${roomId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading room image:', error);
      throw error;
    }
  },

  // Remove room image
  removeRoomImage: async (roomId: string, imageIndex: number) => {
    try {
      const response = await api.delete(`/rooms/${roomId}/images/${imageIndex}`);
      return response.data;
    } catch (error) {
      console.error('Error removing room image:', error);
      throw error;
    }
  },

  // Set primary room image
  setPrimaryRoomImage: async (roomId: string, imageIndex: number) => {
    try {
      const response = await api.put(`/rooms/${roomId}/images/${imageIndex}/set-primary`);
      return response.data;
    } catch (error) {
      console.error('Error setting primary room image:', error);
      throw error;
    }
  },
};

// Availability API functions
export const availabilityAPI = {
  // Check room availability
  checkAvailability: async (params: {
    checkIn: string;
    checkOut: string;
    roomType?: string;
    adults?: number;
    children?: number;
  }): Promise<ApiResponse<{
    checkIn: string;
    checkOut: string;
    nights: number;
    totalGuests: number;
    availableRooms: any[];
    roomsByType: Record<string, any[]>;
    totalAvailable: number;
  }>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/availability', { params });
    return response.data;
  },

  // Get availability calendar data
  getAvailabilityCalendar: async (params: {
    roomType?: string;
    month?: number;
    year?: number;
  }): Promise<ApiResponse<{
    month: number;
    year: number;
    calendarData: Record<string, any>;
    rooms: any[];
  }>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/availability/calendar', { params });
    return response.data;
  },

  // Book a room
  bookRoom: async (bookingData: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guestCount: {
      adults: number;
      children: number;
    };
    specialRequests?: string;
  }): Promise<ApiResponse<{
    reservation: any;
    pricing: {
      nights: number;
      pricePerNight: number;
      subtotal: number;
      tax: number;
      total: number;
    };
  }>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/availability/book', bookingData);
    return response.data;
  },
};

// Booking API functions
export const bookingAPI = {
  // Create a new booking
  createBooking: async (bookingData: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    guestDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      country: string;
      idType: string;
      idNumber: string;
      arrivalTime?: string;
      specialRequests?: string;
    };
    specialRequests?: string;
  }): Promise<ApiResponse<{
    reservation: {
      id: string;
      bookingReference: string;
      checkIn: string;
      checkOut: string;
      roomNumber: string;
      roomType: string;
      totalAmount: number;
      status: string;
      guestDetails: any;
    };
  }>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/booking/create', bookingData);
    return response.data;
  },

  // Get booking details
  getBooking: async (bookingId: string): Promise<ApiResponse<{
    reservation: any;
  }>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/booking/${bookingId}`);
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async (): Promise<ApiResponse<{
    bookings: any[];
    total: number;
  }>> => {
    console.log('Making API call to /booking/user/bookings');
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/booking/user/bookings');
    console.log('API response received:', response.data);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string): Promise<ApiResponse<{
    reservation: {
      id: string;
      status: string;
      bookingReference: string;
    };
  }>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post(`/booking/${bookingId}/cancel`, {
      reason: reason || 'Cancelled by guest'
    });
    return response.data;
  },

  // Update arrival time
  updateArrivalTime: async (bookingId: string, arrivalTime: string): Promise<ApiResponse<{
    booking: any;
  }>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.put(`/booking/${bookingId}/arrival-time`, {
      arrivalTime
    });
    return response.data;
  },

};

// Utility functions
export const setAuthToken = (token: string | null): void => {
  if (token) {
    // Store in Cookies (for backward compatibility)
    Cookies.set('token', token, { 
      expires: 7, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // ALSO store in localStorage for globalFetch to find
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      console.log('✅ Token stored in both Cookies and localStorage');
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Clear from both locations
    Cookies.remove('token', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    delete api.defaults.headers.common['Authorization'];
  }
};

export const removeAuthToken = (): void => {
  Cookies.remove('token', { path: '/' });
  // Also remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
  delete api.defaults.headers.common['Authorization'];
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('token');
};

export default api;
