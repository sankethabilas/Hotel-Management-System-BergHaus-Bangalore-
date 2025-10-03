import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api/inventory" });

// Items API
export const getItems = () => API.get("/getitems");
export const getItem = (id) => API.get(`/getOneitem/${id}`);
export const addItem = (data) => API.post("/additem", data);
export const updateItem = (id, data) => API.put(`/updateitem/${id}`, data);
export const deleteItem = (id) => API.delete(`/deleteitem/${id}`);

// Dashboard Stats API
export const getDashboardStats = () => API.get("/dashboard-stats");
