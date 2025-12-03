import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API = axios.create({ baseURL: `${API_BASE_URL}/inventory` });

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

// Items API
export const getItems = () => API.get("/getitems");
export const getItem = (id) => API.get(`/getOneitem/${id}`);
export const addItem = (data) => API.post("/additem", data);
export const updateItem = (id, data) => API.put(`/updateitem/${id}`, data);
export const deleteItem = (id) => API.delete(`/deleteitem/${id}`);

// Dashboard Stats API
export const getDashboardStats = () => API.get("/dashboard-stats");
