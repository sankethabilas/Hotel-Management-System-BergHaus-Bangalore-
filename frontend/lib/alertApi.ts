import axios from "axios";

const API = axios.create({ 
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? (
      localStorage.getItem('adminToken') || 
      localStorage.getItem('staffToken') || 
      localStorage.getItem('authToken')
    ) : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - server took too long to respond');
    }
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || error.response.data?.message || `HTTP error! status: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Staff Requests API
export const addRequest = (data: any) => API.post("/staff-requests/addrequest", data);
export const getRequests = () => API.get("/staff-requests/getrequests");
export const deleteRequest = (id: string) => API.delete(`/staff-requests/deleterequest/${id}`);
export const markRequestDone = (id: string) => API.put(`/staff-requests/markdone/${id}`);

// Inventory API for low stock alerts
export const getItems = () => API.get("/inventory/getitems");
