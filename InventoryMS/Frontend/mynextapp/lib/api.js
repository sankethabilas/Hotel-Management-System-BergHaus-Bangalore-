import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

// Items API
export const getItems = () => API.get("/getitems");
export const getItem = (id) => API.get(`/getOneitem/${id}`);
export const addItem = (data) => API.post("/additem", data);
export const updateItem = (id, data) => API.put(`/updateitem/${id}`, data);
export const deleteItem = (id) => API.delete(`/deleteitem/${id}`);

// Staff Requests API
export const addRequest = (data) => API.post("/addrequest", data);
export const getRequests = () => API.get("/getrequests");
export const deleteRequest = (id) => API.delete(`/deleterequest/${id}`);
export const markRequestDone = (id) => API.put(`/markdone/${id}`);

