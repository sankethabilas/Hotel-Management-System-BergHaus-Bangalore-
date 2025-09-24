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
  UserQueryParams 
} from '@/types';

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
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
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
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.post(`/users/${userId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
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
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/booking/user/bookings');
    return response.data;
  },
};

// Utility functions
export const setAuthToken = (token: string | null): void => {
  if (token) {
    Cookies.set('token', token, { 
      expires: 7, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    Cookies.remove('token', { path: '/' });
    delete api.defaults.headers.common['Authorization'];
  }
};

export const removeAuthToken = (): void => {
  Cookies.remove('token', { path: '/' });
  delete api.defaults.headers.common['Authorization'];
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('token');
};

export default api;
