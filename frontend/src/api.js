
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/chat' });

// Pehle wale functions ko update karein
export const sendMessage = (messageData) => API.post('/send', messageData);
export const fetchHistory = (userId) => API.get(`/history?userId=${userId}`);
export const deleteChat = (userId) => API.delete(`/delete?userId=${userId}`);