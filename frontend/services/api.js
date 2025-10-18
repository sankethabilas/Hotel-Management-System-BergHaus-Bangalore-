import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available - check multiple token keys
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('adminToken') || 
                  localStorage.getItem('staffToken');
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
  (response) => response,
  (error) => {
    // Just log the error but don't redirect automatically
    // Let components handle 401 errors themselves
    if (error.response?.status === 401) {
      console.log('Unauthorized access - authentication may be required');
    }
    return Promise.reject(error);
  }
);

export default api;