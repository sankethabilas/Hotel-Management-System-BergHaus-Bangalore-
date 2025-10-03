import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Staff Requests API
export const addRequest = (data: any) => API.post("/staff-requests/addrequest", data);
export const getRequests = () => API.get("/staff-requests/getrequests");
export const deleteRequest = (id: string) => API.delete(`/staff-requests/deleterequest/${id}`);
export const markRequestDone = (id: string) => API.put(`/staff-requests/markdone/${id}`);

// Inventory API for low stock alerts
export const getItems = () => API.get("/inventory/getitems");
