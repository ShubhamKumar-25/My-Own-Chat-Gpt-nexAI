import axios from 'axios';

// const API = axios.create({ baseURL: 'https://my-own-chat-gpt-nexai.onrender.com/api/chat' });
const API = axios.create({ baseURL: 'https://my-own-chat-gpt-nexai.onrender.com/api/chat' });

export const signup = (userData) => API.post('/signup', userData);
export const login = (userData) => API.post('/login', userData);

export const sendMessage = (messageData) => API.post('/send', messageData);
export const fetchHistory = (userId) => API.get(`/history?userId=${userId}`);
export const deleteChat = (userId) => API.delete(`/delete?userId=${userId}`);