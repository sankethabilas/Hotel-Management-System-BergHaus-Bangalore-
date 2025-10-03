import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  mealType: string;
  availableHours: {
    start: string;
    end: string;
  };
  image?: string;
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: string;
  preparationTime: number;
  calories?: number;
  isPopular: boolean;
  discount: number;
  tags: string[];
  createdBy: string;
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    nutFree: boolean;
    dairyFree: boolean;
    halal: boolean;
    kosher: boolean;
  };
  customizationOptions: {
    allowPortionSize: boolean;
    allowModifications: boolean;
    allowSpecialInstructions: boolean;
    commonModifications: string[];
  };
  portionPricing: {
    small: number;
    regular: number;
    large: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    roomNumber?: string;
    specialInstructions?: string;
  };
  items: Array<{
    menuItem: string;
    quantity: number;
    price: number;
    totalPrice: number;
    customization: {
      dietaryRestrictions: string[];
      portionSize: 'small' | 'regular' | 'large';
      modifications: string[];
      specialInstructions: string;
      cookingPreferences: string[];
    };
  }>;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'room-charge';
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Menu API
export const menuAPI = {
  // Get all menu items
  getMenuItems: async (): Promise<{ success: boolean; data: MenuItem[]; message?: string }> => {
    try {
      console.log('Making API request to:', API_BASE_URL + '/menu');
      console.log('Axios instance config:', {
        baseURL: api.defaults.baseURL,
        timeout: api.defaults.timeout,
        headers: api.defaults.headers
      });
      
      const response = await api.get('/menu');
      console.log('API response received:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
        console.error('Request config:', error.config);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  // Get menu item by ID
  getMenuItem: async (id: string): Promise<{ success: boolean; data: MenuItem; message?: string }> => {
    try {
      const response = await api.get(`/menu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  },

  // Create menu item (admin only)
  createMenuItem: async (menuItem: Partial<MenuItem>): Promise<{ success: boolean; data: MenuItem; message?: string }> => {
    try {
      const response = await api.post('/menu', menuItem);
      return response.data;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // Update menu item (admin only)
  updateMenuItem: async (id: string, menuItem: Partial<MenuItem>): Promise<{ success: boolean; data: MenuItem; message?: string }> => {
    try {
      const response = await api.put(`/menu/${id}`, menuItem);
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Delete menu item (admin only)
  deleteMenuItem: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },
};

// Order API
export const orderAPI = {
  // Get all orders
  getOrders: async (): Promise<{ success: boolean; data: Order[]; message?: string }> => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrder: async (id: string): Promise<{ success: boolean; data: Order; message?: string }> => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Create order
  createOrder: async (order: Partial<Order>): Promise<{ success: boolean; data: Order; message?: string }> => {
    try {
      const response = await api.post('/orders', order);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<{ success: boolean; data: Order; message?: string }> => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
};

// Admin API
export const adminAPI = {
  // Login
  login: async (credentials: { username: string; password: string }): Promise<{ success: boolean; data: { token: string; user: any }; message?: string }> => {
    try {
      const response = await api.post('/admin/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Get admin profile
  getProfile: async (): Promise<{ success: boolean; data: any; message?: string }> => {
    try {
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
};

export default api;
